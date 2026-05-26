interface StatusBadgeProps {
  status: "connected" | "disconnected" | "warning" | "info";
  label: string;
  size?: "sm" | "md";
}

const badgeStyles = {
  connected: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
  disconnected: "bg-accent-red/10 text-accent-red border-accent-red/20",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
};

const dotStyles = {
  connected: "bg-accent-emerald",
  disconnected: "bg-accent-red",
  warning: "bg-accent-amber",
  info: "bg-accent-cyan",
};

export default function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${sizeClasses} ${badgeStyles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {label}
    </span>
  );
}
