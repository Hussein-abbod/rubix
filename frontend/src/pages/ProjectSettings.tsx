import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Archive, Trash2, Save, FileText, AlertTriangle } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProjectSubNav } from "../components/layout/ProjectSubNav";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/${id}`);
        setName(res.data.name);
        setDescription(res.data.description || "");
        setDeadline(res.data.deadline ? res.data.deadline.split("T")[0] : "");
        setStatus(res.data.status);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/projects/${id}`, { name, description, deadline });
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      await axios.put(`${API}/api/projects/${id}/archive`);
      setStatus(status === "archived" ? "active" : "archived");
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/projects/${id}`);
      navigate("/dashboard");
    } catch {}
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ProjectSubNav />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card rounded-xl p-6 animate-pulse"><div className="h-4 bg-surface-container-high rounded w-1/3" /></div>)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-on-surface">Settings</h1>
      </div>
      <ProjectSubNav />

      {status === "archived" && (
        <div className="mt-6 mb-4 glass-card rounded-xl p-4 bg-tertiary-fixed/30 border border-tertiary-fixed-dim/50 flex items-center gap-3">
          <Archive size={16} className="text-tertiary" />
          <span className="text-sm text-tertiary font-medium">This project is archived.</span>
        </div>
      )}

      <div className="mt-6 space-y-6 max-w-2xl">
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-on-surface mb-6">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Project Name</label>
              <input className="glass-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
              <textarea className="glass-input min-h-[80px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Deadline</label>
              <input type="date" className="glass-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-error-container/50 bg-error-container/5">
          <h2 className="text-lg font-bold text-error mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-error/20">
              <div className="flex items-start gap-3">
                <Archive size={18} className="text-error mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-on-surface">Archive Project</p>
                  <p className="text-xs text-on-surface-variant">Hide from dashboard. Can be unarchived later.</p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={handleArchive}>
                {status === "archived" ? "Unarchive" : "Archive"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-error/20">
              <div className="flex items-start gap-3">
                <Trash2 size={18} className="text-error mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-on-surface">Delete Project</p>
                  <p className="text-xs text-on-surface-variant">Permanently delete all data. This cannot be undone.</p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/20 backdrop-blur-sm" onClick={() => setShowDelete(false)}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-error" />
              <h3 className="text-lg font-bold text-on-surface">Delete Project</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              This will permanently delete all sections, assignments, and data. Type <strong>delete {name}</strong> to confirm.
            </p>
            <input
              className="glass-input mb-4"
              placeholder={`delete ${name}`}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleteConfirm !== `delete ${name}`}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
