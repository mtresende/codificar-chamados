import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTicket } from "../api/tickets";
import {
  assigneesQueryKey,
  ticketsQueryKey,
} from "../api/queryKeys";
import type {
  Ticket,
  TicketInput,
  TicketStatus,
} from "../types/ticket";

interface UpdateTicketVariables {
  id: number;
  data: TicketInput;
  status: TicketStatus;
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, status }: UpdateTicketVariables) =>
      updateTicket(id, {
        ...data,
        status,
        auto_reassign: data.assignee_id === 0,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ticketsQueryKey,
      });

      await queryClient.invalidateQueries({
        queryKey: assigneesQueryKey,
      });
    },
  });
}

interface ChangeTicketStatusVariables {
  ticket: Ticket;
  status: TicketStatus;
}

export function useChangeTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticket,
      status,
    }: ChangeTicketStatusVariables) =>
      updateTicket(ticket.id, {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        assignee_id: ticket.assignee_id ?? 0,
        status,
        auto_reassign: false,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ticketsQueryKey,
      });

      await queryClient.invalidateQueries({
        queryKey: assigneesQueryKey,
      });
    },
  });
}
