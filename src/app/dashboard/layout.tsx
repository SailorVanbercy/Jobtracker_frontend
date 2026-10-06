import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard-header";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      {children}
    </div>
  );
}
