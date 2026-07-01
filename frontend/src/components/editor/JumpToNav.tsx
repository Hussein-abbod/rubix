import { CheckCircle, Circle, PlayCircle, FileText } from "lucide-react";
import { Avatar } from "../ui/Avatar";

interface NavSection {
  sectionId: string;
  heading: string;
  status: string;
  assignedTo?: { _id: string; name: string } | null;
  isCurrentUser?: boolean;
}

interface JumpToNavProps {
  sections: NavSection[];
  activeSectionId?: string;
  onNavigate: (sectionId: string) => void;
  currentUserId?: string;
}

const statusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle size={14} className="text-emerald-500" />;
    case "in_progress": return <PlayCircle size={14} className="text-blue-500" />;
    case "review": return <FileText size={14} className="text-amber-500" />;
    default: return <Circle size={14} className="text-outline-variant" />;
  }
};

export function JumpToNav({ sections, activeSectionId, onNavigate, currentUserId }: JumpToNavProps) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-1">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-2">
        Sections ({sections.length})
      </p>
      {sections.map((section) => {
        const isActive = section.sectionId === activeSectionId;
        const isMine = section.assignedTo?._id === currentUserId;
        return (
          <button
            key={section.sectionId}
            onClick={() => onNavigate(section.sectionId)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
              isActive
                ? "bg-primary-fixed text-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            {statusIcon(section.status)}
            <span className="flex-1 truncate">{section.heading}</span>
            {isMine && (
              <span className="w-2 h-2 rounded-full bg-primary-container" title="Your section" />
            )}
          </button>
        );
      })}
    </div>
  );
}
