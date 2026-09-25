import { TicketTable } from "../../components/TicketTable/TicketTable";
import { useTickets } from "../../hooks/useTickets";
import { useAssignees } from "../../hooks/useAssignees";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteTicket } from "../../api/tickets";
import { assigneesQueryKey, ticketsQueryKey } from "../../api/queryKeys";
import { ConfirmDeleteTicketModal } from "../../components/ConfirmDeleteTicketModal/ConfirmDeleteTicketModal";
import type { Ticket } from "../../types/ticket";

import "./DashboardPage.css";

export function DashboardPage() {
  const ticketsQuery = useTickets();
  const assigneesQuery = useAssignees();
  const queryClient = useQueryClient();
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const tickets = ticketsQuery.data ?? [];
  const assignees = assigneesQuery.data ?? [];
  const loading = ticketsQuery.isLoading;
  const errorMessage = ticketsQuery.error?.message ?? "";

  const deleteTicketMutation = useMutation({
    mutationFn: deleteTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
      await queryClient.invalidateQueries({ queryKey: assigneesQueryKey });
      setTicketToDelete(null);
    },
  });

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
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Visão geral dos chamados da equipe.
          </p>
        </div>

      </div>

      <div className="dashboard-stats">

        <div className="dashboard-stat-card">
          <span>Total de chamados</span>

          <strong>
            {totalTickets}
          </strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Abertos</span>

          <strong>
            {openTickets}
          </strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Em andamento</span>

          <strong>
            {inProgressTickets}
          </strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Resolvidos</span>

          <strong>
            {resolvedTickets}
          </strong>
        </div>

      </div>

      <section className="dashboard-card">

        <div className="dashboard-card-header">

          <div>
            <h2>
              Chamados recentes
            </h2>

            <p>
              Visualize e acompanhe as solicitações da equipe.
            </p>
          </div>

        </div>

        {loading && (
          <div className="dashboard-loading">
            Carregando chamados...
          </div>
        )}

        {errorMessage && (
          <div className="dashboard-error">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <TicketTable
            tickets={tickets}
            assignees={assignees}
            onDeleteTicket={(ticket) => setTicketToDelete(ticket)}
          />
        )}

      </section>

      {ticketToDelete && (
        <ConfirmDeleteTicketModal
          ticketTitle={ticketToDelete.title}
          ticketId={ticketToDelete.id}
          loading={deleteTicketMutation.isPending}
          onClose={() => setTicketToDelete(null)}
          onConfirm={async () => {
            await deleteTicketMutation.mutateAsync(ticketToDelete.id);
          }}
        />
      )}

    </div>
  );
}