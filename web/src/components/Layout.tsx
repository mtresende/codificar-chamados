import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";

interface LayoutProps {
  onNewTicket: () => void;
}

export function Layout({
  onNewTicket,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 max-[600px]:block">

      <aside className="w-72 shrink-0 max-[768px]:w-[220px] max-[600px]:w-full">
        <Sidebar onNewTicket={onNewTicket} />
      </aside>

      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden max-[600px]:w-full">
        <Outlet />
      </main>

    </div>
  );
}