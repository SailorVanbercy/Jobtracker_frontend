"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertIcon,
  Brand,
  CARD_CLASS,
  ERROR_ALERT_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/ui";

const STRONG_MATCH_THRESHOLD = 75;
const MEDIUM_MATCH_THRESHOLD = 50;
const CARD_STAGGER_MS = 60;

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-700 ring-stone-200",
  APPLIED: "bg-sky-50 text-sky-800 ring-sky-200",
  INTERVIEWING: "bg-amber-50 text-amber-800 ring-amber-200",
  OFFER: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

const getScoreTone = (score: number) => {
  if (score > STRONG_MATCH_THRESHOLD) return { text: "text-emerald-700", bar: "bg-emerald-500" };
  if (score > MEDIUM_MATCH_THRESHOLD) return { text: "text-amber-700", bar: "bg-amber-500" };
  return { text: "text-rose-700", bar: "bg-rose-500" };
};

export default function DashboardPage(){
    const [applications, setApplications] = useState<any[]>([]);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchApplications = async () => {
            try{
                // Appel API pour récupérer les candidatures
                const res = await fetch("http://localhost:8080/api/applications", {
                    // Envoie le cookie JWT avec la requête
                    credentials: "include",
                });

                if(res.ok){
                    // Si le token est valide, on stocke les données
                    const data = await res.json();
                    setApplications(data);
                }else if (res.status === 401 || res.status === 403){
                    // Si pas de cookie ou cookie expiré -> retour au login
                    router.push("/login");
                }else{
                    setError("Erreur lors de la récupération des données");
                }
            }
            catch(err){
                setError("Erreur de connexion au serveur");
            }
        };
        fetchApplications();

    }, [router])

    // Appel API en DELETE pour supprimer une candidature
  const handleDelete = async (id: string) => {
    // Demande confirmation avant de lancer la suppression
    if (!window.confirm("Supprimer définitivement cette candidature ?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/applications/${id}`, {
        method: "DELETE",
        credentials: "include", // Indispensable pour l'authentification JWT
      });

      if (res.ok) {
        // Met à jour la liste affichée en retirant l'élément supprimé sans recharger la page
        setApplications(applications.filter((app: any) => app.id !== id));
      } else {
        setError("Erreur lors de la suppression.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    }
  };

  // Appel API en PUT pour modifier le statut
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include", // Conserve le cookie JWT
      });

      if (res.ok) {
        // Mise à jour de l'affichage en temps réel
        setApplications(applications.map((app: any) =>
          app.id === id ? { ...app, status: newStatus } : app
        ));
      } else {
        setError("Erreur lors de la mise à jour du statut.");
      }
    } catch (err) {
      setError("Erreur réseau.");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-900/6 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3.5">
          <Brand />

          <nav className="flex items-center gap-1.5">
            {/* Bouton vers le profil */}
            <Link
              href="/dashboard/profile"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-900/4 hover:text-ink"
            >
              Mon Profil
            </Link>
            <Link href="/dashboard/new" className={PRIMARY_BUTTON_CLASS}>
              + Nouvelle candidature
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <h1 className="animate-fade-up font-display text-4xl font-medium tracking-tight text-ink sm:text-[2.75rem]">
          Mon Tableau de Bord
        </h1>

        {error && (
          <div role="alert" className={`${ERROR_ALERT_CLASS} mt-6`}>
            <AlertIcon />
            {error}
          </div>
        )}

        <div className="mb-5 mt-10 flex items-center gap-2.5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">Mes Candidatures</h2>
          <span className="rounded-full bg-stone-900/6 px-2 py-0.5 font-mono text-xs font-medium text-stone-600">
            {applications.length}
          </span>
        </div>

        {/* Affichage conditionnel de la liste */}
        {applications.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/50 px-6 py-20 text-center">
            <span className="mb-4 grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </span>
            <p className="text-sm text-stone-500">Aucune candidature pour le moment.</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {applications.map((app: any, index: number) => {
              const status = app.status || "APPLIED";
              const scoreTone = app.resumeMatchScore != null ? getScoreTone(app.resumeMatchScore) : null;

              return (
                <li
                  key={app.id}
                  style={{ animationDelay: `${index * CARD_STAGGER_MS}ms` }}
                  className={`${CARD_CLASS} group flex animate-fade-up flex-col p-5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(28,25,23,0.04),0_20px_40px_-20px_rgba(28,25,23,0.2)]`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-teal-50 to-stone-100 font-display text-lg font-medium text-teal-900 ring-1 ring-stone-900/6"
                    >
                      {app.companyName?.charAt(0)?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">{app.companyName}</p>
                      <p className="truncate text-sm text-stone-500">{app.jobTitle}</p>
                    </div>
                    {/* Bouton qui déclenche la suppression au clic */}
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-stone-400 opacity-100 transition-[color,background-color,opacity] hover:bg-rose-50 hover:text-rose-700 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="relative inline-flex">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-semibold ring-1 ring-inset transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 ${
                          STATUS_STYLES[status] ?? STATUS_STYLES.APPLIED
                        }`}
                      >
                        <option value="DRAFT">Brouillon</option>
                        <option value="APPLIED">Postulé</option>
                        <option value="INTERVIEWING">En entretien</option>
                        <option value="OFFER">Offre reçue</option>
                        <option value="REJECTED">Refusé</option>
                      </select>
                      <svg
                        aria-hidden
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 opacity-60"
                      >
                        <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Affichage conditionnel des retours de l'IA */}
                  {scoreTone && (
                    <div className="mt-5 space-y-3 border-t border-dashed border-stone-200 pt-4">
                      <div>
                        <div className="mb-1.5 flex items-baseline justify-between">
                          <span className="text-xs font-medium text-stone-500">Match IA :</span>
                          <span className={`font-mono text-sm font-medium ${scoreTone.text}`}>
                            {app.resumeMatchScore}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full rounded-full ${scoreTone.bar}`}
                            style={{ width: `${Math.min(Math.max(app.resumeMatchScore, 0), 100)}%` }}
                          />
                        </div>
                      </div>

                      {app.missingSkills && app.missingSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="mr-0.5 text-xs text-stone-500">Manque :</span>
                          {app.missingSkills.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 ring-1 ring-inset ring-stone-900/4"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
