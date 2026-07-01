import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Plus, LogOut } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects/new", icon: Plus, label: "New Project" },
];

export function Sidebar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    axios.get(`${API}/api/users/me`)
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F172A] z-40 flex flex-col">
      <div className="px-6 py-6">
        <span className="text-xl font-extrabold tracking-tight gradient-text-light">RUBIX</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-container/20 text-primary-fixed-dim"
                    : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={user?.name || "?"} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || "..."}</p>
            <p className="text-xs text-[#94A3B8] truncate">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/sign-in";
          }}
          className="p-2 rounded-lg text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
