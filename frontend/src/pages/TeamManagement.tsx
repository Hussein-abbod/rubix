import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Search, X, Send, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProjectSubNav } from "../components/layout/ProjectSubNav";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface TeamMember {
  user: { _id: string; name: string; email: string; avatar?: string };
  role: "owner" | "editor" | "viewer";
  stats: { assigned: number; completed: number; overdue: number };
  completionRate: number;
}

export function TeamManagement() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [searchResults, setSearchResults] = useState<{ _id: string; name: string; email: string; avatar?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (inviteEmail.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    // Only search if the string doesn't look like a fully selected exact email
    if (inviteEmail.includes('@') && !searchResults.length && !isSearching) {
      // It might be fully typed, we can still search but let's just let it be
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`${API}/api/users/search?q=${inviteEmail}`, {
          withCredentials: true
        });
        setSearchResults(res.data);
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [inviteEmail]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/${id}/members`);
        setMembers(res.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await axios.put(`${API}/api/projects/${id}/invite`, { email: inviteEmail, role: inviteRole });
      setShowInvite(false);
      setInviteEmail("");
    } catch {}
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this member? Their tasks will become unassigned.")) return;
    try {
      await axios.put(`${API}/api/projects/${id}/remove-member`, { userId });
      setMembers((prev) => prev.filter((m) => m.user._id !== userId));
    } catch {}
  };

  const roleBadge = (role: string) => {
    const variants: Record<string, "primary" | "info" | "default"> = { owner: "primary", editor: "info", viewer: "default" };
    return <Badge variant={variants[role] || "default"}>{role}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ProjectSubNav />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 animate-pulse space-y-3">
              <div className="w-16 h-16 rounded-full bg-surface-container-high mx-auto" />
              <div className="h-4 bg-surface-container-high rounded w-2/3 mx-auto" />
              <div className="h-3 bg-surface-container-high rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-on-surface">Team</h1>
      </div>
      <ProjectSubNav />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-on-surface-variant">{members.length} member{members.length !== 1 ? "s" : ""}</span>
          <Button size="sm" onClick={() => setShowInvite(true)}><Plus size={14} /> Invite Member</Button>
        </div>

        {members.length === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-on-surface-variant mb-4">No team members yet.</p>
            <Button onClick={() => setShowInvite(true)}><Plus size={14} /> Invite Member</Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member) => (
              <GlassCard key={member.user._id} className="text-center p-6">
                <div className="relative inline-block mb-4">
                  <Avatar name={member.user.name} src={member.user.avatar} size="xl" />
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2.5" />
                    <circle cx="26" cy="26" r="24" fill="none" stroke="#6750a4" strokeDasharray="150" strokeDashoffset={150 - (member.completionRate / 100) * 150} strokeWidth="2.5" />
                  </svg>
                </div>
                <p className="font-semibold text-on-surface">{member.user.name}</p>
                <p className="text-xs text-on-surface-variant truncate mb-3">{member.user.email}</p>
                <div className="mb-3">{roleBadge(member.role)}</div>
                <div className="flex justify-center gap-4 text-xs text-on-surface-variant mb-4">
                  <span>{member.stats.assigned} assigned</span>
                  <span>{member.stats.completed} done</span>
                  {member.stats.overdue > 0 && <span className="text-error">{member.stats.overdue} overdue</span>}
                </div>
                <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full gradient-progress rounded-full" style={{ width: `${member.completionRate}%` }} />
                </div>
                {member.role !== "owner" && (
                  <button onClick={() => handleRemove(member.user._id)} className="mt-4 text-xs text-on-surface-variant hover:text-error transition-colors">
                    Remove
                  </button>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/20 backdrop-blur-sm" onClick={() => setShowInvite(false)}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-on-surface mb-4">Invite Member</h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-on-surface mb-1.5">Search User</label>
                <input className="glass-input" placeholder="Name or email..." value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                {inviteEmail.trim().length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 glass-card rounded-xl p-2 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-center text-sm text-on-surface-variant">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => {
                              setInviteEmail(user.email);
                              setSearchResults([]);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-surface-container flex items-center gap-2 transition-colors"
                          >
                            <Avatar name={user.name} src={user.avatar} size="sm" />
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{user.name}</p>
                              <p className="text-xs text-on-surface-variant">{user.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-sm text-on-surface-variant">No users found</div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Role</label>
                <select className="glass-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button onClick={handleInvite}><Send size={14} /> Send Invite</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
