import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Download } from "lucide-react";
import axios from "axios";
import { EditorPanel, type PanelMode } from "../components/editor/EditorPanel";
import { SectionBlock } from "../components/editor/SectionBlock";
import { JumpToNav } from "../components/editor/JumpToNav";
import { downloadAsWord } from "../lib/exportWord";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface SectionData {
  _id: string;
  heading: string;
  content: any;
  assignedTo: { _id: string; name: string; avatar?: string } | null;
  lockedBy: { _id: string; name: string; avatar?: string } | null;
  status: string;
  order: number;
  wordCount: number;
}

export function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("full");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [projectName, setProjectName] = useState("Document");
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const socketRef = useRef<WebSocket | null>(null);
  const dirtySections = useRef<Set<string>>(new Set());
  const sectionsRef = useRef<SectionData[]>([]); // always-current ref to avoid stale closures

  useEffect(() => {
    // Fetch current user ID first
    axios.get(`${API}/api/users/me`)
      .then((res) => setCurrentUserId(res.data.id || res.data._id || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [projectRes, sectionsRes] = await Promise.all([
          axios.get(`${API}/api/projects/${id}`),
          axios.get(`${API}/api/projects/${id}/sections`),
        ]);

        setProjectName(projectRes.data.name);
        setSections(sectionsRes.data);
        sectionsRef.current = sectionsRes.data;
        setLoading(false);
      } catch {
        setError("Failed to load document");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const saveDirty = useCallback(async () => {
    if (dirtySections.current.size === 0) return;
    setSaveStatus("saving");

    const toSave = Array.from(dirtySections.current);
    dirtySections.current = new Set();

    try {
      await Promise.all(
        toSave.map((sectionId) => {
          // Use sectionsRef so we always get the latest content, not stale closure
          const section = sectionsRef.current.find((s) => s._id === sectionId);
          if (!section) return Promise.resolve();
          return axios.put(
            `${API}/api/sections/${sectionId}`,
            { content: section.content }
          );
        })
      );
      setSaveStatus("saved");
    } catch {
      toSave.forEach((sid) => dirtySections.current.add(sid));
      setSaveStatus("unsaved");
    }
  }, []);

  const handleContentChange = useCallback((sectionId: string) => (content: any) => {
    setSections((prev) => {
      const updated = prev.map((s) => (s._id === sectionId ? { ...s, content } : s));
      sectionsRef.current = updated; // keep ref in sync
      return updated;
    });
    dirtySections.current.add(sectionId);
    setSaveStatus("unsaved");
    // Debounce: reset timer on every keystroke, save 2s after last change
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveDirty(), 2000);
  }, [saveDirty]);

  const handleFocus = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
    },
    []
  );

  const handleBlur = useCallback(
    (sectionId: string) => {
      if (dirtySections.current.has(sectionId)) {
        saveDirty();
      }
    },
    [saveDirty]
  );

  const handleSubmitReview = useCallback(
    async (sectionId: string) => {
      try {
        await axios.put(`${API}/api/sections/${sectionId}/status`, { status: "completed" });
        setSections((prev) =>
          prev.map((s) => (s._id === sectionId ? { ...s, status: "completed" } : s))
        );
      } catch {
        setError("Failed to submit section");
      }
    },
    []
  );

  const handleRecallReview = useCallback(
    async (sectionId: string) => {
      try {
        // Reopen: move back from completed → in_progress so user can edit and resubmit
        await axios.put(`${API}/api/sections/${sectionId}/status`, { status: "in_progress" });
        setSections((prev) =>
          prev.map((s) => (s._id === sectionId ? { ...s, status: "in_progress" } : s))
        );
      } catch {
        setError("Failed to reopen section");
      }
    },
    []
  );

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionId(sectionId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <p className="text-error font-semibold mb-4">{error}</p>
          <button onClick={() => navigate(`/projects/${id}/board`)} className="btn-primary">
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  const mySections = sections.filter((s) => s.assignedTo?._id === currentUserId);
  const myUpcoming = mySections.filter((s) => s.status !== "completed" && s.status !== "review");

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <div className="w-56 border-r border-outline-variant/20 overflow-y-auto glass-scroll p-3 flex-shrink-0 hidden lg:block">
        <div className="mb-4 px-2">
          <button
            onClick={() => navigate(`/projects/${id}/board`)}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Back to Board
          </button>
          <h2 className="text-sm font-bold text-on-surface truncate">{projectName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs flex items-center gap-1 ${
              saveStatus === "saved" ? "text-emerald-600" : saveStatus === "saving" ? "text-amber-600" : "text-on-surface-variant"
            }`}>
              <Save size={12} />
              {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"}
            </span>
          </div>
          <button
            onClick={() => downloadAsWord(projectName, sectionsRef.current)}
            className="flex items-center gap-1.5 text-xs text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 px-2 py-1.5 rounded-lg mt-3 transition-colors w-full justify-center font-medium"
          >
            <Download size={14} /> Export to Word
          </button>
        </div>

        {myUpcoming.length > 0 && (
          <div className="mb-4 px-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">My Tasks</p>
            {myUpcoming.map((s) => (
              <button
                key={s._id}
                onClick={() => scrollToSection(s._id)}
                className="w-full text-left text-xs py-1.5 px-2 rounded-lg hover:bg-primary-fixed/50 text-on-surface-variant hover:text-primary transition-all"
              >
                {s.heading}
              </button>
            ))}
          </div>
        )}

        <JumpToNav
          sections={sections.map((s) => ({
            sectionId: s._id,
            heading: s.heading,
            status: s.status,
            assignedTo: s.assignedTo,
            isCurrentUser: s.assignedTo?._id === currentUserId,
          }))}
          activeSectionId={activeSectionId || undefined}
          onNavigate={scrollToSection}
          currentUserId={currentUserId}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <EditorPanel mode={panelMode} onModeChange={setPanelMode} title={projectName}>
          {sections.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-on-surface-variant">No sections yet.</p>
            </div>
          ) : (
            sections
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const isMySection = section.assignedTo?._id === currentUserId;
                const isLockedByOther = !!section.lockedBy && section.lockedBy._id !== currentUserId;

                return (
                  <div key={section._id} id={`section-${section._id}`}>
                    <SectionBlock
                      sectionId={section._id}
                      heading={section.heading}
                      content={section.content}
                      assignedTo={section.assignedTo}
                      lockedBy={section.lockedBy}
                      status={section.status}
                      isCurrentUser={!!isMySection}
                      isLocked={!!isLockedByOther}
                      onContentChange={handleContentChange(section._id)}
                      onSubmitReview={() => handleSubmitReview(section._id)}
                      onRecallReview={() => handleRecallReview(section._id)}
                      onFocus={() => handleFocus(section._id)}
                      onBlur={() => handleBlur(section._id)}
                    />
                  </div>
                );
              })
          )}
        </EditorPanel>
      </div>
    </div>
  );
}
