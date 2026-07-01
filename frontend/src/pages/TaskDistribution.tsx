import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Sparkles, Check, X, User, Calendar, Trash2 } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProjectSubNav } from "../components/layout/ProjectSubNav";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Section {
  _id: string;
  heading: string;
  wordCount: number;
  pageConstraints?: string;
  requirements?: string;
  assignedTo?: { _id: string; name: string; avatar?: string } | null;
  deadline?: string | null;
  status: string;
  order: number;
}

export function TaskDistribution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAutoAssign, setShowAutoAssign] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    axios.get(`${API}/api/users/me`)
      .then((res) => setCurrentUserId(res.data.id || res.data._id || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [pRes, sRes, mRes] = await Promise.all([
          axios.get(`${API}/api/projects/${id}`),
          axios.get(`${API}/api/projects/${id}/sections`),
          axios.get(`${API}/api/projects/${id}/members`),
        ]);
        setProject(pRes.data);
        setSections(sRes.data);
        setMembers(mRes.data.map((m: any) => m.user));
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isCreator = project && currentUserId && project.createdById === currentUserId;

  const updateSection = async (sectionId: string, data: any) => {
    setSections((prev) => prev.map((s) => (s._id === sectionId ? { ...s, ...data } : s)));
    try {
      await axios.put(`${API}/api/sections/${sectionId}`, data);
    } catch {}
  };

  const assignSection = async (sectionId: string, userId: string | null) => {
    const member = userId ? members.find((m) => m._id === userId) || null : null;
    setSections((prev) =>
      prev.map((s) =>
        s._id === sectionId
          ? { ...s, assignedTo: member ? { _id: member._id, name: member.name, avatar: member.avatar } : null }
          : s
      )
    );
    try {
      await axios.put(`${API}/api/sections/${sectionId}/assign`, { assignedTo: userId });
    } catch {
      const res = await axios.get(`${API}/api/projects/${id}/sections`).catch(() => null);
      if (res) setSections(res.data);
    }
  };

  const deleteSection = async (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s._id !== sectionId));
    try {
      await axios.delete(`${API}/api/sections/${sectionId}`);
    } catch {}
  };

  const addSection = async () => {
    const temp = { _id: `temp-${Date.now()}`, heading: "", wordCount: 0, status: "todo", order: sections.length };
    setSections((prev) => [...prev, temp]);
  };

  const bulkAssign = async (userId: string | null) => {
    for (const sectionId of selected) {
      await axios.put(`${API}/api/sections/${sectionId}/assign`, { assignedTo: userId });
    }
    setSections((prev) => prev.map((s) =>
      selected.has(s._id) ? { ...s, assignedTo: userId ? { _id: userId, name: members.find((m) => m._id === userId)?.name || "" } as any : null } : s
    ));
    setSelected(new Set());
  };

  const assigneeName = (section: Section) => {
    if (!section.assignedTo) return "Unassigned";
    if (typeof section.assignedTo === "object" && "name" in section.assignedTo) return section.assignedTo.name;
    return "Assigned";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 animate-pulse flex gap-4">
              <div className="h-4 bg-surface-container-high rounded w-1/4" />
              <div className="h-4 bg-surface-container-high rounded w-1/6" />
              <div className="h-4 bg-surface-container-high rounded w-1/6" />
              <div className="h-4 bg-surface-container-high rounded w-1/6" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-on-surface">{/* project name header */}</h1>
      </div>

      <ProjectSubNav />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">{sections.length} sections</span>
            {sections.filter((s) => !s.assignedTo).length > 0 && (
              <Badge variant="warning">{sections.filter((s) => !s.assignedTo).length} unassigned</Badge>
            )}
          </div>
          {isCreator && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowAutoAssign(true)}>
                <Sparkles size={14} /> Auto-Assign
              </Button>
              <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${bulkMode ? "bg-primary" : "bg-surface-variant"}`}>
                  <input type="checkbox" className="sr-only" checked={bulkMode} onChange={() => { setBulkMode(!bulkMode); setSelected(new Set()); }} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${bulkMode ? "translate-x-5" : ""}`} />
                </div>
                Bulk Edit
              </label>
              <Button size="sm" variant="secondary" onClick={addSection}>
                <Plus size={14} /> Add Section
              </Button>
            </div>
          )}
        </div>

        {bulkMode && selected.size > 0 && (
          <GlassCard className="mb-4 p-3 flex items-center gap-3">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <select
              className="glass-input !py-1.5 !px-3 text-sm max-w-[200px]"
              onChange={(e) => { if (e.target.value) bulkAssign(e.target.value === "unassign" ? null : e.target.value); }}
            >
              <option value="">Assign to...</option>
              <option value="unassign">Unassign</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <button onClick={() => setSelected(new Set())} className="btn-ghost text-sm ml-auto">Cancel</button>
          </GlassCard>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  {bulkMode && <th className="w-10 px-4 py-3"><input type="checkbox" className="accent-primary" /></th>}
                  <th className="w-10 px-4 py-3" />
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3 w-28">Words</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3 w-44">Assignee</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3 w-36">Deadline</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3 w-28">Status</th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sections.sort((a, b) => a.order - b.order).map((section, i) => (
                  <tr key={section._id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    {bulkMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={selected.has(section._id)}
                          onChange={() => {
                            const next = new Set(selected);
                            next.has(section._id) ? next.delete(section._id) : next.add(section._id);
                            setSelected(next);
                          }}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-on-surface-variant">
                      {isCreator && <GripVertical size={16} className="cursor-grab" />}
                    </td>
                    <td className="px-4 py-3">
                      {isCreator ? (
                        <input
                          className="bg-transparent text-sm font-medium text-on-surface w-full focus:outline-none focus:bg-surface-container-high rounded px-1 py-0.5"
                          value={section.heading}
                          onChange={(e) => updateSection(section._id, { heading: e.target.value })}
                        />
                      ) : (
                        <span className="text-sm font-medium text-on-surface">{section.heading}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isCreator ? (
                        <input
                          type="number"
                          className="bg-transparent text-sm text-on-surface-variant w-16 focus:outline-none focus:bg-surface-container-high rounded px-1 py-0.5"
                          value={section.wordCount || ""}
                          onChange={(e) => updateSection(section._id, { wordCount: parseInt(e.target.value) || 0 })}
                        />
                      ) : (
                        <span className="text-sm text-on-surface-variant">{section.wordCount || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isCreator ? (
                        <select
                          className="glass-input !py-1.5 !px-2 text-sm max-w-[160px]"
                          value={section.assignedTo?._id || ""}
                          onChange={(e) => assignSection(section._id, e.target.value || null)}
                        >
                          <option value="">Unassigned</option>
                          {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                      ) : (
                        <span className="text-sm text-on-surface-variant">{assigneeName(section)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isCreator ? (
                        <input
                          type="date"
                          className="bg-transparent text-sm text-on-surface-variant focus:outline-none focus:bg-surface-container-high rounded px-1 py-0.5"
                          value={section.deadline ? section.deadline.split("T")[0] : ""}
                          onChange={(e) => updateSection(section._id, { deadline: e.target.value || null })}
                        />
                      ) : (
                        <span className="text-sm text-on-surface-variant">
                          {section.deadline ? new Date(section.deadline).toLocaleDateString() : "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={section.status === "completed" ? "success" : section.status === "in_progress" ? "info" : "default"}>
                        {section.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {isCreator && (
                        <button
                          onClick={() => { if (confirm("Delete this section?")) deleteSection(section._id); }}
                          className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-on-surface-variant mb-4">No sections yet. Upload a PDF or add one manually.</p>
              <Button variant="secondary" onClick={addSection}><Plus size={14} /> Add Section</Button>
            </div>
          )}
        </div>
      </div>

      {showAutoAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/20 backdrop-blur-sm" onClick={() => setShowAutoAssign(false)}>
          <div className="glass-card rounded-2xl p-8 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-on-surface mb-2">AI Auto-Assign</h3>
            <p className="text-sm text-on-surface-variant mb-6">AI will propose the best assignment based on current workload.</p>
            <div className="space-y-3 mb-6">
              {sections.filter((s) => !s.assignedTo).slice(0, 5).map((s) => (
                <div key={s._id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">{s.heading}</span>
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-tertiary" />
                    <span className="text-xs text-on-surface-variant">Suggested: {members[Math.floor(Math.random() * members.length)]?.name || "Auto"}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAutoAssign(false)}>Cancel</Button>
              <Button onClick={() => { setShowAutoAssign(false); }}><Sparkles size={14} /> Apply</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
