import asyncio
import logging
from typing import Callable, Awaitable

logger = logging.getLogger(__name__)

job_queue = asyncio.Queue()

async def worker(worker_id: int):
    """Consumes and executes jobs from the queue."""
    logger.info(f"Worker {worker_id} started")
    while True:
        try:
            job = await job_queue.get()
            try:
                await job()
            except Exception as e:
                logger.error(f"Job execution error in worker {worker_id}: {e}", exc_info=True)
            finally:
                job_queue.task_done()
        except asyncio.CancelledError:
            logger.info(f"Worker {worker_id} cancelled")
            break
        except Exception as e:
            logger.error(f"Worker {worker_id} loop error: {e}")


async def _producer(
    job_func: Callable[[], Awaitable],
    default_interval: int,
    run_immediately: bool = False,
    interval_getter: Callable[[], Awaitable[int]] | None = None,
):
    """
    Produces jobs at a configurable interval.
    
    If interval_getter is provided, it is called before each sleep to get
    the current interval from the database. This allows runtime changes
    to take effect without restarting the server.
    """
    job_name = job_func.__name__
    
    if run_immediately:
        logger.info(f"[Producer:{job_name}] Running immediately")
        await job_queue.put(job_func)
        
    while True:
        # Re-read interval from DB if a getter is provided
        if interval_getter:
            try:
                interval = await interval_getter()
            except Exception:
                interval = default_interval
        else:
            interval = default_interval
        
        logger.debug(f"[Producer:{job_name}] Sleeping {interval}s until next run")
        await asyncio.sleep(interval)
        logger.info(f"[Producer:{job_name}] Queuing job (interval was {interval}s)")
        await job_queue.put(job_func)


class QueueManager:
    def __init__(self):
        self.workers = []
        self.producers = []

    def start(self, num_workers: int = 3):
        """Starts the worker pool."""
        for i in range(num_workers):
            self.workers.append(asyncio.create_task(worker(i)))

    def schedule_job(
        self,
        job_func: Callable[[], Awaitable],
        interval_sec: int,
        run_immediately: bool = False,
        interval_getter: Callable[[], Awaitable[int]] | None = None,
    ):
        """
        Schedules a recurring job.
        
        Args:
            job_func: The async function to run.
            interval_sec: Default interval in seconds (used as fallback).
            run_immediately: If True, run the job once immediately.
            interval_getter: Optional async callable that returns the current
                             interval from the database. Called before each sleep.
        """
        self.producers.append(
            asyncio.create_task(
                _producer(job_func, interval_sec, run_immediately, interval_getter)
            )
        )

    def shutdown(self):
        """Cancels all workers and producers."""
        for p in self.producers:
            p.cancel()
        for w in self.workers:
            w.cancel()

queue_manager = QueueManager()
