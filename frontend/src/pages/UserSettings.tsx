import { useEffect, useState } from "react";
import { Camera, Save, Calendar, Video, Check, Bell } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function UserSettings() {
  const [name, setName] = useState("User");
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    dailySummary: true,
    deadlineReminders: true,
    overdueAlerts: true,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me/preferences`);
        setPrefs((p) => ({ ...p, ...res.data }));
      } catch {}
    };
    fetch();
  }, []);

  const saveName = async () => {
    try {
      await axios.put(`${API}/api/users/me`, { name });
    } catch {}
  };

  const togglePref = async (key: string, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    try {
      await axios.put(`${API}/api/users/me/preferences`, { [key]: value });
    } catch {}
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-surface-variant"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? "translate-x-5" : ""}`} />
    </button>
  );

  return (
    <DashboardLayout title="Settings">
      <GlassCard className="p-6 mb-6 max-w-2xl">
        <h2 className="text-lg font-bold text-on-surface mb-6">Profile</h2>
        <div className="flex items-start gap-6">
          <div className="relative group cursor-pointer">
            <Avatar name={name} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <input className="glass-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input className="glass-input" value="user@example.com" disabled />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={saveName}><Save size={14} /> Save</Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 mb-6 max-w-2xl">
        <h2 className="text-lg font-bold text-on-surface mb-6">Connected Accounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">Google Calendar</p>
              <p className="text-xs text-on-surface-variant truncate">Not connected</p>
            </div>
            <Badge variant="default">Off</Badge>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Video size={20} className="text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">Cisco Webex</p>
              <p className="text-xs text-on-surface-variant truncate">Not connected</p>
            </div>
            <Badge variant="default">Off</Badge>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-on-surface mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: "emailNotifications", label: "Email notifications", desc: "Receive updates via email" },
            { key: "inAppNotifications", label: "In-app notifications", desc: "Show notifications inside Rubix" },
            { key: "dailySummary", label: "Daily summary", desc: "Get a daily digest of your tasks" },
            { key: "deadlineReminders", label: "Deadline reminders (24h before)", desc: "Get reminded before deadlines" },
            { key: "overdueAlerts", label: "Overdue alerts", desc: "Get notified when tasks are overdue" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-surface-container-low transition-colors">
              <div className="flex items-start gap-3">
                <Bell size={16} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
              <Toggle
                checked={(prefs as any)[item.key]}
                onChange={(v) => togglePref(item.key, v)}
              />
            </div>
          ))}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
