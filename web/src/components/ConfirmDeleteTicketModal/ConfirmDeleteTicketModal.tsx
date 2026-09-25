import { AlertTriangle, X } from "lucide-react";

import "../CreateTicketModal/CreateTicketModal.css";
import "./ConfirmDeleteTicketModal.css";

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
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="create-ticket-modal confirm-delete-modal">
        <div className="modal-header">
          <div>
            <h2>Excluir chamado</h2>

            <p>
              Confirme a exclusão permanente deste chamado.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body confirm-delete-body">
          <div className="confirm-delete-warning">
            <AlertTriangle size={18} />

            <p>
              Você está prestes a excluir o chamado <strong>CH-{ticketId}</strong> – {ticketTitle}.
            </p>
          </div>

          <p className="confirm-delete-note">
            Essa ação não pode ser desfeita.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}