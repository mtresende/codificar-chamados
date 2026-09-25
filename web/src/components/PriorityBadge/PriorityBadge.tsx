import "./PriorityBadge.css";

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

export function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <span
      className={`priority-badge ${priority}`}
    >
      {priorityLabels[priority]}
    </span>
  );
}