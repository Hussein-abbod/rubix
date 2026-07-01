import { useState } from "react";
import { Target, Pencil, Check, X, Eye } from "lucide-react";

interface AIMissionCardProps {
  projectObjective: string;
  expectedOutcomes: string[];
  onSave?: (objective: string, outcomes: string[]) => void;
}

export function AIMissionCard({ projectObjective, expectedOutcomes, onSave }: AIMissionCardProps) {
  const [editing, setEditing] = useState(false);
  const [obj, setObj] = useState(projectObjective);
  const [outcomes, setOutcomes] = useState(expectedOutcomes);

  const handleSave = () => {
    onSave?.(obj, outcomes);
    setEditing(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary-container">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
            <Target size={20} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Project Objective</p>
            {editing ? (
              <textarea
                className="glass-input !py-2 !px-3 text-sm min-h-[60px] resize-y"
                value={obj}
                onChange={(e) => setObj(e.target.value)}
              />
            ) : (
              <p className="text-sm text-on-surface">{obj || "No objective set."}</p>
            )}
            {outcomes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Expected Deliverables</p>
                {editing ? (
                  <div className="space-y-2">
                    {outcomes.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          className="glass-input !py-1.5 !px-3 text-sm flex-1"
                          value={o}
                          onChange={(e) => {
                            const next = [...outcomes];
                            next[i] = e.target.value;
                            setOutcomes(next);
                          }}
                        />
                        <button
                          onClick={() => setOutcomes(outcomes.filter((_, j) => j !== i))}
                          className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setOutcomes([...outcomes, ""])}
                      className="text-xs text-primary-container font-medium hover:underline"
                    >
                      + Add deliverable
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {outcomes.filter(Boolean).map((o, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container flex-shrink-0" />
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-md bg-primary-fixed text-primary hover:bg-primary-fixed-dim transition-colors">
                <Check size={16} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface transition-colors">
                <X size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
