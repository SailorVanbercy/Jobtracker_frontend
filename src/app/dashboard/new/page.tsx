"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertIcon,
  Brand,
  CARD_CLASS,
  ERROR_ALERT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  Spinner,
} from "@/components/ui";

export default function NewApplicationPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState(""); // Nouvel état pour stocker l'annonce
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Gestion du bouton de chargement
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Verrouille le formulaire pendant l'analyse IA

    try {
      // Appel API avec la nouvelle variable jobDescription
      const res = await fetch("http://localhost:8080/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, jobTitle, jobDescription }),
        credentials: "include",
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Erreur lors de la création de la candidature.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false); // Déverrouille le bouton qu'il y ait succès ou erreur
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-900/6">
        <div className="mx-auto max-w-6xl px-6 py-3.5">
          <Brand />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 pb-20 pt-12">
        <h1 className="mb-8 animate-fade-up font-display text-4xl font-medium tracking-tight text-ink">
          Ajouter une candidature
        </h1>

        <form onSubmit={handleSubmit} className={`${CARD_CLASS} animate-fade-up overflow-hidden [animation-delay:80ms]`}>
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
                Description de l'offre (Optionnel - Déclenche l'IA)
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={9}
                placeholder="Collez le texte de l'annonce ici pour analyser votre compatibilité..."
                className={`${INPUT_CLASS} resize-y leading-relaxed`}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-stone-900/6 bg-stone-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
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
              {isLoading ? "Analyse IA en cours..." : "Ajouter & Analyser"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
