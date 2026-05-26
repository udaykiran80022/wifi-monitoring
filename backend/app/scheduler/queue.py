import asyncio
import logging

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

async def _producer(interval: int, job_func, run_immediately: bool = False):
    """Produces jobs at a fixed interval."""
    if run_immediately:
        await job_queue.put(job_func)
        
    while True:
        await asyncio.sleep(interval)
        await job_queue.put(job_func)

class QueueManager:
    def __init__(self):
        self.workers = []
        self.producers = []

    def start(self, num_workers: int = 3):
        """Starts the worker pool."""
        for i in range(num_workers):
            self.workers.append(asyncio.create_task(worker(i)))

    def schedule_job(self, job_func, interval_sec: int, run_immediately: bool = False):
        """Schedules a recurring job."""
        self.producers.append(
            asyncio.create_task(_producer(interval_sec, job_func, run_immediately))
        )

    def shutdown(self):
        """Cancels all workers and producers."""
        for p in self.producers:
            p.cancel()
        for w in self.workers:
            w.cancel()

queue_manager = QueueManager()
