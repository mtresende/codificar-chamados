import { useState } from "react";

import { TicketTable } from "../components/TicketTable";
import { ConfirmDeleteTicketModal } from "../components/ConfirmDeleteTicketModal";
import { TicketDetailsModal } from "../components/TicketDetailsModal";
import { ChangeStatusModal } from "../components/ChangeStatusModal";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { useTickets } from "../hooks/useTickets";
import { useAssignees } from "../hooks/useAssignees";
import { useUpdateTicket, useChangeTicketStatus } from "../hooks/useTicketMutations";
import { useDeleteTicket } from "../hooks/useDeleteTicket";
import type { Ticket } from "../types/ticket";

export function DashboardPage() {
  const ticketsQuery = useTickets();
  const assigneesQuery = useAssignees();
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [ticketToView, setTicketToView] = useState<Ticket | null>(null);
  const [ticketToChangeStatus, setTicketToChangeStatus] = useState<Ticket | null>(null);

  const deleteTicketMutation = useDeleteTicket();
  const updateTicketMutation = useUpdateTicket();
  const changeStatusMutation = useChangeTicketStatus();

  const tickets = ticketsQuery.data ?? [];
  const assignees = assigneesQuery.data ?? [];
  const loading = ticketsQuery.isLoading;
  const errorMessage = ticketsQuery.error?.message ?? "";

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "in_progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  ).length;

  return (
    <div className="w-full py-8 px-10 box-border max-[700px]:py-6 max-[700px]:px-5">

      <div className="grid grid-cols-4 gap-[18px] mb-7 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">

        <div className="p-[22px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <span className="block mb-2.5 text-slate-500 text-sm">Total de chamados</span>

          <strong className="text-slate-900 text-[28px] font-bold">
            {totalTickets}
          </strong>
        </div>

        <div className="p-[22px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <span className="block mb-2.5 text-slate-500 text-sm">Abertos</span>

          <strong className="text-slate-900 text-[28px] font-bold">
            {openTickets}
          </strong>
        </div>

        <div className="p-[22px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <span className="block mb-2.5 text-slate-500 text-sm">Em andamento</span>

          <strong className="text-slate-900 text-[28px] font-bold">
            {inProgressTickets}
          </strong>
        </div>

        <div className="p-[22px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <span className="block mb-2.5 text-slate-500 text-sm">Resolvidos</span>

          <strong className="text-slate-900 text-[28px] font-bold">
            {resolvedTickets}
          </strong>
        </div>

      </div>

      <section className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

        <div className="py-6 px-7 border-b border-[#eef2f7]">

          <div>
            <h2 className="m-0 text-slate-900 text-xl font-bold">
              Chamados recentes
            </h2>

            <p className="mt-1.5 mb-0 text-slate-500 text-sm">
              Visualize e acompanhe as solicitações da equipe.
            </p>
          </div>

        </div>

        {loading && (
          <div className="p-10 text-slate-500 text-center">
            Carregando chamados...
          </div>
        )}

        {errorMessage && (
          <div className="mx-7 my-5 py-3.5 px-4 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <TicketTable
            tickets={tickets}
            assignees={assignees}
            onViewTicket={(ticket) => setTicketToView(ticket)}
            onDeleteTicket={(ticket) => setTicketToDelete(ticket)}
            onEditTicket={(ticket) => setTicketToEdit(ticket)}
          />
        )}

      </section>

      {ticketToEdit && (
        <CreateTicketModal
          ticket={ticketToEdit}
          onClose={() => setTicketToEdit(null)}
          onSubmit={async (data) => {
            await updateTicketMutation.mutateAsync({
              id: ticketToEdit.id,
              data,
              status: ticketToEdit.status,
            });
            setTicketToEdit(null);
          }}
        />
      )}

      {ticketToDelete && (
        <ConfirmDeleteTicketModal
          ticketTitle={ticketToDelete.title}
          ticketId={ticketToDelete.id}
          loading={deleteTicketMutation.isPending}
          onClose={() => setTicketToDelete(null)}
          onConfirm={async () => {
            setTicketToDelete(null);
            await deleteTicketMutation.mutateAsync(ticketToDelete.id);
          }}
        />
      )}

      {ticketToView && (
        <TicketDetailsModal
          ticket={ticketToView}
          assignees={assignees}
          onClose={() => setTicketToView(null)}
          onEdit={() => {
            setTicketToEdit(ticketToView);
            setTicketToView(null);
          }}
          onChangeStatus={() => {
            setTicketToChangeStatus(ticketToView);
            setTicketToView(null);
          }}
        />
      )}

      {ticketToChangeStatus && (
        <ChangeStatusModal
          ticket={ticketToChangeStatus}
          loading={changeStatusMutation.isPending}
          onClose={() => setTicketToChangeStatus(null)}
          onSave={async (status) => {
            await changeStatusMutation.mutateAsync({
              ticket: ticketToChangeStatus,
              status,
            });
            setTicketToChangeStatus(null);
            setTicketToView(null);
          }}
        />
      )}

    </div>
  );
}
