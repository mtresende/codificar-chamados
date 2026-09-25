import "./StatusBadge.css";

interface StatusBadgeProps {
  status: string;
}

function getStatusClass(status: string) {
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

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`status-badge ${getStatusClass(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}