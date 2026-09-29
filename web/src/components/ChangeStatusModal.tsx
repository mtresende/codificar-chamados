import { useState } from "react";
import { X } from "lucide-react";

import type { Ticket } from "../types/ticket";

interface ChangeStatusModalProps {
  ticket: Ticket;
  loading?: boolean;
  onClose: () => void;
  onSave: (status: Ticket["status"]) => Promise<void>;
}

const statusOptions: {
  value: Ticket["status"];
  label: string;
  description: string;
  dotClass: string;
}[] = [
  {
    value: "open",
    label: "Aberto",
    description: "Aguardando início do atendimento",
    dotClass: "bg-blue-500",
  },
  {
    value: "in_progress",
    label: "Em andamento",
    description: "O chamado está sendo atendido",
    dotClass: "bg-violet-500",
  },
  {
    value: "resolved",
    label: "Resolvido",
    description: "A solicitação foi solucionada",
    dotClass: "bg-emerald-500",
  },
  {
    value: "closed",
    label: "Fechado",
    description: "Atendimento concluído e encerrado",
    dotClass: "bg-slate-500",
  },
];

export function ChangeStatusModal({
  ticket,
  loading = false,
  onClose,
  onSave,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<Ticket["status"]>(ticket.status);

  async function handleSave() {
    await onSave(selectedStatus);
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center p-6 z-[110] max-[600px]:p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[680px] max-h-[calc(100vh-48px)] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.2)] max-[600px]:max-h-[calc(100vh-24px)]">

        <div className="flex items-start justify-between py-[26px] px-7 border-b border-slate-200 max-[600px]:p-5">
          <div>
            <h2 className="m-0 mb-1 text-slate-900 text-2xl leading-[1.2] font-bold">
              Alterar status
            </h2>

            <p className="m-0 text-slate-500 text-base">
              {ticket.title}
            </p>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-[34px] h-[34px] border-none bg-transparent text-slate-500 rounded-lg hover:bg-slate-100 cursor-pointer"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="p-7 max-[600px]:p-5">
          <span className="block mb-5 text-slate-400 text-sm font-bold tracking-[0.5px]">
            SELECIONE O NOVO STATUS
          </span>

          <div className="flex flex-col gap-3.5">
            {statusOptions.map((option) => {
              const selected = selectedStatus === option.value;

              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-4 p-[18px] border rounded-xl cursor-pointer transition-colors ${
                    selected
                      ? "border-blue-200 bg-blue-50/20"
                      : "border-[#dbe3ee] bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="ticket-status"
                    value={option.value}
                    checked={selected}
                    onChange={() => setSelectedStatus(option.value)}
                    disabled={loading}
                    className="w-[18px] h-[18px] accent-blue-600 shrink-0"
                  />

                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${option.dotClass}`}
                  />

                  <span className="flex flex-col gap-0.5">
                    <strong className="text-slate-800 text-[15px]">
                      {option.label}
                    </strong>

                    <span className="text-slate-500 text-[13px]">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 py-[18px] px-7 bg-slate-50 border-t border-slate-200 max-[600px]:py-4 max-[600px]:px-5 max-[600px]:flex-col-reverse">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-[46px] px-[18px] rounded-[10px] font-semibold border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer max-[600px]:w-full"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="h-[46px] px-[18px] rounded-[10px] font-semibold border-none bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer max-[600px]:w-full"
          >
            {loading ? "Salvando..." : "Salvar status"}
          </button>
        </div>
      </div>
    </div>
  );
}