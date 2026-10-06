"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "./toast";
import { Brand, PRIMARY_BUTTON_CLASS, Spinner } from "./ui";

const PROFILE_PATH = "/dashboard/profile";
const NEW_APPLICATION_PATH = "/dashboard/new";

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isProfile = pathname === PROFILE_PATH;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Le backend expire le cookie HttpOnly "jwt_token"
      const res = await apiFetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        showToast("Vous êtes déconnecté.", "info");
        router.push("/login");
        return;
      }
      showToast("La déconnexion a échoué. Réessayez.", "error");
    } catch {
      showToast("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.", "error");
    }
    setIsLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-stone-900/6 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          aria-label="Retour au tableau de bord"
          className="rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20"
        >
          <Brand />
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href={PROFILE_PATH}
            aria-current={isProfile ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-900/4 hover:text-ink ${
              isProfile ? "bg-stone-900/5 text-ink" : "text-stone-600"
            }`}
          >
            Mon Profil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-900/4 hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoggingOut ? (
              <Spinner />
            ) : (
              <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
              </svg>
            )}
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
          {pathname !== NEW_APPLICATION_PATH && (
            <Link href={NEW_APPLICATION_PATH} className={`${PRIMARY_BUTTON_CLASS} ml-1`}>
              <span aria-hidden className="text-base leading-none">+</span>
              <span className="sm:hidden">Nouvelle</span>
              <span className="hidden sm:inline">Nouvelle candidature</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
