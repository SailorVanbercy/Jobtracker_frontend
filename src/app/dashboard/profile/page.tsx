"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertIcon,
  Brand,
  CARD_CLASS,
  ERROR_ALERT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  Spinner,
} from "@/components/ui";

export default function ProfilePage() {
  // Déclaration des états pour le fichier et les messages
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "Veuillez sélectionner un fichier PDF.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    // L'objet FormData est obligatoire pour envoyer des fichiers en JavaScript
    const formData = new FormData();
    formData.append("file", file); // La clé "file" doit correspondre à ce qu'attend Spring Boot

    try {
      // Appel API vers la route d'upload (à adapter selon ton backend exact)
      const res = await fetch("http://localhost:8080/api/users/me/resume", {
        method: "POST",
        // Pas besoin de définir le "Content-Type", fetch le gère tout seul avec FormData
        body: formData,
        credentials: "include", // Indispensable pour envoyer ton cookie JWT
      });

      if (res.ok) {
        setMessage({ text: "CV sauvegardé et extrait avec succès !", type: "success" });
        setFile(null); // On vide le champ après succès
        router.push("/dashboard");

      } else {
        setMessage({ text: "Erreur lors de l'envoi du CV.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Erreur de connexion au serveur.", type: "error" });
    } finally {
      setIsLoading(false);
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
          Mon Profil
        </h1>

        <section className={`${CARD_CLASS} animate-fade-up overflow-hidden [animation-delay:80ms]`}>
          <div className="border-b border-stone-900/6 px-6 py-5 sm:px-8">
            <h2 className="text-[15px] font-semibold text-ink">Mettre à jour mon CV (PDF)</h2>
          </div>

          <div className="p-6 sm:p-8">
            {/* Affichage des messages de succès ou d'erreur */}
            {message.text && (
              <div
                role={message.type === "error" ? "alert" : "status"}
                className={`mb-6 ${
                  message.type === "error"
                    ? ERROR_ALERT_CLASS
                    : "flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
                }`}
              >
                {message.type === "error" && <AlertIcon />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label htmlFor="resume" className={LABEL_CLASS}>
                  Sélectionnez votre CV (.pdf uniquement)
                </label>
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-5 transition-colors hover:border-teal-700/40 hover:bg-teal-50/30">
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
                      accept="application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full min-w-0 cursor-pointer text-sm text-stone-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-ink file:shadow-[0_1px_2px_rgba(28,25,23,0.06)] file:ring-1 file:ring-stone-900/10 file:transition-colors hover:file:bg-stone-50 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-teal-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isLoading}
                    />
                  </div>
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
    </div>
  );
}
