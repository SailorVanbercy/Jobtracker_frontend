"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";
import {
  AlertIcon,
  CARD_CLASS,
  ERROR_ALERT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  Spinner,
} from "@/components/ui";
import { useSessionExpired } from "@/hooks/use-session-expired";
import { apiFetch, isUnauthorized } from "@/lib/api";

export default function NewApplicationPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState(""); // Nouvel état pour stocker l'annonce
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Gestion du bouton de chargement
  const router = useRouter();
  const showToast = useToast();
  const onSessionExpired = useSessionExpired();

  const hasDescription = jobDescription.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Verrouille le formulaire pendant l'analyse IA

    try {
      // Appel API avec la nouvelle variable jobDescription
      const res = await apiFetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      if (res.ok) {
        showToast(
          hasDescription ? "Candidature ajoutée et analysée." : "Candidature ajoutée.",
          "success",
        );
        router.push("/dashboard");
        return; // Le formulaire reste verrouillé pendant la navigation
      }
      if (isUnauthorized(res)) {
        onSessionExpired();
        return;
      }
      setError("Erreur lors de la création de la candidature.");
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    }
    setIsLoading(false); // Déverrouille le bouton en cas d'erreur
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
        Ajouter une candidature
      </h1>

      <form
        onSubmit={handleSubmit}
        aria-busy={isLoading}
        className={`${CARD_CLASS} animate-fade-up overflow-hidden [animation-delay:80ms]`}
      >
        <div className="space-y-5 p-6 sm:p-8">
          {error && (
            <div role="alert" className={ERROR_ALERT_CLASS}>
              <AlertIcon />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="companyName" className={LABEL_CLASS}>Entreprise</label>
              <input
                id="companyName"
                type="text"
                autoComplete="organization"
                autoFocus
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={INPUT_CLASS}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className={LABEL_CLASS}>Poste</label>
              <input
                id="jobTitle"
                type="text"
                autoComplete="organization-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={INPUT_CLASS}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="jobDescription" className={LABEL_CLASS}>
              Description de l&apos;offre <span className="font-normal text-stone-400">(optionnel)</span>
            </label>
            <textarea
              id="jobDescription"
              aria-describedby="jobDescription-hint"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={9}
              placeholder="Collez le texte de l'annonce ici pour analyser votre compatibilité..."
              className={`${INPUT_CLASS} resize-y leading-relaxed`}
              disabled={isLoading}
            />
            <p id="jobDescription-hint" className="mt-1.5 flex items-start gap-1.5 text-xs text-stone-500">
              <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="mt-px size-3.5 shrink-0 text-teal-700">
                <path d="M8 1a.75.75 0 0 1 .7.48l1.2 3.12 3.12 1.2a.75.75 0 0 1 0 1.4l-3.12 1.2-1.2 3.12a.75.75 0 0 1-1.4 0L6.1 8.4 2.98 7.2a.75.75 0 0 1 0-1.4L6.1 4.6l1.2-3.12A.75.75 0 0 1 8 1Z" />
              </svg>
              Si elle est renseignée, l&apos;IA compare l&apos;annonce à votre CV et calcule un score de compatibilité.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-900/6 bg-stone-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p aria-live="polite" className="text-xs text-stone-500">
            {isLoading && hasDescription && "L'analyse peut prendre quelques secondes, merci de patienter."}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={SECONDARY_BUTTON_CLASS}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button type="submit" disabled={isLoading} className={PRIMARY_BUTTON_CLASS}>
              {isLoading && <Spinner />}
              {isLoading
                ? hasDescription ? "Analyse IA en cours..." : "Enregistrement..."
                : hasDescription ? "Ajouter & Analyser" : "Ajouter"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
