import { useQuery } from "@tanstack/react-query";

import { getTickets } from "../api/tickets";
import { ticketsQueryKey } from "../api/queryKeys";
import type { Ticket } from "../types/ticket";

export function useTickets() {
  return useQuery<Ticket[], Error, Ticket[], typeof ticketsQueryKey>({
    queryKey: ticketsQueryKey,
    queryFn: () => getTickets(),
  });
}