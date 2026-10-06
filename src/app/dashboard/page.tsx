"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApplicationCard, type ApplicationEdit } from "@/components/application-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import {
  AlertIcon,
  CARD_CLASS,
  ERROR_ALERT_CLASS,
  INPUT_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from "@/components/ui";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSessionExpired } from "@/hooks/use-session-expired";
import { apiFetch, isUnauthorized } from "@/lib/api";
import {
  countByStatus,
  filterApplications,
  getStatus,
  SORT_OPTIONS,
  sortApplications,
  STATUS_OPTIONS,
  type ApplicationStatus,
  type JobApplication,
  type SortKey,
  type StatusFilter,
} from "@/lib/applications";

const CARD_STAGGER_MS = 60;
const SKELETON_CARD_COUNT = 4;
const NETWORK_ERROR = "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.";

type LoadState = "loading" | "error" | "ready";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  ...STATUS_OPTIONS,
];

type LoadResult =
  | { kind: "ok"; data: JobApplication[] }
  | { kind: "unauthorized" }
  | { kind: "error" };

// Appel API pour récupérer les candidatures (cookie JWT envoyé automatiquement)
async function loadApplications(): Promise<LoadResult> {
  try {
    const res = await apiFetch("/api/applications");
    if (res.ok) return { kind: "ok", data: await res.json() };
    if (isUnauthorized(res)) return { kind: "unauthorized" };
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

function SkeletonCard() {
  return (
    <li aria-hidden className={`${CARD_CLASS} p-5`}>
      <div className="flex animate-pulse items-start gap-3.5">
        <span className="size-11 rounded-xl bg-stone-100" />
        <div className="flex-1 space-y-2.5 pt-1">
          <span className="block h-3 w-2/5 rounded-full bg-stone-200" />
          <span className="block h-2.5 w-3/5 rounded-full bg-stone-100" />
        </div>
      </div>
      <span className="mt-5 block h-6 w-24 animate-pulse rounded-full bg-stone-100" />
    </li>
  );
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [pendingStatusIds, setPendingStatusIds] = useState<Set<string>>(() => new Set());
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const showToast = useToast();
  const onSessionExpired = useSessionExpired();
  // Seul le cas "profil chargé sans CV" est utilisé ici ; la session est gérée par le chargement des candidatures
  const currentUser = useCurrentUser();
  const isResumeMissing = currentUser.kind === "ok" && !currentUser.profile.hasResume;

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ignore la réponse si le composant est démonté ou si un nouveau chargement a démarré
    let isCancelled = false;

    loadApplications().then((result) => {
      if (isCancelled) return;
      if (result.kind === "ok") {
        setApplications(result.data);
        setLoadState("ready");
      } else if (result.kind === "unauthorized") {
        // Si pas de cookie ou cookie expiré -> retour au login
        onSessionExpired();
      } else {
        setLoadState("error");
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [reloadKey, onSessionExpired]);

  const handleRetry = () => {
    setLoadState("loading");
    setReloadKey((key) => key + 1);
  };

  const setStatusPending = (id: string, isPending: boolean) => {
    setPendingStatusIds((current) => {
      const next = new Set(current);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Mise à jour optimiste du statut, avec retour arrière en cas d'échec
  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const previous = applications.find((app) => app.id === id);
    if (!previous) return;

    const applyStatus = (status: JobApplication["status"]) =>
      setApplications((current) => current.map((app) => (app.id === id ? { ...app, status } : app)));

    applyStatus(newStatus);
    setStatusPending(id, true);

    try {
      const res = await apiFetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        applyStatus(previous.status);
        if (isUnauthorized(res)) onSessionExpired();
        else showToast("Le statut n'a pas pu être mis à jour.", "error");
      }
    } catch {
      applyStatus(previous.status);
      showToast(NETWORK_ERROR, "error");
    } finally {
      setStatusPending(id, false);
    }
  };

  // Appel API en PUT pour modifier l'entreprise et le poste
  const handleSave = async (id: string, edit: ApplicationEdit) => {
    const current = applications.find((app) => app.id === id);
    if (!current) return false;

    try {
      const res = await apiFetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...edit, status: getStatus(current) }),
      });

      if (res.ok) {
        const updated: JobApplication = await res.json();
        setApplications((apps) => apps.map((app) => (app.id === id ? { ...app, ...updated } : app)));
        showToast("Candidature mise à jour.", "success");
        return true;
      }
      if (isUnauthorized(res)) onSessionExpired();
      else showToast("La candidature n'a pas pu être modifiée.", "error");
    } catch {
      showToast(NETWORK_ERROR, "error");
    }
    return false;
  };

  // Appel API en DELETE, déclenché depuis la fenêtre de confirmation
  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);

    try {
      const res = await apiFetch(`/api/applications/${appToDelete.id}`, { method: "DELETE" });

      if (res.ok) {
        // Retire l'élément supprimé sans recharger la page
        setApplications((apps) => apps.filter((app) => app.id !== appToDelete.id));
        showToast(`Candidature ${appToDelete.companyName} supprimée.`, "success");
        setAppToDelete(null);
      } else if (isUnauthorized(res)) {
        onSessionExpired();
      } else {
        showToast("La suppression a échoué.", "error");
      }
    } catch {
      showToast(NETWORK_ERROR, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const counts = useMemo(() => countByStatus(applications), [applications]);
  const visibleApplications = useMemo(
    () => sortApplications(filterApplications(applications, { query, status: statusFilter }), sortKey),
    [applications, query, statusFilter, sortKey],
  );
  const hasActiveFilters = query.trim() !== "" || statusFilter !== "ALL";

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("ALL");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <h1 className="animate-fade-up font-display text-4xl font-medium tracking-tight text-ink sm:text-[2.75rem]">
        Mon Tableau de Bord
      </h1>

      {/* Sans CV, l'IA ne peut pas calculer de score : on invite l'utilisateur à en ajouter un */}
      {isResumeMissing && (
        <div className="mt-8 flex animate-fade-up flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm text-teal-900">
            <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-teal-700">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
            </svg>
            Ajoutez votre CV pour obtenir un score de compatibilité sur chaque candidature.
          </p>
          <Link
            href="/dashboard/profile"
            className="shrink-0 self-start rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-teal-900 ring-1 ring-teal-200 transition-colors hover:bg-teal-50 sm:self-auto"
          >
            Ajouter mon CV
          </Link>
        </div>
      )}

      {loadState === "error" ? (
        <div role="alert" className={`${ERROR_ALERT_CLASS} mt-8 items-center justify-between`}>
          <span className="flex items-start gap-2.5">
            <AlertIcon />
            Erreur lors de la récupération des données.
          </span>
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 rounded-md px-2.5 py-1 text-sm font-semibold text-rose-800 underline-offset-4 hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Filtres par statut, avec compteur */}
          <div className="mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div role="group" aria-label="Filtrer par statut" className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">
              {FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(filter.value)}
                    disabled={loadState === "loading"}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20 disabled:opacity-50 ${
                      isActive
                        ? "bg-ink text-white"
                        : "bg-white text-stone-600 ring-1 ring-inset ring-stone-900/8 hover:bg-stone-50 hover:text-ink"
                    }`}
                  >
                    {filter.label}
                    <span className={`font-mono text-xs ${isActive ? "text-white/70" : "text-stone-400"}`}>
                      {loadState === "loading" ? "–" : counts[filter.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recherche et tri */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400"
              >
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              <label htmlFor="search" className="sr-only">Rechercher une candidature</label>
              <input
                id="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une entreprise ou un poste…"
                className={`${INPUT_CLASS} pl-10`}
                disabled={loadState === "loading"}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="whitespace-nowrap text-sm text-stone-500">Trier par</label>
              <select
                id="sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className={`${INPUT_CLASS} w-auto cursor-pointer pr-9`}
                disabled={loadState === "loading"}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 mt-8 flex items-center gap-2.5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">Mes Candidatures</h2>
            {loadState === "ready" && (
              <span className="rounded-full bg-stone-900/6 px-2 py-0.5 font-mono text-xs font-medium text-stone-600">
                {hasActiveFilters ? `${visibleApplications.length}/${applications.length}` : applications.length}
              </span>
            )}
          </div>

          {/* Affichage conditionnel : chargement, vide, aucun résultat, liste */}
          {loadState === "loading" ? (
            <ul aria-busy="true" aria-label="Chargement des candidatures" className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </ul>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/50 px-6 py-16 text-center">
              <span className="mb-4 grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </span>
              <p className="text-sm text-stone-500">Aucune candidature pour le moment.</p>
              <Link href="/dashboard/new" className={`${PRIMARY_BUTTON_CLASS} mt-6`}>
                Ajouter ma première candidature
              </Link>
            </div>
          ) : visibleApplications.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/50 px-6 py-14 text-center">
              <p className="text-sm text-stone-500">Aucune candidature ne correspond à votre recherche.</p>
              <button type="button" onClick={resetFilters} className={`${SECONDARY_BUTTON_CLASS} mt-5`}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {visibleApplications.map((app, index) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  style={{ animationDelay: `${index * CARD_STAGGER_MS}ms` }}
                  isStatusPending={pendingStatusIds.has(app.id)}
                  onStatusChange={handleStatusChange}
                  onRequestDelete={setAppToDelete}
                  onSave={handleSave}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={appToDelete !== null}
        title="Supprimer cette candidature ?"
        description={
          <>
            La candidature <strong className="font-semibold text-ink">{appToDelete?.companyName}</strong>
            {appToDelete?.jobTitle ? ` (${appToDelete.jobTitle})` : ""} sera définitivement supprimée.
          </>
        }
        confirmLabel="Supprimer"
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppToDelete(null)}
      />
    </main>
  );
}
