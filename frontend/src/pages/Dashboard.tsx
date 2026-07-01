import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, PlayCircle, CheckCircle, AlertTriangle, Plus, ArrowRight, Clock } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedThisWeek: number;
  overdueTasks: number;
}

interface ProjectSummary {
  _id: string;
  name: string;
  deadline?: string;
  status: string;
  projectObjective?: string;
  members: Array<{ user: { _id: string; name: string; avatar?: string } }>;
  createdAt: string;
}

interface DeadlineItem {
  _id: string;
  heading: string;
  deadline: string;
  projectId: { _id: string; name: string };
  assignedTo?: { _id: string; name: string; avatar?: string };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, activeProjects: 0, completedThisWeek: 0, overdueTasks: 0 });
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, deadlinesRes] = await Promise.all([
          axios.get(`${API}/api/dashboard/stats`).catch(() => ({ data: { totalProjects: 0, activeProjects: 0, completedThisWeek: 0, overdueTasks: 0 } })),
          axios.get(`${API}/api/projects`).catch(() => ({ data: [] })),
          axios.get(`${API}/api/dashboard/upcoming-deadlines`).catch(() => ({ data: [] })),
        ]);

        setStats(statsRes.data);
        setProjects(projectsRes.data);
        setDeadlines(deadlinesRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: FolderKanban, label: "Total Projects", value: stats.totalProjects, color: "text-primary", bg: "bg-primary-fixed" },
    { icon: PlayCircle, label: "Active Projects", value: stats.activeProjects, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: CheckCircle, label: "Completed This Week", value: stats.completedThisWeek, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: AlertTriangle, label: "Overdue Tasks", value: stats.overdueTasks, color: stats.overdueTasks > 0 ? "text-error" : "text-on-surface-variant", bg: stats.overdueTasks > 0 ? "bg-error-container/30" : "bg-surface-variant" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <GlassCard className="mb-6 bg-gradient-to-r from-primary-fixed/50 to-transparent">
        <p className="text-lg font-semibold text-on-surface">
          Welcome back!
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          {stats.overdueTasks > 0
            ? `You have ${stats.overdueTasks} overdue task${stats.overdueTasks > 1 ? "s" : ""} needing attention.`
            : stats.activeProjects > 0
              ? `${stats.activeProjects} active project${stats.activeProjects > 1 ? "s" : ""} in progress.`
              : "No active projects. Start something new!"}
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} hover className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs text-on-surface-variant">{stat.label}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface">Recent Projects</h2>
            {projects.length > 6 && (
              <button className="text-sm text-primary-container font-medium hover:underline">View All</button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-surface-container-high rounded w-1/3 mb-3" />
                  <div className="h-2 bg-surface-container-high rounded w-full" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <GlassCard className="text-center py-10">
              <FolderKanban size={40} className="text-on-surface-variant/40 mx-auto mb-4" />
              <p className="text-on-surface-variant mb-4">No projects yet.</p>
              <button onClick={() => navigate("/projects/new")} className="btn-primary">
                <Plus size={16} /> Create Your First Project
              </button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 6).map((project) => (
                <GlassCard
                  key={project._id}
                  hover
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${project._id}/board`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                        <FolderKanban size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface truncate">{project.name}</p>
                        {project.projectObjective && (
                          <p className="text-xs text-on-surface-variant truncate">{project.projectObjective}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={project.status === "active" ? "success" : "default"}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members?.slice(0, 4).map((m, i) => (
                        <Avatar key={i} name={m.user?.name} size="sm" className="border-2 border-white" />
                      ))}
                      {project.members?.length > 4 && (
                        <span className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                          +{project.members.length - 4}
                        </span>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-on-surface-variant" />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-4">Upcoming Deadlines</h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-surface-container-high rounded w-2/3 mb-2" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : deadlines.length === 0 ? (
            <GlassCard className="text-center py-10">
              <Clock size={32} className="text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant">No upcoming deadlines. Great job!</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {deadlines.map((item) => {
                const dueDate = new Date(item.deadline);
                const now = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;

                return (
                  <GlassCard key={item._id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isOverdue ? "bg-error" : diffDays <= 2 ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-on-surface truncate">{item.heading}</p>
                      <p className="text-xs text-on-surface-variant truncate">{item.projectId?.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.assignedTo && (
                          <Avatar name={item.assignedTo.name} src={item.assignedTo.avatar} size="sm" />
                        )}
                        <span className={`text-xs font-medium ${isOverdue ? "text-error" : "text-on-surface-variant"}`}>
                          {isOverdue ? `${Math.abs(diffDays)}d overdue` : `Due in ${diffDays}d`}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
