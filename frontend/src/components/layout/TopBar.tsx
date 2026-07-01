import { Bell, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 glass-card rounded-none border-x-0 border-t-0 h-16 flex items-center px-6 md:px-10">
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="glass-input !rounded-full !py-2 !pl-10 !pr-4 text-sm"
            placeholder="Search projects, tasks, members..."
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Bell size={18} className="text-on-surface-variant" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error animate-pulse" />
          </button>

          <button
            onClick={() => navigate("/projects/new")}
            className="btn-primary !py-2 !px-4 text-xs"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>
    </header>
  );
}
