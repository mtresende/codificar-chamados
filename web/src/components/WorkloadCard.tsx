import { AssigneeAvatar } from "./AssigneeAvatar";

export interface WorkloadPerson {
  id: number;
  name: string;
  active: number;
  open: number;
  inProgress: number;
  resolved: number;
  avatarColor: string;
}

interface WorkloadCardProps {
  person: WorkloadPerson;
}

export function WorkloadCard({
  person,
}: WorkloadCardProps) {
  const totalActive =
    person.open + person.inProgress;

  const totalForBar =
    Math.max(totalActive, 1);

  const openPercentage =
    (person.open / totalForBar) * 100;

  const inProgressPercentage =
    (person.inProgress / totalForBar) * 100;

  return (
    <div className="grid grid-cols-[minmax(220px,1fr)_minmax(260px,1.4fr)_130px] items-center gap-8 py-5 border-b border-slate-100 last:border-b-0 max-[900px]:grid-cols-1 max-[900px]:gap-4">

      <div className="flex items-center gap-3.5 min-w-0">
        <AssigneeAvatar
          name={person.name}
          color={person.avatarColor}
        />

        <div className="min-w-0">
          <strong className="block text-slate-800 text-[15px] font-semibold truncate">
            {person.name}
          </strong>

          <span className="block mt-0.5 text-slate-400 text-[13px]">
            Responsável
          </span>
        </div>
      </div>


      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-xs">
            Carga atual
          </span>

          <span className="text-slate-700 text-xs font-semibold">
            {totalActive} ativos
          </span>
        </div>

        <div className="flex w-full h-2.5 overflow-hidden rounded-full bg-slate-100">
          {person.open > 0 && (
            <div
              className="h-full bg-blue-500"
              style={{
                width: `${openPercentage}%`,
              }}
            />
          )}

          {person.inProgress > 0 && (
            <div
              className="h-full bg-slate-200"
              style={{
                width: `${inProgressPercentage}%`,
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-5 mt-2">
          <span className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />

            {person.open} abertos
          </span>

          <span className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-200" />

            {person.inProgress} em andamento
          </span>
        </div>
      </div>

      <div className="text-right max-[900px]:text-left">
        <div>
          <strong className="text-slate-800 text-[15px]">
            {person.active}
          </strong>

          <span className="ml-1 text-slate-400 text-xs">
            ativos
          </span>
        </div>

        <div className="mt-1">
          <strong className="text-emerald-600 text-[15px]">
            {person.resolved}
          </strong>

          <span className="ml-1 text-slate-400 text-xs">
            resolvidos
          </span>
        </div>
      </div>
    </div>
  );
}