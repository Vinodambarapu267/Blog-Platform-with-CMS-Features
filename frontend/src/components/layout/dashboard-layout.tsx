import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ambient min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
