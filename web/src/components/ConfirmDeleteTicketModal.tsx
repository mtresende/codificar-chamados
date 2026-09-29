import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteTicketModalProps {
  ticketId: number;
  ticketTitle: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteTicketModal({
  ticketId,
  ticketTitle,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteTicketModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center p-6 z-[100] max-[600px]:p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[560px] max-h-[calc(100vh-48px)] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.2)] max-[600px]:max-h-[calc(100vh-24px)]">
        <div className="flex items-start justify-between py-[26px] px-7 border-b border-slate-200 max-[600px]:p-5">
          <div>
            <h2 className="m-0 mb-[5px] text-slate-900 text-2xl leading-[1.2]">
              Excluir chamado
            </h2>

            <p className="m-0 text-slate-500 text-base">
              Confirme a exclusão permanente deste chamado.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-[34px] h-[34px] border-none bg-transparent text-slate-500 rounded-lg hover:bg-slate-100"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-7 max-[600px]:p-5 flex flex-col gap-[18px]">
          <div className="flex items-start gap-3 p-4 border border-red-200 rounded-xl bg-red-50 text-red-800">
            <AlertTriangle size={18} />

            <p className="m-0 text-inherit text-[15px] leading-normal">
              Você está prestes a excluir o chamado <strong>CH-{ticketId}</strong> – {ticketTitle}.
            </p>
          </div>

          <p className="m-0 text-slate-500 text-sm">
            Essa ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 py-[18px] px-7 bg-slate-50 border-t border-slate-200 max-[600px]:py-4 max-[600px]:px-5 max-[600px]:flex-col-reverse">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-[46px] px-[18px] rounded-[10px] font-semibold border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed max-[600px]:w-full"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-[46px] px-[18px] rounded-[10px] font-semibold border-none bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed max-[600px]:w-full"
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}