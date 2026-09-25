import { useTickets } from "../../hooks/useTickets";
import { useOutletContext } from "react-router-dom";

interface LayoutOutletContext {
  onNewTicket: () => void;
}

import "./TicketsPage.css";

export function TicketsPage() {
  const { onNewTicket } = useOutletContext<LayoutOutletContext>();
  const ticketsQuery = useTickets();
  const tickets = ticketsQuery.data ?? [];
  const loading = ticketsQuery.isLoading;

  return (
    <div className="tickets-page">
      <header className="tickets-page-header">
        <div>
          <h1>Chamados</h1>
          <p>
            Acompanhe e gerencie os chamados internos.
          </p>
        </div>

        <button
          type="button"
          className="tickets-page-action"
          onClick={onNewTicket}
        >
          + Novo chamado
        </button>
      </header>

      <section className="tickets-page-card">
        {loading ? (
          <p className="tickets-page-message">Carregando chamados...</p>
        ) : (
          <p className="tickets-page-message">
            {tickets.length} chamados encontrados
          </p>
        )}
      </section>
    </div>
  );
}