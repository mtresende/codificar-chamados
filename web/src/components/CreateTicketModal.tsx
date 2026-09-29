// CreateTicketModal.tsx
import { useState } from "react";
import { Clock, X } from "lucide-react";

import { useAssignees } from "../hooks/useAssignees";

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
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center p-6 z-[100] max-[600px]:p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[680px] max-h-[calc(100vh-48px)] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.2)] max-[600px]:max-h-[calc(100vh-24px)]">

        {/* Header */}

        <div className="flex items-start justify-between py-[26px] px-7 border-b border-slate-200 max-[600px]:p-5">
          <div>
            <h2 className="m-0 mb-[5px] text-slate-900 text-2xl leading-[1.2]">
              Novo chamado
            </h2>

            <p className="m-0 text-slate-500 text-base">
              Preencha os dados da nova solicitação.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-[34px] h-[34px] border-none bg-transparent text-slate-500 rounded-lg hover:bg-slate-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="p-7 max-[600px]:p-5">

            {/* Título */}

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="title" className="text-slate-700 text-sm font-semibold">
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
                className="w-full h-12 px-3.5 border border-slate-300 rounded-[10px] bg-white text-slate-700 outline-none placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              />
            </div>

            {/* Descrição */}

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="description" className="text-slate-700 text-sm font-semibold">
                Descrição
              </label>

              <textarea
                id="description"
                placeholder="Descreva o problema ou solicitação..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className="w-full min-h-[112px] p-3.5 border border-slate-300 rounded-[10px] bg-white text-slate-700 outline-none resize-y placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              />
            </div>

            {/* Prioridade e responsável */}

            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1 max-[600px]:gap-0">

              <div className="flex flex-col gap-2 mb-[22px]">
                <label htmlFor="priority" className="text-slate-700 text-sm font-semibold">
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
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-[10px] bg-white text-slate-700 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
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

              <div className="flex flex-col gap-2 mb-[22px]">
                <label htmlFor="assignee" className="text-slate-700 text-sm font-semibold">
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
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-[10px] bg-white text-slate-700 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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

            <label className="flex items-start gap-3 p-[18px] mt-1 mb-6 border border-[#dbe3ee] rounded-xl cursor-pointer">

              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(event) =>
                  setAutoAssign(
                    event.target.checked
                  )
                }
                className="w-[18px] h-[18px] mt-0.5 accent-blue-600 shrink-0"
              />

              <div className="flex flex-col gap-[5px]">
                <strong className="text-slate-700 text-sm">
                  Atribuir automaticamente
                </strong>

                <span className="text-slate-500 text-[13px] leading-[1.4]">
                  O sistema selecionará o
                  responsável com menos
                  chamados ativos.
                </span>
              </div>

            </label>

            {/* Data de abertura */}

            <div className="flex items-center gap-[9px] text-slate-500 text-sm">

              <Clock size={17} />

              <span>
                Data de abertura:{" "}
                <strong className="text-slate-600">
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
              type="submit"
              disabled={
                loading ||
                !title.trim() ||
                !description.trim() ||
                (!autoAssign && !assigneeId)
              }
              className="h-[46px] px-[18px] rounded-[10px] font-semibold border-none bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed max-[600px]:w-full"
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