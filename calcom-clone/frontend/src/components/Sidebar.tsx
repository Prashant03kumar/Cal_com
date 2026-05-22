import React from "react";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const linkBase = "px-3 py-2 mx-2 rounded-md flex items-center gap-3 text-sm";

const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    width="16"
    height="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    width="16"
    height="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="3" width="14" height="12" rx="2" />
    <path d="M1 7h14" />
    <path d="M4 1v3" />
    <path d="M12 1v3" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    width="16"
    height="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4v5l3 2" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-60 border-r border-gray-200 bg-white flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-4">
          <div className="text-lg font-bold">Scaler Scheduler</div>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <GridIcon />
            <span>Event Types</span>
          </NavLink>

          <NavLink
            to="/bookings"
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <CalendarIcon />
            <span>Bookings</span>
          </NavLink>

          <NavLink
            to="/availability"
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <ClockIcon />
            <span>Availability</span>
          </NavLink>
        </nav>

        <div className="p-3 border-t border-gray-200 flex items-center gap-3 text-sm">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
            AJ
          </div>
          <div>
            <div className="text-sm font-medium">Alex Johnson</div>
            <div className="text-xs text-gray-500">alex@calcom.demo</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
