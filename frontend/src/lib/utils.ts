import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a duration given in minutes into a human-readable string.
 * Examples: 0.5 → "30s", 3.2 → "3.2m", 90 → "1h 30m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return `${(minutes * 60).toFixed(0)}s`;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

/**
 * Format a speed value in Mbps with consistent precision.
 */
export function formatSpeed(mbps: number | null | undefined): string {
  if (mbps == null) return "—";
  return mbps.toFixed(1);
}

/**
 * Format a ping value in ms with consistent precision.
 */
export function formatPing(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return Math.round(ms).toString();
}

/**
 * Format a percentage value with consistent precision.
 */
export function formatPercent(pct: number | null | undefined, decimals = 1): string {
  if (pct == null) return "—";
  return pct.toFixed(decimals);
}

/**
 * Format a timestamp into a locale-appropriate date/time string.
 */
export function formatTimestamp(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Format a timestamp into a short time-only string.
 */
export function formatTime(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Get a relative "time ago" string from a Date or timestamp.
 */
export function timeAgo(date: Date | string | number): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
