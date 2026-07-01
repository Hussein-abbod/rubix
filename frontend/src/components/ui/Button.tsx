import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3";

  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
          ? "btn-danger"
          : "btn-ghost";

  return (
    <button className={`${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
