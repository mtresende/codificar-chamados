import { useQuery } from "@tanstack/react-query";

import { getAssignees } from "../api/assignees";
import { assigneesQueryKey } from "../api/queryKeys";
import type { Assignee } from "../types/assignee";

export function useAssignees() {
  return useQuery<Assignee[], Error, Assignee[], typeof assigneesQueryKey>({
    queryKey: assigneesQueryKey,
    queryFn: getAssignees,
  });
}