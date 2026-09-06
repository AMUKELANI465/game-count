import { NavLink } from "react-router-dom";
import { BarChart3, Compass, Home, ListChecks, Settings, UploadCloud } from "lucide-react";
import Logo from "./Logo";

const links = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/new-survey", label: "Analyze", icon: UploadCloud },
  { to: "/surveys", label: "History", icon: ListChecks },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/map", label: "Map", icon: Compass },
  { to: "/settings", label: "Settings", icon: Settings },
];

function linkClasses(isActive: boolean) {
  return [
    "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-colors",
    isActive ? "bg-neutral-950 text-white" : "text-earth-500 hover:bg-earth-100 hover:text-neutral-950",
  ].join(" ");
}

export default function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-earth-200 bg-white/88 px-4 py-5 backdrop-blur-xl">
        <NavLink to="/" className="mb-8 flex items-center gap-3 rounded-2xl px-2 py-2 text-neutral-950">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <Logo size={20} />
          </span>
          <span>
            <span className="block text-lg font-bold">GameCount</span>
            <span className="block text-xs font-medium text-earth-500">AI wildlife counting</span>
          </span>
        </NavLink>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => linkClasses(isActive)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-[18px] border border-earth-200 bg-earth-50 p-4">
          <p className="text-sm font-bold text-neutral-950">Upload. Analyze. Count.</p>
          <p className="mt-1 text-xs leading-5 text-earth-500">Turn wildlife images into structured records.</p>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-earth-200 bg-white/94 px-2 pb-2 pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {links.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-bold transition-colors",
                  isActive ? "bg-neutral-950 text-white" : "text-earth-500 hover:bg-earth-100",
                  to === "/new-survey" && !isActive ? "text-forest-600" : "",
                ].join(" ")
              }
            >
              <Icon size={20} />
              <span className="mt-1 truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
