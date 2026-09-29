import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Layout } from "./components/Layout";
import {
  CreateTicketModal,
  type CreateTicketData,
} from "./components/CreateTicketModal";
import { DashboardPage } from "./pages/DashboardPage";
import { TicketsPage } from "./pages/TicketsPage";
import { createTicket } from "./api/tickets";
import { assigneesQueryKey, ticketsQueryKey } from "./api/queryKeys";

function App() {
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
      await queryClient.invalidateQueries({ queryKey: assigneesQueryKey });
      setIsCreateTicketOpen(false);
    },
  });

  async function handleCreateTicket(data: CreateTicketData) {
    await createTicketMutation.mutateAsync(data);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              onNewTicket={() => setIsCreateTicketOpen(true)}
            />
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="tickets" element={<TicketsPage />} />
        </Route>
      </Routes>

      {isCreateTicketOpen && (
        <CreateTicketModal
          onClose={() => setIsCreateTicketOpen(false)}
          onSubmit={handleCreateTicket}
        />
      )}
    </BrowserRouter>
  );
}

export default App;