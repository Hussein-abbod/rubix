import { Lock, User, CheckCircle, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { TiptapEditor } from "./TiptapEditor";

interface SectionUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface SectionBlockProps {
  sectionId: string;
  heading: string;
  content: any;
  assignedTo: SectionUser | null;
  lockedBy: SectionUser | null;
  status: string;
  isCurrentUser: boolean;
  isLocked: boolean;
  onContentChange: (json: any) => void;
  onSubmitReview?: () => void;
  onRecallReview?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SectionBlock({
  heading,
  content,
  assignedTo,
  lockedBy,
  status,
  isCurrentUser,
  isLocked,
  onContentChange,
  onSubmitReview,
  onRecallReview,
  onFocus,
  onBlur,
}: SectionBlockProps) {
  // Can edit if: assigned to me, OR unassigned (no one claimed it), AND not locked by someone else
  const canEdit = (isCurrentUser || !assignedTo) && !isLocked;
  const showLocked = isLocked && !isCurrentUser;

  const statusColor = (s: string) => {
    switch (s) {
      case "todo": return "default";
      case "in_progress": return "info";
      case "review": return "warning";
      case "completed": return "success";
      default: return "default";
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "todo": return "To-Do";
      case "in_progress": return "In Progress";
      case "review": return "In Review";
      case "completed": return "Completed";
      default: return s;
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
        isCurrentUser
          ? "border-l-4 border-l-primary-container"
          : showLocked
            ? "border-l-4 border-l-amber-400 opacity-70"
            : "border-l-4 border-l-outline-variant"
      }`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-lg font-bold text-on-surface truncate">{heading}</h3>
          <Badge variant={statusColor(status)}>{statusLabel(status)}</Badge>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Lock indicator */}
          {showLocked && lockedBy && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium">
              <Lock size={12} />
              <span>{lockedBy.name} is editing...</span>
            </div>
          )}

          {isLocked && isCurrentUser && (
            <div className="flex items-center gap-1.5 text-primary bg-primary-fixed px-2.5 py-1 rounded-full text-xs font-medium">
              <Lock size={12} />
              <span>You are editing</span>
            </div>
          )}

          {/* Assigned to */}
          {assignedTo ? (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Avatar name={assignedTo.name} src={assignedTo.avatar} size="sm" />
              <span className="hidden sm:inline">{assignedTo.name}</span>
            </div>
          ) : (
            <span className="text-xs text-on-surface-variant italic">Unassigned</span>
          )}

          {/* Mark Complete / Reopen */}
          {isCurrentUser && status !== "completed" && (
            <Button size="sm" variant="secondary" onClick={onSubmitReview}>
              <CheckCircle size={14} /> Mark Complete
            </Button>
          )}
          {isCurrentUser && status === "completed" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle size={12} /> Completed
              </span>
              <Button size="sm" variant="secondary" onClick={onRecallReview}
                className="!text-on-surface-variant"
              >
                <RotateCcw size={14} /> Reopen
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div
        onFocus={onFocus}
        onBlur={onBlur}
        className={showLocked ? "pointer-events-none select-none" : ""}
      >
        <TiptapEditor
          content={content}
          onChange={onContentChange}
          placeholder={`Write your ${heading} section here...`}
          editable={canEdit}
        />
      </div>

      {/* Footer status bar */}
      <div className="px-6 py-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Auto-saves
          </span>
          {status === "overdue" && (
            <span className="flex items-center gap-1 text-error">
              <AlertTriangle size={12} /> Overdue
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
