import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTicket } from "../api/tickets";
import {
  assigneesQueryKey,
  ticketsQueryKey,
} from "../api/queryKeys";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,

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
