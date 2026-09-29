import {
  LayoutDashboard,
  Ticket,
  Plus,
  TicketCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  onNewTicket: () => void;
}

const linkBaseClasses =
  "flex items-center gap-[14px] w-full py-[13px] px-[14px] rounded-xl bg-transparent text-slate-600 text-base no-underline cursor-pointer transition-colors duration-200 hover:bg-slate-100 hover:text-blue-600 max-[600px]:w-auto [&>svg]:shrink-0";

const linkActiveClasses =
  "bg-blue-50 text-blue-600 font-semibold";

export function Sidebar({ onNewTicket }: SidebarProps) {
  return (
    <aside className="w-72 h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-slate-200 z-50 max-[768px]:w-[220px] max-[600px]:relative max-[600px]:w-full max-[600px]:h-auto">

      {/* Logo */}

      <div className="h-[88px] flex items-center px-7 border-b border-slate-200 max-[768px]:px-5 max-[600px]:h-[70px]">

        <div className="w-10 h-10 flex items-center justify-center mr-[14px] rounded-xl bg-blue-600 text-white">
          <TicketCheck size={21} />
        </div>

        <span className="text-slate-900 text-xl font-bold max-[768px]:text-lg">
          Chamados
        </span>

      </div>

      {/* Menu */}

      <div className="flex-1 py-7 px-4 max-[600px]:py-3 max-[600px]:px-4">

        <p className="mx-3 mb-[14px] text-slate-400 text-xs font-bold tracking-[1px] uppercase max-[600px]:hidden">
          Menu principal
        </p>

        <nav className="flex flex-col gap-1 max-[600px]:flex-row">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? linkActiveClasses : ""}`
            }
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? linkActiveClasses : ""}`
            }
          >
            <Ticket size={20} />

            <span>
              Chamados
            </span>
          </NavLink>

          <button
            type="button"
            className={linkBaseClasses}
            onClick={onNewTicket}
          >
            <Plus size={20} />

            <span>
              Novo chamado
            </span>
          </button>

        </nav>

      </div>

    </aside>
  );
}