import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Plus, ChevronRight, ChevronLeft, Loader2, FileText, Users, Sparkles, Save } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { StepIndicator } from "../components/ui/StepIndicator";
import { Avatar } from "../components/ui/Avatar";
import axios from "axios";

const STEPS = [
  { label: "Details" },
  { label: "Upload" },
  { label: "Parsing" },
  { label: "Sections" },
  { label: "Team" },
  { label: "Review" },
];

interface SectionData {
  tempId: string;
  heading: string;
  wordCount: number;
  pageConstraints: string;
  requirements: string;
}

interface FormData {
  name: string;
  description: string;
  deadline: string;
  file: File | null;
  sections: SectionData[];
  memberIds: string[];
  memberNames: string[];
}

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function CreateProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    deadline: "",
    file: null,
    sections: [],
    memberIds: [],
    memberNames: [],
  });
  const [parsing, setParsing] = useState(false);
  const [parsingMessage, setParsingMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ _id: string; name: string; email: string; avatar?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`${API}/api/users/search?q=${searchTerm}`, {
          withCredentials: true
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const update = (field: Partial<FormData>) => setForm((prev) => ({ ...prev, ...field }));

  const canGoNext = () => {
    switch (step) {
      case 0: return form.name.trim().length > 0 && form.deadline.length > 0;
      case 1: return form.file !== null;
      case 2: return !parsing;
      case 3: return form.sections.length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      update({ file });
      setError("");
    } else {
      setError("Only PDF files are accepted");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        update({ file });
        setError("");
      } else {
        setError("Only PDF files are accepted");
      }
    }
  };

  const startParsing = async () => {
    if (!form.file) return;
    setParsing(true);
    setStep(2);
    setParsingMessage("Uploading PDF...");

    try {
      const formData = new FormData();
      formData.append("file", form.file);

      const uploadRes = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setParsingMessage("Analyzing document...");

      const mockSections: SectionData[] = [
        { tempId: "temp-0", heading: "Introduction", wordCount: 500, pageConstraints: "Pages 1-2", requirements: "Background and problem statement" },
        { tempId: "temp-1", heading: "Literature Review", wordCount: 1000, pageConstraints: "Pages 3-6", requirements: "Review existing work" },
        { tempId: "temp-2", heading: "Methodology", wordCount: 1500, pageConstraints: "Pages 7-10", requirements: "Describe approach" },
        { tempId: "temp-3", heading: "Results", wordCount: 1000, pageConstraints: "Pages 11-14", requirements: "Present findings" },
        { tempId: "temp-4", heading: "Conclusion", wordCount: 500, pageConstraints: "Pages 15-16", requirements: "Summarize and future work" },
      ];

      await new Promise((r) => setTimeout(r, 1000));

      setForm((prev) => ({ ...prev, sections: mockSections }));
      setParsingMessage("");
      setParsing(false);
      setStep(3);
    } catch (err) {
      setError("Upload failed. You can add sections manually.");
      setParsing(false);
    }
  };

  const addSection = () => {
    const newSection: SectionData = {
      tempId: `temp-${Date.now()}`,
      heading: "",
      wordCount: 0,
      pageConstraints: "",
      requirements: "",
    };
    setForm((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSection = (tempId: string, field: Partial<SectionData>) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.tempId === tempId ? { ...s, ...field } : s)),
    }));
  };

  const removeSection = (tempId: string) => {
    setForm((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.tempId !== tempId) }));
  };

  const addMember = (id: string, name: string) => {
    if (!form.memberIds.includes(id)) {
      setForm((prev) => ({
        ...prev,
        memberIds: [...prev.memberIds, id],
        memberNames: [...prev.memberNames, name],
      }));
    }
  };

  const removeMember = (id: string) => {
    const idx = form.memberIds.indexOf(id);
    if (idx > -1) {
      setForm((prev) => ({
        ...prev,
        memberIds: prev.memberIds.filter((_, i) => i !== idx),
        memberNames: prev.memberNames.filter((_, i) => i !== idx),
      }));
    }
  };

  const createProject = async () => {
    setCreating(true);
    setError("");

    try {
      const payload: Record<string, any> = {
        name: form.name,
        description: form.description,
        deadline: form.deadline,
        sections: form.sections,
        memberIds: form.memberIds,
      };

      const res = await axios.post(`${API}/api/projects`, payload);

      navigate(`/projects/${res.data._id}/board`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-6 md:px-12 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="btn-ghost p-2">
              <ChevronLeft size={20} />
            </button>
            <span className="text-xl font-extrabold tracking-tight gradient-text">RUBIX</span>
          </div>
          <span className="text-sm text-on-surface-variant font-medium">
            Step {step + 1} of 6
          </span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-8">
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/30 border border-error/20 rounded-xl text-error text-sm flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
            <button onClick={() => setError("")} className="ml-auto p-1 hover:bg-error/10 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {step === 0 && (
          <div className="glass-card rounded-2xl p-8 md:p-10 fade-in-up">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Project Details</h2>
            <p className="text-on-surface-variant mb-8">Tell us about your project.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Project Name *</label>
                <input
                  className="glass-input"
                  placeholder="e.g., CS301 Final Report"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
                <textarea
                  className="glass-input min-h-[100px] resize-y"
                  placeholder="Brief overview of the project..."
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Deadline *</label>
                <input
                  type="date"
                  className="glass-input"
                  value={form.deadline}
                  onChange={(e) => update({ deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={() => setStep(1)} disabled={!canGoNext()}>
                Next Step <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="glass-card rounded-2xl p-8 md:p-10 fade-in-up">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Upload Guideline</h2>
            <p className="text-on-surface-variant mb-8">Upload your project guideline PDF. Rubix will extract all sections automatically.</p>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragOver
                  ? "border-primary-container bg-primary-fixed/30"
                  : "border-outline-variant hover:border-primary-container/50 hover:bg-surface-container-low"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {form.file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center">
                    <FileText size={32} className="text-primary" />
                  </div>
                  <p className="font-semibold text-on-surface">{form.file.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {(form.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); update({ file: null }); }}
                    className="text-sm text-error hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
                    <Upload size={28} className="text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">
                      Drag & drop your PDF here, or <span className="text-primary-container underline">browse</span>
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">PDF only, max 50MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={() => setStep(0)}>
                <ChevronLeft size={16} /> Back
              </Button>
              <Button onClick={startParsing} disabled={!form.file}>
                Parse with AI <Sparkles size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card rounded-2xl p-12 md:p-16 text-center fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
              {parsing ? (
                <Loader2 size={40} className="text-primary animate-spin" />
              ) : (
                <Sparkles size={40} className="text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">
              {parsing ? "Analyzing Your Document" : "Parsing Complete"}
            </h2>
            <p className="text-on-surface-variant mb-2">
              {parsingMessage || "Extracting sections and requirements..."}
            </p>
            <p className="text-xs text-on-surface-variant/60">This usually takes 10-30 seconds</p>

            {!parsing && form.sections.length === 0 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-sm text-on-surface-variant">No sections could be detected.</p>
                <Button variant="secondary" onClick={() => { setStep(3); addSection(); }}>
                  Add Sections Manually
                </Button>
              </div>
            )}

            {!parsing && form.sections.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-on-surface mb-4">
                  {form.sections.length} sections extracted
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="glass-card rounded-2xl p-8 md:p-10 fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Review Sections</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {form.sections.length} sections — edit headings, word counts, and requirements
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={addSection}>
                <Plus size={14} /> Add Section
              </Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto glass-scroll pr-2">
              {form.sections.map((section, i) => (
                <div
                  key={section.tempId}
                  className="glass-card rounded-xl p-5 relative group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-primary-container bg-primary-fixed w-6 h-6 rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <input
                      className="flex-1 glass-input !py-2 !px-3 text-sm font-semibold"
                      placeholder="Section title"
                      value={section.heading}
                      onChange={(e) => updateSection(section.tempId, { heading: e.target.value })}
                    />
                    <button
                      onClick={() => removeSection(section.tempId)}
                      className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-on-surface-variant mb-1 block">Word Count</label>
                      <input
                        type="number"
                        className="glass-input !py-2 !px-3 text-sm"
                        placeholder="0"
                        value={section.wordCount}
                        onChange={(e) => updateSection(section.tempId, { wordCount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-on-surface-variant mb-1 block">Pages</label>
                      <input
                        className="glass-input !py-2 !px-3 text-sm"
                        placeholder="e.g., Pages 3-5"
                        value={section.pageConstraints}
                        onChange={(e) => updateSection(section.tempId, { pageConstraints: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-xs font-medium text-on-surface-variant mb-1 block">Key Requirements</label>
                      <input
                        className="glass-input !py-2 !px-3 text-sm"
                        placeholder="e.g., Include diagrams"
                        value={section.requirements}
                        onChange={(e) => updateSection(section.tempId, { requirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={form.sections.length === 0}>
                Next: Add Team <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="glass-card rounded-2xl p-8 md:p-10 fade-in-up">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Add Team Members</h2>
            <p className="text-on-surface-variant mb-8">Invite collaborators to work on this project.</p>

            {form.memberIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {form.memberNames.map((name, i) => (
                  <div
                    key={form.memberIds[i]}
                    className="glass-card rounded-full py-1.5 pl-1.5 pr-3 flex items-center gap-2"
                  >
                    <Avatar name={name} size="sm" />
                    <span className="text-sm font-medium">{name}</span>
                    <button
                      onClick={() => removeMember(form.memberIds[i])}
                      className="p-0.5 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative mb-4">
              <input
                className="glass-input pl-10"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            </div>

            {searchTerm && (
              <div className="glass-card rounded-xl p-2 mb-4 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-on-surface-variant flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => {
                          addMember(user._id, user.name);
                          setSearchTerm("");
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-surface-container flex items-center gap-3 transition-colors"
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
                  <div className="p-4 text-center text-sm text-on-surface-variant">
                    No users found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={() => setStep(3)}>
                <ChevronLeft size={16} /> Back
              </Button>
              <Button onClick={() => setStep(5)}>
                Review & Create <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="glass-card rounded-2xl p-8 md:p-10 fade-in-up">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Review & Create</h2>
            <p className="text-on-surface-variant mb-8">Confirm your project details before creating.</p>

            <div className="space-y-4">
              <div className="glass-card rounded-xl p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Project Name</p>
                    <p className="font-semibold text-on-surface">{form.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Deadline</p>
                    <p className="font-semibold text-on-surface">{form.deadline || "Not set"}</p>
                  </div>
                  {form.description && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Description</p>
                      <p className="text-on-surface-variant text-sm">{form.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-xl p-5">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Sections ({form.sections.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {form.sections.map((s, i) => (
                    <span key={s.tempId} className="glass-input !py-1 !px-3 text-xs font-medium inline-flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary text-[9px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {s.heading || "Untitled"}
                    </span>
                  ))}
                </div>
              </div>

              {form.memberIds.length > 0 && (
                <div className="glass-card rounded-xl p-5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                    Team Members ({form.memberIds.length + 1})
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar name="You" size="sm" />
                      <span className="text-sm font-medium">You <span className="text-xs text-on-surface-variant">(Owner)</span></span>
                    </div>
                    {form.memberNames.map((name, i) => (
                      <div key={form.memberIds[i]} className="flex items-center gap-2">
                        <Avatar name={name} size="sm" />
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={() => setStep(4)} disabled={creating}>
                <ChevronLeft size={16} /> Back
              </Button>
              <Button onClick={createProject} disabled={creating}>
                {creating ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating...</>
                ) : (
                  <><Save size={16} /> Create Project</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
