export type Priority =
  | "low"
  | "medium"
  | "high";

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityLabels: Record<
  Priority,
  string
> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-slate-100 border-[#dbe3ee] text-slate-600",
  medium: "bg-amber-50 border-amber-200 text-amber-600",
  high: "bg-rose-50 border-rose-200 text-red-500",
};

export function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center py-[5px] px-[11px] rounded-full text-[13px] font-semibold whitespace-nowrap border ${priorityStyles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
}