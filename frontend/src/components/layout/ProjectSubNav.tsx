import { NavLink, useParams } from "react-router-dom";
import { Columns3, ListTree, Users, Puzzle, Settings } from "lucide-react";

const tabs = [
  { to: "board", icon: Columns3, label: "Board" },
  { to: "tasks", icon: ListTree, label: "Tasks" },
  { to: "team", icon: Users, label: "Team" },
  { to: "integrations", icon: Puzzle, label: "Integrations" },
  { to: "settings", icon: Settings, label: "Settings" },
];

export function ProjectSubNav() {
  const { id } = useParams<{ id: string }>();

  return (
    <nav className="sticky top-16 z-20 bg-surface/50 backdrop-blur-md border-b border-outline-variant/20">
      <div className="flex items-center gap-1 px-6 md:px-10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={`/projects/${id}/${tab.to}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                }`
              }
            >
              <Icon size={16} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
