import { Outlet } from "react-router-dom";

import { Sidebar } from "../Sidebar/Sidebar";

import "./Layout.css";

interface LayoutProps {
  onNewTicket: () => void;
}

export function Layout({
  onNewTicket,
}: LayoutProps) {
  return (
    <div className="layout">

      <aside className="layout-sidebar">
        <Sidebar onNewTicket={onNewTicket} />
      </aside>

      <main className="layout-content">
        <Outlet context={{ onNewTicket }} />
      </main>

    </div>
  );
}