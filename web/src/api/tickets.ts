import { apiClient } from "./client";
import type { paths } from "./generated/openapi";

import type {
  Ticket,
  TicketInput,
  TicketUpdateInput,
} from "../types/ticket";

type TicketListQuery = paths["/tickets"]["get"]["parameters"]["query"];

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  ) {
    return (error as { error: string }).error;
  }

  return fallback;
}

async function unwrapResponse<T>(
  response: { data?: T; error?: unknown },
  fallbackMessage: string
): Promise<T> {
  if (response.error) {
    throw new Error(getErrorMessage(response.error, fallbackMessage));
  }

  if (!response.data) {
    throw new Error(fallbackMessage);
  }

  return response.data;
}

export async function getTickets(
  params?: TicketListQuery
): Promise<Ticket[]> {
  let response;

  try {
    response = await apiClient.GET("/tickets", {
      params: params ? { query: params } : undefined,
    });
  } catch {
    throw new Error("Falha ao listar chamados");
  }

  if (response.error) {
    throw new Error(
      getErrorMessage(response.error, "Falha ao listar chamados")
    );
  }

  return response.data ?? [];
}

export async function createTicket(
  data: TicketInput
): Promise<Ticket> {
  const response = await apiClient.POST("/tickets", {
    body: data,
  });

  return unwrapResponse(response, "Falha ao criar chamado");
}

export async function updateTicket(
  id: number,
  data: TicketUpdateInput
): Promise<Ticket> {
  const response = await apiClient.PUT("/tickets/{id}", {
    params: { path: { id } },
    body: data,
  });

  return unwrapResponse(response, "Falha ao atualizar chamado");
}

export async function deleteTicket(id: number): Promise<void> {
  const response = await apiClient.DELETE("/tickets/{id}", {
    params: { path: { id } },
  });

  if (response.error) {
    throw new Error("Falha ao excluir chamado");
  }
}
