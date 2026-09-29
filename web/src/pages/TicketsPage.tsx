import { useTickets } from "../hooks/useTickets";
import { useOutletContext } from "react-router-dom";

interface LayoutOutletContext {
  onNewTicket: () => void;
}

export function TicketsPage() {
  const { onNewTicket } = useOutletContext<LayoutOutletContext>();
  const ticketsQuery = useTickets();
  const tickets = ticketsQuery.data ?? [];
  const loading = ticketsQuery.isLoading;

  return (
    <div className="w-full py-8 px-10 box-border max-[700px]:py-6 max-[700px]:px-5">
      <header className="flex items-center justify-between gap-4 mb-7 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <h1 className="m-0 text-slate-900 text-[32px] font-bold">Chamados</h1>
          <p className="mt-2 mb-0 text-slate-500 text-[15px]">
            Acompanhe e gerencie os chamados internos.
          </p>
        </div>

        <button
          type="button"
          className="h-[46px] px-[18px] border-none rounded-[10px] bg-blue-600 text-white font-semibold transition-colors duration-200 hover:bg-blue-700"
          onClick={onNewTicket}
        >
          + Novo chamado
        </button>
      </header>

      <section className="py-6 px-7 bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {loading ? (
          <p className="m-0 text-slate-500">Carregando chamados...</p>
        ) : (
          <p className="m-0 text-slate-500">
            {tickets.length} chamados encontrados
          </p>
        )}
      </section>
    </div>
  );
}