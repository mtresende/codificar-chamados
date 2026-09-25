import { useState } from "react";
import { Clock, X } from "lucide-react";

import { useAssignees } from "../../hooks/useAssignees";

import "./CreateTicketModal.css";

export interface CreateTicketData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee_id: number;
}

interface CreateTicketModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTicketData) => Promise<void>;
}

export function CreateTicketModal({
  onClose,
  onSubmit,
}: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] =
    useState<"low" | "medium" | "high">("low");

  const [assigneeId, setAssigneeId] = useState("");

  const { data: assignees = [], isLoading: loadingAssignees } = useAssignees();

  const [autoAssign, setAutoAssign] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee_id: autoAssign
          ? 0
          : Number(assigneeId),
      });
    } catch (error) {
      console.error(
        "Erro ao criar chamado:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="create-ticket-modal">

        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>Novo chamado</h2>

            <p>
              Preencha os dados da nova solicitação.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="modal-body">

            {/* Título */}

            <div className="form-group">
              <label htmlFor="title">
                Título
              </label>

              <input
                id="title"
                type="text"
                placeholder="Ex.: Computador não liga"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </div>

            {/* Descrição */}

            <div className="form-group">
              <label htmlFor="description">
                Descrição
              </label>

              <textarea
                id="description"
                placeholder="Descreva o problema ou solicitação..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />
            </div>

            {/* Prioridade e responsável */}

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="priority">
                  Prioridade
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as
                        | "low"
                        | "medium"
                        | "high"
                    )
                  }
                >
                  <option value="low">
                    Baixa
                  </option>

                  <option value="medium">
                    Média
                  </option>

                  <option value="high">
                    Alta
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignee">
                  Responsável
                </label>

                <select
                  id="assignee"
                  value={assigneeId}
                  disabled={
                    autoAssign ||
                    loadingAssignees
                  }
                  onChange={(event) =>
                    setAssigneeId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    {loadingAssignees
                      ? "Carregando responsáveis..."
                      : "Selecione um responsável"}
                  </option>

                  {assignees.map((assignee) => (
                    <option
                      key={assignee.id}
                      value={assignee.id}
                    >
                      {assignee.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Atribuição automática */}

            <label className="auto-assign">

              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(event) =>
                  setAutoAssign(
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>
                  Atribuir automaticamente
                </strong>

                <span>
                  O sistema selecionará o
                  responsável com menos
                  chamados ativos.
                </span>
              </div>

            </label>

            {/* Data de abertura */}

            <div className="opening-date">

              <Clock
                size={17}
                className="date-icon"
              />

              <span>
                Data de abertura:{" "}
                <strong>
                  {new Date().toLocaleString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </strong>
              </span>

            </div>

          </div>

          {/* Footer */}

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
              type="submit"
              className="primary-button"
              disabled={
                loading ||
                !title.trim() ||
                !description.trim() ||
                (!autoAssign && !assigneeId)
              }
            >
              {loading
                ? "Criando..."
                : "Criar chamado"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}