interface StatusBadgeProps {
  status: string;
}

function getStatusKey(status: string) {
  switch (status) {
    case "open":
    case "OPEN":
    case "aberto":
      return "open";

    case "in_progress":
    case "IN_PROGRESS":
    case "em_andamento":
      return "in_progress";

    case "resolved":
    case "RESOLVED":
    case "resolvido":
      return "resolved";

    default:
      return "";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
    case "OPEN":
    case "aberto":
      return "Aberto";

    case "in_progress":
    case "IN_PROGRESS":
    case "em_andamento":
      return "Em andamento";

    case "resolved":
    case "RESOLVED":
    case "resolvido":
      return "Resolvido";

    default:
      return status;
  }
}

const statusStyles: Record<string, string> = {
  open: "bg-blue-50 border-blue-200 text-blue-600",
  in_progress: "bg-violet-50 border-violet-200 text-violet-600",
  resolved: "bg-emerald-50 border-emerald-200 text-emerald-600",
  "": "bg-transparent border-transparent text-slate-600",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const statusKey = getStatusKey(status);

  return (
    <span
      className={`inline-flex items-center justify-center py-[5px] px-[11px] rounded-full text-[13px] font-semibold whitespace-nowrap border ${statusStyles[statusKey]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}