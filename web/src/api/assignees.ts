import { apiClient } from "./client";

import type {
  Assignee,
  AssigneeWorkload,
} from "../types/assignee";

export async function getAssignees(): Promise<Assignee[]> {
  const response = await apiClient.GET("/assignees");

  if (response.error) {
    throw new Error("Falha ao listar responsáveis");
  }

  return response.data ?? [];
}

export async function getAssigneeWorkload(): Promise<AssigneeWorkload[]> {
  const response = await apiClient.GET("/assignees/workload");

  if (response.error) {
    throw new Error("Falha ao calcular workload");
  }

  return response.data ?? [];
}
