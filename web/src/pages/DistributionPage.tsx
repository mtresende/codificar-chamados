import {
    BarChart3,
    Check,
} from "lucide-react";

import { useTickets } from "../hooks/useTickets";
import { useAssignees } from "../hooks/useAssignees";
import { useAssigneeWorkload } from "../hooks/useAssigneeWorkload";

import {
    WorkloadCard,
    type WorkloadPerson,
} from "../components/WorkloadCard";

import { AssigneeAvatar } from "../components/AssigneeAvatar";

interface DistributionPageProps {
    onNewTicket: (assigneeId?: number) => void;
}

const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700",
];

const DEFAULT_ROLE = "Responsável";

const MAX_ACTIVE_TICKETS = 10;

export function DistributionPage({
    onNewTicket,
}: DistributionPageProps) {

    const assigneesQuery = useAssignees();
    const workloadQuery = useAssigneeWorkload();
    const ticketsQuery = useTickets();

    const assignees = assigneesQuery.data ?? [];
    const workload = workloadQuery.data ?? [];
    const tickets = ticketsQuery.data ?? [];

    const people: WorkloadPerson[] = assignees.map(
        (assignee, index) => {
            const workloadEntry = workload.find(
                (item) => item.assignee_id === assignee.id
            );

            const open = tickets.filter(
                (ticket) =>
                    ticket.assignee_id === assignee.id &&
                    ticket.status === "open"
            ).length;

            const inProgress = tickets.filter(
                (ticket) =>
                    ticket.assignee_id === assignee.id &&
                    ticket.status === "in_progress"
            ).length;

            const resolved = tickets.filter(
                (ticket) =>
                    ticket.assignee_id === assignee.id &&
                    ticket.status === "resolved"
            ).length;

            const active =
                workloadEntry?.open_count ??
                open + inProgress;

            return {
                id: assignee.id,
                name: assignee.name,
                role:
                    "role" in assignee
                        ? String(assignee.role)
                        : DEFAULT_ROLE,
                active,
                open,
                inProgress,
                resolved,
                avatarColor:
                    AVATAR_COLORS[index % AVATAR_COLORS.length],
            };
        }
    );

    const suggestedPerson = [...people].sort(
        (a, b) => a.active - b.active
    )[0];

    const freeCapacity = suggestedPerson
        ? Math.max(
            0,
            Math.round(
                ((MAX_ACTIVE_TICKETS -
                    suggestedPerson.active) /
                    MAX_ACTIVE_TICKETS) *
                100
            )
        )
        : 0;

    const isBalanced =
        people.length > 0 &&
        people.every(
            (person) =>
                person.active === people[0].active
        );

    const loading =
        assigneesQuery.isLoading ||
        workloadQuery.isLoading ||
        ticketsQuery.isLoading;

    return (
        <div className="w-full py-8 px-10 box-border max-[1000px]:py-6 max-[1000px]:px-6 max-[700px]:py-5 max-[700px]:px-4">

            <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-5 items-start max-[1100px]:grid-cols-1">

                <section className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">

                    <div className="py-6 px-7 border-b border-[#eef2f7]">
                        <h2 className="m-0 text-slate-900 text-xl font-bold">
                            Carga de trabalho da equipe
                        </h2>

                        <p className="mt-1.5 mb-0 text-slate-500 text-sm">
                            Distribuição atual de chamados por responsável
                        </p>
                    </div>

                    <div className="px-7">

                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                Carregando carga da equipe...
                            </div>
                        ) : people.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                Nenhum responsável cadastrado.
                            </div>
                        ) : (
                            people.map((person) => (
                                <WorkloadCard
                                    key={person.id}
                                    person={person}
                                />
                            ))
                        )}

                    </div>

                    <div className="flex items-center gap-6 py-5 px-7 border-t border-slate-100">
                        <span className="flex items-center gap-2 text-slate-500 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            Chamados abertos
                        </span>

                        <span className="flex items-center gap-2 text-slate-500 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            Em andamento
                        </span>
                    </div>

                </section>

                <aside className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6">

                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600">
                            <BarChart3 size={20} />
                        </div>

                        <h2 className="m-0 text-slate-900 text-lg font-bold">
                            Sugestão de distribuição
                        </h2>
                    </div>

                    <p className="m-0 text-slate-500 text-sm leading-[1.6]">
                        O próximo chamado pode ser atribuído ao
                        responsável com a menor quantidade de
                        chamados ativos no momento.
                    </p>

                    {isBalanced ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">

                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600">
                                <Check
                                    size={30}
                                    strokeWidth={2.5}
                                />
                            </div>

                            <h3 className="mt-4 mb-0 text-slate-900 text-base font-semibold">
                                Distribuição equilibrada
                            </h3>

                            <p className="mt-2 mb-0 text-slate-500 text-sm leading-[1.5]">
                                Os chamados estão distribuídos
                                corretamente entre os responsáveis.
                            </p>

                        </div>
                    ) : suggestedPerson ? (
                        <>
                            <div className="mt-6 p-5 border border-blue-100 rounded-xl bg-blue-50/40">

                                <div className="flex items-center gap-3.5">
                                    <AssigneeAvatar
                                        name={suggestedPerson.name}
                                        color={suggestedPerson.avatarColor}
                                    />

                                    <div className="min-w-0">
                                        <strong className="block text-slate-800 text-[15px] font-semibold truncate">
                                            {suggestedPerson.name}
                                        </strong>

                                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white border border-blue-100 text-blue-600 text-[11px] font-semibold">
                                            Menor carga atual
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-blue-100">

                                    <div>
                                        <span className="block text-slate-400 text-xs">
                                            Chamados ativos
                                        </span>

                                        <strong className="block mt-1 text-slate-800 text-lg">
                                            {suggestedPerson.active}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="block text-slate-400 text-xs">
                                            Capacidade livre
                                        </span>

                                        <strong className="block mt-1 text-emerald-600 text-lg">
                                            {freeCapacity}%
                                        </strong>
                                    </div>

                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    onNewTicket(suggestedPerson.id);
                                }}
                                className="flex items-center justify-center gap-2 w-full h-12 mt-5 rounded-[10px] border-none bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
                            >
                                Atribuir próximo chamado
                            </button>

                            <p className="mt-3 text-center text-slate-400 text-xs leading-[1.5]">
                                A atribuição automática também pode ser ativada ao criar um chamado
                            </p>
                        </>
                    ) : (
                        <div className="py-10 text-center text-slate-400 text-sm">
                            Nenhum responsável disponível para distribuição.
                        </div>
                    )}

                </aside>

            </div>
        </div>
    );
}