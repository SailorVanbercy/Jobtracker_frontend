"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import {
  AlertIcon,
  CARD_CLASS,
  ERROR_ALERT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  Spinner,
} from "@/components/ui";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSessionExpired } from "@/hooks/use-session-expired";
import { apiFetch, isUnauthorized } from "@/lib/api";

// Matches Spring Boot's default multipart limit (spring.servlet.multipart.max-file-size=1MB).
const MAX_RESUME_SIZE_MB = 1;
const BYTES_PER_MB = 1024 * 1024;
const PDF_MIME_TYPE = "application/pdf";

const formatFileSize = (bytes: number) => `${(bytes / BYTES_PER_MB).toFixed(1)} Mo`;

export default function ProfilePage() {
  // Déclaration des états pour le fichier et les messages
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const showToast = useToast();
  const onSessionExpired = useSessionExpired();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (currentUser.kind === "unauthorized") onSessionExpired();
  }, [currentUser.kind, onSessionExpired]);

  // Returns false when the selected file is rejected, so the caller can clear the native input.
  const handleFileChange = (selected: File | null) => {
    setError("");
    if (selected && selected.type !== PDF_MIME_TYPE) {
      setFile(null);
      setError("Seuls les fichiers PDF sont acceptés.");
      return false;
    }
    if (selected && selected.size > MAX_RESUME_SIZE_MB * BYTES_PER_MB) {
      setFile(null);
      setError(`Le fichier dépasse la taille maximale de ${MAX_RESUME_SIZE_MB} Mo.`);
      return false;
    }
    setFile(selected);
    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    setIsLoading(true);
    setError("");

    // L'objet FormData est obligatoire pour envoyer des fichiers en JavaScript
    const formData = new FormData();
    formData.append("file", file); // La clé "file" doit correspondre à ce qu'attend Spring Boot

    try {
      // Pas besoin de définir le "Content-Type", fetch le gère tout seul avec FormData
      const res = await apiFetch("/api/users/me/resume", { method: "POST", body: formData });

      if (res.ok) {
        // Le toast reste visible après la redirection vers le tableau de bord
        showToast("CV sauvegardé et extrait avec succès !", "success");
        router.push("/dashboard");
        return;
      }
      if (isUnauthorized(res)) {
        onSessionExpired();
        return;
      }
      setError("Erreur lors de l'envoi du CV.");
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    }
    setIsLoading(false);
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-stone-500 transition-colors hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20"
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        Tableau de bord
      </Link>

      <h1 className="mb-8 animate-fade-up font-display text-4xl font-medium tracking-tight text-ink">
        Mon Profil
      </h1>

      {/* Informations du compte connecté */}
      <section
        aria-labelledby="account-title"
        className={`${CARD_CLASS} mb-6 animate-fade-up px-6 py-5 [animation-delay:40ms] sm:px-8`}
      >
        <h2 id="account-title" className="sr-only">Mon compte</h2>
        {currentUser.kind === "ok" ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-stone-500">Email</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-ink" title={currentUser.profile.email}>
                {currentUser.profile.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">CV</dt>
              <dd className="mt-1">
                {currentUser.profile.hasResume ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                    <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                    CV enregistré
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                    <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
                    Aucun CV enregistré
                  </span>
                )}
              </dd>
            </div>
          </dl>
        ) : currentUser.kind === "error" ? (
          <p className="text-sm text-stone-500">Les informations du compte sont indisponibles pour le moment.</p>
        ) : (
          <div aria-hidden className="grid animate-pulse gap-4 sm:grid-cols-2">
            {[0, 1].map((index) => (
              <div key={index} className="space-y-2">
                <span className="block h-2.5 w-12 rounded-full bg-stone-100" />
                <span className="block h-3.5 w-40 rounded-full bg-stone-200" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={`${CARD_CLASS} animate-fade-up overflow-hidden [animation-delay:80ms]`}>
        <div className="border-b border-stone-900/6 px-6 py-5 sm:px-8">
          <h2 className="text-[15px] font-semibold text-ink">
            {currentUser.kind === "ok" && currentUser.profile.hasResume
              ? "Remplacer mon CV (PDF)"
              : "Mettre à jour mon CV (PDF)"}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Votre CV sert de référence pour calculer le score de compatibilité de chaque offre.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Affichage des messages d'erreur */}
          {error && (
            <div role="alert" className={`${ERROR_ALERT_CLASS} mb-6`}>
              <AlertIcon />
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} aria-busy={isLoading} className="space-y-6">
            <div>
              <label htmlFor="resume" className={LABEL_CLASS}>
                Sélectionnez votre CV (.pdf uniquement)
              </label>
              <div
                className={`rounded-xl border border-dashed p-5 transition-colors ${
                  file
                    ? "border-teal-700/40 bg-teal-50/40"
                    : "border-stone-300 bg-stone-50/60 hover:border-teal-700/40 hover:bg-teal-50/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-teal-800 ring-1 ring-stone-900/6"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </span>
                  <input
                    id="resume"
                    type="file"
                    accept={PDF_MIME_TYPE}
                    aria-describedby="resume-hint"
                    onChange={(e) => {
                      if (!handleFileChange(e.target.files?.[0] || null)) e.target.value = "";
                    }}
                    className="block w-full min-w-0 cursor-pointer text-sm text-stone-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-ink file:shadow-[0_1px_2px_rgba(28,25,23,0.06)] file:ring-1 file:ring-stone-900/10 file:transition-colors hover:file:bg-stone-50 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-teal-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading}
                  />
                </div>
                <p id="resume-hint" className="mt-3 text-xs text-stone-500">
                  {file
                    ? `${file.name} · ${formatFileSize(file.size)}`
                    : `PDF uniquement, ${MAX_RESUME_SIZE_MB} Mo maximum.`}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !file}
                className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}
              >
                {isLoading && <Spinner />}
                {isLoading ? "Traitement et extraction en cours..." : "Uploader mon CV"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
