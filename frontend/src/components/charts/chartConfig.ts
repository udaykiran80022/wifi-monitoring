/**
 * Shared chart configuration — centralizes theme, tooltip, and axis styling
 * that was previously duplicated across all chart components.
 */

// ─── Colors ───
export const chartColors = {
  cyan: "#00d4ff",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  grid: "rgba(255,255,255,0.04)",
  axis: "#475569",
  tick: "#64748b",
  label: "#64748b",
} as const;

// ─── Shared Tooltip Style ───
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f1629",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "8px",
    fontSize: "12px",
    fontFamily: "JetBrains Mono, monospace",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  labelStyle: {
    color: "#94a3b8",
  },
} as const;

// ─── Shared Axis Props ───
export const axisDefaults = {
  stroke: chartColors.axis,
  fontSize: 11,
  fontFamily: "JetBrains Mono",
  tick: { fill: chartColors.tick },
} as const;

export const gridDefaults = {
  strokeDasharray: "3 3",
  stroke: chartColors.grid,
} as const;

// ─── Chart Margins ───
export const chartMargin = {
  top: 5,
  right: 20,
  left: 0,
  bottom: 5,
} as const;

// ─── Legend Style ───
export const legendStyle = {
  fontSize: "12px",
  fontFamily: "Inter",
} as const;

/**
 * Create Y-axis label config for a given unit.
 */
export function yAxisLabel(unit: string) {
  return {
    value: unit,
    angle: -90,
    position: "insideLeft" as const,
    fill: chartColors.label,
    fontSize: 11,
  };
}
