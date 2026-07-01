import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  dot?: boolean;
}

const variants = {
  default: "bg-surface-variant text-on-surface-variant border-transparent",
  primary: "bg-primary-fixed text-on-primary-fixed border-primary/20",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  error: "bg-error-container/30 text-error border-error/20",
  info: "bg-tertiary/10 text-tertiary border-tertiary/20",
};

export function Badge({ children, variant = "default", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {dot && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}
