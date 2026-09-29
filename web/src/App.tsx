import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import { useState } from "react";

import { Layout } from "./components/Layout";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { DashboardPage } from "./pages/DashboardPage";
import { DistributionPage } from "./pages/DistributionPage";
import { useCreateTicket } from "./hooks/useCreateTicket";
import type { TicketInput } from "./types/ticket";

function App() {
  const [isCreateTicketOpen, setIsCreateTicketOpen] =
    useState(false);

  const [initialAssigneeId, setInitialAssigneeId] =
    useState<number | undefined>(undefined);

  const createTicketMutation = useCreateTicket();

  async function handleCreateTicket(data: TicketInput) {
    await createTicketMutation.mutateAsync(data);
    setIsCreateTicketOpen(false);
  }

  function handleNewTicket(assigneeId?: number) {
    setInitialAssigneeId(assigneeId);
    setIsCreateTicketOpen(true);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              onNewTicket={() => handleNewTicket()}
            />
          }
        >
          <Route index element={<DashboardPage />} />

          <Route
            path="dashboard"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="distribution"
            element={
              <DistributionPage
                onNewTicket={handleNewTicket}
              />
            }
          />
        </Route>
      </Routes>

      {isCreateTicketOpen && (
        <CreateTicketModal
          initialAssigneeId={initialAssigneeId}
          onClose={() => {
            setIsCreateTicketOpen(false);
            setInitialAssigneeId(undefined);
          }}
          onSubmit={handleCreateTicket}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
