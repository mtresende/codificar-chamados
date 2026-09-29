import type { TicketPriority } from "../types/ticket";

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const priorityLabels: Record<
  TicketPriority,
  string
> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const priorityStyles: Record<TicketPriority, string> = {
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