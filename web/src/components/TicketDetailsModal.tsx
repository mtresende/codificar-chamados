import { Pencil, X } from "lucide-react";

import type { Assignee } from "../types/assignee";
import type { Ticket } from "../types/ticket";

import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface TicketDetailsModalProps {
  ticket: Ticket;
  assignees: Assignee[];
  onClose: () => void;
  onEdit: () => void;
  onChangeStatus: () => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketDetailsModal({
  ticket,
  assignees,
  onClose,
  onEdit,
  onChangeStatus,
}: TicketDetailsModalProps) {
  const assigneeName =
    assignees.find((assignee) => assignee.id === ticket.assignee_id)?.name ??
    (ticket.assignee_id
      ? `Responsável ${ticket.assignee_id}`
      : "Não atribuído");

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center p-6 z-[100] max-[600px]:p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[680px] max-h-[calc(100vh-48px)] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.2)] max-[600px]:max-h-[calc(100vh-24px)]">

        <div className="flex items-start justify-between py-[26px] px-7 border-b border-slate-200 max-[600px]:p-5">
          <div>
            <span className="block mb-2 text-blue-600 text-sm font-bold">
              CH-{ticket.id}
            </span>

            <h2 className="m-0 text-slate-900 text-2xl leading-[1.2] font-bold">
              {ticket.title}
            </h2>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-[34px] h-[34px] border-none bg-transparent text-slate-500 rounded-lg hover:bg-slate-100 cursor-pointer"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="p-7 max-[600px]:p-5">

          <div className="flex items-center gap-2 mb-8">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="mb-8">
            <h3 className="m-0 mb-3 text-slate-800 text-base font-bold">
              Descrição
            </h3>

            <p className="m-0 text-slate-500 text-base leading-[1.7]">
              {ticket.description}
            </p>
          </div>

          <div className="p-[22px] border border-[#dbe3ee] rounded-xl bg-slate-50/50">
            <h3 className="m-0 mb-5 text-slate-800 text-base font-bold">
              Informações do chamado
            </h3>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
              <div>
                <span className="block mb-1.5 text-slate-400 text-sm">
                  Responsável
                </span>

                <strong className="text-slate-800 text-[15px]">
                  {assigneeName}
                </strong>
              </div>

              <div>
                <span className="block mb-1.5 text-slate-400 text-sm">
                  Data de abertura
                </span>

                <strong className="text-slate-800 text-[15px]">
                  {formatDate(ticket.opened_at)}
                </strong>
              </div>

              <div>
                <span className="block mb-1.5 text-slate-400 text-sm">
                  Última atualização
                </span>

                <strong className="text-slate-800 text-[15px]">
                  {formatDate(ticket.updated_at)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 py-[18px] px-7 bg-slate-50 border-t border-slate-200 max-[600px]:py-4 max-[600px]:px-5 max-[600px]:flex-col-reverse">
          <button
            type="button"
            onClick={onChangeStatus}
            className="h-[46px] px-[18px] rounded-[10px] font-semibold border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer max-[600px]:w-full"
          >
            Alterar status
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="h-[46px] px-[18px] rounded-[10px] font-semibold border-none bg-blue-600 text-white hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-2 max-[600px]:w-full"
          >
            <Pencil size={17} />
            Editar chamado
          </button>
        </div>
      </div>
    </div>
  );
}