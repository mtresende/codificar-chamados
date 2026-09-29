import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTicket } from "../api/tickets";
import {
  assigneesQueryKey,
  ticketsQueryKey,
} from "../api/queryKeys";
import type { Ticket } from "../types/ticket";

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicket,

    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({
        queryKey: ticketsQueryKey,
      });

      const previousTickets =
        queryClient.getQueryData<Ticket[]>(ticketsQueryKey);

      queryClient.setQueryData<Ticket[]>(
        ticketsQueryKey,
        (currentTickets = []) =>
          currentTickets.filter((ticket) => ticket.id !== ticketId)
      );

      return { previousTickets };
    },

    onError: (_error, _ticketId, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(
          ticketsQueryKey,
          context.previousTickets
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ticketsQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: assigneesQueryKey,
      });
    },
  });
}
