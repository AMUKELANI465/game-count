import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, ListChecks, Map, BarChart3, Settings, PawPrint, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-survey", label: "New Survey", icon: PlusCircle },
  { to: "/surveys", label: "Surveys", icon: ListChecks },
  { to: "/map", label: "Map", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-5 py-6">
        <PawPrint className="text-accent-400" size={26} />
        <div>
          <div className="text-lg font-bold tracking-wide text-white">GAME COUNT</div>
          <div className="text-[11px] text-forest-200">AI-assisted wildlife counting</div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-forest-600 text-white"
                  : "text-forest-100 hover:bg-forest-700 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-[11px] text-forest-300 border-t border-forest-700">
        Welgevonden Game Reserve
        <br />
        Pilot environment
      </div>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 bg-forest-800 min-h-screen">
        <NavContent />
      </aside>

      {/* Mobile top bar + slide-over */}
      <div className="md:hidden flex items-center justify-between bg-forest-800 px-4 py-3">
        <div className="flex items-center gap-2 text-white font-bold">
          <PawPrint className="text-accent-400" size={22} />
          GAME COUNT
        </div>
        <button aria-label="Open navigation menu" onClick={() => setOpen(true)} className="text-white">
          <Menu size={24} />
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-forest-800 flex flex-col">
            <div className="flex justify-end px-3 pt-3">
              <button aria-label="Close navigation menu" onClick={() => setOpen(false)} className="text-white">
                <X size={22} />
              </button>
            </div>
            <NavContent onNavigate={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
