import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus, ExternalLink, Clock, User, FileText, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProjectSubNav } from "../components/layout/ProjectSubNav";
import { GlassCard } from "../components/ui/GlassCard";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { AIMissionCard } from "../components/board/AIMissionCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Section {
  _id: string;
  heading: string;
  wordCount: number;
  assignedTo?: { _id: string; name: string; avatar?: string } | null;
  deadline?: string | null;
  status: "todo" | "in_progress" | "review" | "completed";
  order: number;
}

interface ProjectData {
  _id: string;
  name: string;
  projectObjective?: string;
  expectedOutcomes?: string[];
}

const COLUMNS = [
  { id: "todo", label: "To-Do", color: "border-slate-400" },
  { id: "in_progress", label: "In Progress", color: "border-blue-400" },
  { id: "review", label: "Review", color: "border-amber-400" },
  { id: "completed", label: "Completed", color: "border-emerald-400" },
] as const;

export function KanbanBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMember, setFilterMember] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          axios.get(`${API}/api/projects/${id}`),
          axios.get(`${API}/api/projects/${id}/sections`),
        ]);
        setProject(pRes.data);
        setSections(sRes.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Section["status"];

    setSections((prev) =>
      prev.map((s) => (s._id === draggableId ? { ...s, status: newStatus } : s))
    );

    try {
      await axios.put(`${API}/api/sections/${draggableId}/status`, { status: newStatus });
    } catch {}
  };

  const getStatusSections = (status: string) =>
    sections
      .filter((s) => {
        if (s.status !== status) return false;
        if (filterMember && s.assignedTo?._id !== filterMember) return false;
        if (search && !s.heading.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse space-y-3">
              <div className="h-5 bg-surface-container-high rounded w-1/2" />
              {[1, 2].map((j) => (
                <div key={j} className="h-24 bg-surface-container-high rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-on-surface">{project?.name || "Project"}</h1>
          <Badge variant="success" dot>Active</Badge>
        </div>
      </div>

      <ProjectSubNav />

      <div className="mt-6 space-y-6">
        <AIMissionCard
          projectObjective={project?.projectObjective || ""}
          expectedOutcomes={project?.expectedOutcomes || []}
        />

        <div className="flex items-center gap-4">
          <input
            className="glass-input !rounded-full !py-2 !px-4 text-sm max-w-xs"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="glass-input !rounded-full !py-2 !px-4 text-sm max-w-[180px]"
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
          >
            <option value="">All Members</option>
            {[...new Set(sections.filter((s) => s.assignedTo).map((s) => s.assignedTo!._id))].map((uid) => {
              const m = sections.find((s) => s.assignedTo?._id === uid)?.assignedTo;
              return m ? <option key={uid} value={uid}>{m.name}</option> : null;
            })}
          </select>
          <div className="ml-auto">
            <Button size="sm" variant="secondary" onClick={() => navigate(`/projects/${id}/editor`)}>
              <FileText size={14} /> Open Editor
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colSections = getStatusSections(col.id);
              return (
                <div key={col.id} className={`glass-card rounded-2xl overflow-hidden border-t-4 ${col.color}`}>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/20">
                    <h3 className="text-sm font-semibold text-on-surface">{col.label}</h3>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">
                      {colSections.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 space-y-3 min-h-[200px] transition-colors ${
                          snapshot.isDraggingOver ? "bg-primary-fixed/20" : ""
                        }`}
                      >
                        {colSections.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-xs text-on-surface-variant">No tasks</p>
                          </div>
                        )}
                        {colSections.map((section, index) => {
                          const dueDate = section.deadline ? new Date(section.deadline) : null;
                          const isOverdue = dueDate && dueDate < new Date();
                          const dateStr = dueDate
                            ? isOverdue
                              ? "Overdue!"
                              : `Due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : null;

                          return (
                            <Draggable key={section._id} draggableId={section._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing transition-shadow ${
                                    snapshot.isDragging ? "shadow-[0_20px_60px_rgba(124,58,237,0.2)]" : ""
                                  } ${isOverdue ? "border-l-2 border-l-error" : ""}`}
                                >
                                  <p className="text-sm font-semibold text-on-surface mb-3 line-clamp-2">
                                    {section.heading}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {section.assignedTo ? (
                                        <Avatar name={section.assignedTo.name} src={section.assignedTo.avatar} size="sm" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center">
                                          <User size={12} className="text-on-surface-variant" />
                                        </div>
                                      )}
                                      {dateStr && (
                                        <span className={`text-xs ${isOverdue ? "text-error font-medium" : "text-on-surface-variant"}`}>
                                          {dateStr}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${id}/editor#section-${section._id}`); }}
                                      className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors"
                                      title="Open in editor"
                                    >
                                      <ExternalLink size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </DashboardLayout>
  );
}
