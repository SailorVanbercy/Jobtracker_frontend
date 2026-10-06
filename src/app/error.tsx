"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Brand, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Brand />
      <h1 className="mt-12 animate-fade-up font-display text-4xl font-medium tracking-tight text-ink">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
        Quelque chose s&apos;est mal passé de notre côté. Vous pouvez réessayer ou revenir au tableau de bord.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className={PRIMARY_BUTTON_CLASS}>
          Réessayer
        </button>
        <Link href="/dashboard" className={SECONDARY_BUTTON_CLASS}>
          Tableau de bord
        </Link>
      </div>
    </main>
  );
}
