import {
  LayoutDashboard,
  Ticket,
  Plus,
  TicketCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

interface SidebarProps {
  onNewTicket: () => void;
}

export function Sidebar({ onNewTicket }: SidebarProps) {
  return (
    <aside className="sidebar">

      {/* Logo */}

      <div className="sidebar-header">

        <div className="sidebar-logo">
          <TicketCheck size={21} />
        </div>

        <span className="sidebar-title">
          Chamados
        </span>

      </div>

      {/* Menu */}

      <div className="sidebar-menu">

        <p className="sidebar-menu-title">
          Menu principal
        </p>

        <nav className="sidebar-nav">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
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
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Ticket size={20} />

            <span>
              Chamados
            </span>
          </NavLink>

          <button
            type="button"
            className="sidebar-link"
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