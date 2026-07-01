import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Video, Check, Link, ExternalLink, X } from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProjectSubNav } from "../components/layout/ProjectSubNav";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface IntegrationStatus {
  google: { connected: boolean; email?: string | null };
  webex: { connected: boolean; name?: string | null };
}

export function Integrations() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<IntegrationStatus>({ google: { connected: false }, webex: { connected: false } });
  const [reminder, setReminder] = useState("1440");
  const [webexPrefs, setWebexPrefs] = useState({ reminder24h: true, dailySummary: true, overdueAlerts: true });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/integrations/status`);
        setStatus(res.data);
      } catch {}
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-on-surface">Integrations</h1>
      </div>
      <ProjectSubNav />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">Google Calendar</h3>
                <Badge variant={status.google.connected ? "success" : "default"} dot>
                  {status.google.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
          </div>

          {status.google.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <Check size={16} />
                Connected as {status.google.email || "your account"}
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Default Reminder</label>
                <select className="glass-input" value={reminder} onChange={(e) => setReminder(e.target.value)}>
                  <option value="0">At time of event</option>
                  <option value="10">10 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">24 hours before</option>
                </select>
              </div>

              <Button size="sm" variant="secondary"><Calendar size={14} /> Sync Now</Button>

              <div className="pt-4 border-t border-outline-variant/30">
                <button className="text-xs text-on-surface-variant hover:text-error transition-colors">Disconnect</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-on-surface-variant mb-4">Sync deadlines to Google Calendar so your team never misses a due date.</p>
              <Button size="sm"><Calendar size={14} /> Connect Google Calendar</Button>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                <Video size={24} className="text-sky-600" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">Cisco Webex</h3>
                <Badge variant={status.webex.connected ? "success" : "default"} dot>
                  {status.webex.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
          </div>

          {status.webex.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <Check size={16} />
                Connected as {status.webex.name || "your account"}
              </div>

              <div className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">24-hour reminders</span>
                  <button
                    onClick={() => setWebexPrefs((p) => ({ ...p, reminder24h: !p.reminder24h }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${webexPrefs.reminder24h ? "bg-primary" : "bg-surface-variant"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${webexPrefs.reminder24h ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">Daily summary at 9 AM</span>
                  <button
                    onClick={() => setWebexPrefs((p) => ({ ...p, dailySummary: !p.dailySummary }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${webexPrefs.dailySummary ? "bg-primary" : "bg-surface-variant"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${webexPrefs.dailySummary ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">Overdue alerts</span>
                  <button
                    onClick={() => setWebexPrefs((p) => ({ ...p, overdueAlerts: !p.overdueAlerts }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${webexPrefs.overdueAlerts ? "bg-primary" : "bg-surface-variant"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${webexPrefs.overdueAlerts ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30">
                <button className="text-xs text-on-surface-variant hover:text-error transition-colors">Disconnect</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-on-surface-variant mb-4">Automatically create Webex spaces and get deadline reminders directly in your team's space.</p>
              <Button size="sm"><Video size={14} /> Connect Webex</Button>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
