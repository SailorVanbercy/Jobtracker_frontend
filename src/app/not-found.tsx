import Link from "next/link";
import { Brand, PRIMARY_BUTTON_CLASS } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Brand />
      <p className="mt-12 font-mono text-sm font-medium text-teal-800">404</p>
      <h1 className="mt-2 animate-fade-up font-display text-4xl font-medium tracking-tight text-ink">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
        La page demandée n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/dashboard" className={`${PRIMARY_BUTTON_CLASS} mt-8`}>
        Retour au tableau de bord
      </Link>
    </main>
  );
}
