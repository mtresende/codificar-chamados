import {
  Trash,
  Pencil,
  Search,
} from "lucide-react";

import type { Assignee } from "../types/assignee";
import type { Ticket } from "../types/ticket";

import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface TicketTableProps {
  tickets: Ticket[];
  assignees: Assignee[];
  onDeleteTicket: (ticket: Ticket) => void;
}

const columns = [
  { key: "ticket", label: "CHAMADO", width: "w-[30%]" },
  { key: "priority", label: "PRIORIDADE", width: "w-[13%]" },
  { key: "status", label: "STATUS", width: "w-[14%]" },
  { key: "assignee", label: "RESPONSÁVEL", width: "w-[17%]" },
  { key: "opened_at", label: "ABERTURA", width: "w-[16%]" },
  { key: "actions", label: "AÇÕES", width: "w-[10%] text-right" },
];

const selectClasses =
  "w-[180px] h-[46px] px-3.5 border border-[#dbe3ef] rounded-[10px] bg-white text-slate-700 text-sm outline-none cursor-pointer focus:border-blue-600";

export function TicketTable({
  tickets,
  assignees,
  onDeleteTicket,
}: TicketTableProps) {
  function getAssigneeName(ticketAssigneeId: number | null) {
    if (!ticketAssigneeId) {
      return "Não atribuído";
    }

    return (
      assignees.find((assignee) => assignee.id === ticketAssigneeId)?.name ??
      `Responsável ${ticketAssigneeId}`
    );
  }

  return (
    <div className="w-full">

      {/* Filtros */}

      <div className="flex items-center gap-[14px] py-5 px-7 border-b border-[#eef2f7] bg-white">

        <div className="relative flex items-center flex-1 h-[46px] border border-[#dbe3ef] rounded-[10px] bg-white text-slate-400 focus-within:border-blue-600">
          <Search size={17} className="ml-[15px] shrink-0" />

          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            className="w-full h-full px-3.5 border-none outline-none bg-transparent text-slate-700 text-sm placeholder:text-slate-400"
          />
        </div>

        <select className={selectClasses}>
          <option value="">
            Todos os status
          </option>

          <option value="open">
            Aberto
          </option>

          <option value="in_progress">
            Em andamento
          </option>

          <option value="resolved">
            Resolvido
          </option>

          <option value="closed">
            Fechado
          </option>
        </select>

        <select className={selectClasses}>
          <option value="">
            Prioridade
          </option>

          <option value="high">
            Alta
          </option>

          <option value="medium">
            Média
          </option>

          <option value="low">
            Baixa
          </option>
        </select>

        <select className={selectClasses}>
          <option value="">
            Responsável
          </option>
        </select>

      </div>

      {/* Tabela */}

      <div className="w-full overflow-x-auto bg-white">

        <table className="w-full min-w-[900px] border-collapse table-fixed">

          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-[15px] px-[18px] border-t border-b border-[#eef2f7] text-slate-500 text-xs font-bold tracking-[0.5px] text-left whitespace-nowrap ${column.width}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {tickets.length === 0 ? (

              <tr>
                <td
                  colSpan={columns.length}
                  className="py-[18px] px-[18px] text-center text-slate-500"
                >
                  Nenhum chamado encontrado.
                </td>
              </tr>

            ) : (

              tickets.map((ticket) => (

                <tr key={ticket.id} className="hover:bg-slate-50">

                  {/* Chamado */}

                  <td className="p-[18px] border-b border-[#eef2f7] text-slate-600 text-sm align-middle">
                    <div className="flex flex-col gap-1">

                      <strong className="text-slate-900 text-[15px] font-semibold">
                        {ticket.title}
                      </strong>

                      <span className="text-slate-400 text-[13px]">
                        CH-{ticket.id}
                      </span>

                    </div>
                  </td>

                  {/* Prioridade */}

                  <td className="p-[18px] border-b border-[#eef2f7] text-slate-600 text-sm align-middle">
                    <PriorityBadge
                      priority={ticket.priority}
                    />
                  </td>

                  {/* Status */}

                  <td className="p-[18px] border-b border-[#eef2f7] text-slate-600 text-sm align-middle">
                    <StatusBadge
                      status={ticket.status}
                    />
                  </td>

                  {/* Responsável */}

                  <td className="p-[18px] border-b border-[#eef2f7] text-slate-600 text-sm align-middle">
                    <div className="flex items-center gap-2.5 whitespace-nowrap">

                      <span>
                        {getAssigneeName(ticket.assignee_id)}
                      </span>

                    </div>
                  </td>

                  <td className="p-[18px] border-b border-[#eef2f7] text-slate-600 text-sm align-middle">
                    <span className="text-slate-500 whitespace-nowrap">
                      {new Date(
                        ticket.opened_at
                      ).toLocaleString(
                        "pt-BR"
                      )}
                    </span>
                  </td>

                  <td className="p-[18px] border-b border-[#eef2f7] text-slate-600 text-sm align-middle">
                    <div className="flex items-center justify-end gap-2">

                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border-none rounded-lg bg-transparent text-slate-500 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => onDeleteTicket(ticket)}
                        title="Excluir chamado"
                      >
                        <Trash size={17} />
                      </button>

                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border-none rounded-lg bg-transparent text-slate-500 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                        title="Editar chamado"
                      >
                        <Pencil size={17} />
                      </button>

                    </div>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}