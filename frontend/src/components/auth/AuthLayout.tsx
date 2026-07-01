import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <span className="text-4xl font-extrabold tracking-tight gradient-text-light">RUBIX</span>
          <p className="text-white/70 text-lg mt-4 leading-relaxed">
            From Guideline Chaos to Automated Execution in One Click.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <span className="text-2xl font-extrabold tracking-tight gradient-text lg:hidden mb-8 block">RUBIX</span>
          <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
