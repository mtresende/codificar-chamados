interface AssigneeAvatarProps {
  name: string;
  color: string;
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AssigneeAvatar({
  name,
  color,
}: AssigneeAvatarProps) {
  return (
    <div
      className={`flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold shrink-0 ${color}`}
    >
      {getInitials(name)}
    </div>
  );
}