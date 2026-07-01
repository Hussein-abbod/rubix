import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = "", hover = false, padding = true, onClick }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hover ? "glass-hover" : ""} ${padding ? "rounded-xl p-6" : "rounded-xl"} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
