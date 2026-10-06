import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
