import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Nouvelle candidature" };

export default function NewApplicationLayout({ children }: { children: ReactNode }) {
  return children;
}
