import { Maximize2, Minimize2, PanelRight, PanelRightClose, ChevronDown } from "lucide-react";

export type PanelMode = "full" | "side" | "minimized";

interface EditorPanelProps {
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  title: string;
  children: React.ReactNode;
}

export function EditorPanel({ mode, onModeChange, title, children }: EditorPanelProps) {
  if (mode === "minimized") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-b-0 px-6 py-3">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-on-surface">{title}</span>
            <span className="text-xs text-on-surface-variant">— Editor minimized</span>
          </div>
          <button
            onClick={() => onModeChange("full")}
            className="btn-primary !py-1.5 !px-4 text-xs"
          >
            <Maximize2 size={14} /> Expand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Editor area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${mode === "side" ? "" : "w-full"}`}>
        {/* Panel header */}
        <div className="glass-card rounded-none border-x-0 border-t-0 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-on-surface">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onModeChange("side")}
              className={`p-1.5 rounded-md transition-all ${
                mode === "side" ? "bg-primary-fixed text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Side-by-side"
            >
              <PanelRight size={16} />
            </button>
            <button
              onClick={() => onModeChange("full")}
              className={`p-1.5 rounded-md transition-all ${
                mode === "full" ? "bg-primary-fixed text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Full screen"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => onModeChange("minimized")}
              className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface transition-all"
              title="Minimize"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto glass-scroll px-6 py-6 space-y-6 max-w-[900px] mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
