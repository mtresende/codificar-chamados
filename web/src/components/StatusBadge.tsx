import type { TicketStatus } from "../types/ticket";

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusLabels: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-50 border-blue-200 text-blue-600",
  in_progress: "bg-violet-50 border-violet-200 text-violet-600",
  resolved: "bg-emerald-50 border-emerald-200 text-emerald-600",
  closed: "bg-slate-100 border-slate-200 text-slate-600",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center py-[5px] px-[11px] rounded-full text-[13px] font-semibold whitespace-nowrap border ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
