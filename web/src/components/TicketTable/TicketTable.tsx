import {
  Trash,
  Pencil,
  Search,
} from "lucide-react";

import type { Assignee } from "../../types/assignee";
import type { Ticket } from "../../types/ticket";

import { PriorityBadge } from "../PriorityBadge/PriorityBadge";
import { StatusBadge } from "../StatusBadge/StatusBadge";

import "./TicketTable.css";

interface TicketTableProps {
  tickets: Ticket[];
  assignees: Assignee[];
  onDeleteTicket: (ticket: Ticket) => void;
}

const columns = [
  { key: "ticket", label: "CHAMADO" },
  { key: "priority", label: "PRIORIDADE" },
  { key: "status", label: "STATUS" },
  { key: "assignee", label: "RESPONSÁVEL" },
  { key: "opened_at", label: "ABERTURA" },
  { key: "actions", label: "AÇÕES" },
];

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
    <div className="ticket-table-wrapper">

      {/* Filtros */}

      <div className="ticket-filters">

        <div className="ticket-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
          />
        </div>

        <select>
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

        <select>
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

        <select>
          <option value="">
            Responsável
          </option>
        </select>

      </div>

      {/* Tabela */}

      <div className="ticket-table">

        <table>

          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>

            {tickets.length === 0 ? (

              <tr>
                <td
                  colSpan={columns.length}
                  className="ticket-empty"
                >
                  Nenhum chamado encontrado.
                </td>
              </tr>

            ) : (

              tickets.map((ticket) => (

                <tr key={ticket.id}>

                  {/* Chamado */}

                  <td>
                    <div className="ticket-title">

                      <strong>
                        {ticket.title}
                      </strong>

                      <span>
                        CH-{ticket.id}
                      </span>

                    </div>
                  </td>

                  {/* Prioridade */}

                  <td>
                    <PriorityBadge
                      priority={ticket.priority}
                    />
                  </td>

                  {/* Status */}

                  <td>
                    <StatusBadge
                      status={ticket.status}
                    />
                  </td>

                  {/* Responsável */}

                  <td>
                    <div className="ticket-assignee">

                      <span>
                        {getAssigneeName(ticket.assignee_id)}
                      </span>

                    </div>
                  </td>

                  <td>
                    <span className="ticket-date">
                      {new Date(
                        ticket.opened_at
                      ).toLocaleString(
                        "pt-BR"
                      )}
                    </span>
                  </td>

                  <td>
                    <div className="ticket-actions">

                      <button
                        type="button"
                        className="ticket-action-button"
                        onClick={() => onDeleteTicket(ticket)}
                        title="Excluir chamado"
                      >
                        <Trash size={17} />
                      </button>

                      <button
                        type="button"
                        className="ticket-action-button"
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