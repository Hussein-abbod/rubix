import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <TopBar />
        <main className="p-6 md:p-10">
          {title && (
            <h1 className="text-2xl font-bold text-on-surface mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
