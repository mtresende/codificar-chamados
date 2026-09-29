import { useQuery } from "@tanstack/react-query";

import { getAssigneeWorkload } from "../api/assignees";
import { assigneesWorkloadQueryKey } from "../api/queryKeys";
import type { AssigneeWorkload } from "../types/assignee";

export function useAssigneeWorkload() {
  return useQuery<AssigneeWorkload[], Error>({
    queryKey: assigneesWorkloadQueryKey,
    queryFn: getAssigneeWorkload,
  });
}
