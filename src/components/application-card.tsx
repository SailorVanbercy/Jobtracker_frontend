"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import {
  clampScore,
  formatDate,
  getScoreTone,
  getStatus,
  STATUS_OPTIONS,
  type ApplicationStatus,
  type JobApplication,
  type ScoreTone,
} from "@/lib/applications";
import { CARD_CLASS, INPUT_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS, Spinner } from "./ui";

export interface ApplicationEdit {
  companyName: string;
  jobTitle: string;
}

interface ApplicationCardProps {
  app: JobApplication;
  style?: CSSProperties;
  isStatusPending: boolean;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onRequestDelete: (app: JobApplication) => void;
  onSave: (id: string, edit: ApplicationEdit) => Promise<boolean>;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  DRAFT: "bg-stone-100 text-stone-700 ring-stone-200",
  APPLIED: "bg-sky-50 text-sky-800 ring-sky-200",
  INTERVIEWING: "bg-amber-50 text-amber-800 ring-amber-200",
  OFFER: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

const SCORE_STYLES: Record<ScoreTone, { text: string; bar: string }> = {
  strong: { text: "text-emerald-700", bar: "bg-emerald-500" },
  medium: { text: "text-amber-700", bar: "bg-amber-500" },
  weak: { text: "text-rose-700", bar: "bg-rose-500" },
};

const ICON_BUTTON_CLASS =
  "grid size-8 place-items-center rounded-lg text-stone-500 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20 disabled:opacity-50";

function EditForm({
  app,
  onCancel,
  onSave,
}: {
  app: JobApplication;
  onCancel: () => void;
  onSave: (edit: ApplicationEdit) => Promise<boolean>;
}) {
  const [companyName, setCompanyName] = useState(app.companyName);
  const [jobTitle, setJobTitle] = useState(app.jobTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const saved = await onSave({ companyName: companyName.trim(), jobTitle: jobTitle.trim() });
    // On success the card leaves edit mode and this form unmounts.
    if (!saved) setIsSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isSaving) onCancel();
      }}
      className="space-y-3"
    >
      <div>
        <label htmlFor={`company-${app.id}`} className="sr-only">Entreprise</label>
        <input
          id={`company-${app.id}`}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Entreprise"
          className={INPUT_CLASS}
          required
          autoFocus
          disabled={isSaving}
        />
      </div>
      <div>
        <label htmlFor={`title-${app.id}`} className="sr-only">Poste</label>
        <input
          id={`title-${app.id}`}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Poste"
          className={INPUT_CLASS}
          required
          disabled={isSaving}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={isSaving} className={`${SECONDARY_BUTTON_CLASS} py-2`}>
          Annuler
        </button>
        <button type="submit" disabled={isSaving} className={`${PRIMARY_BUTTON_CLASS} py-2`}>
          {isSaving && <Spinner />}
          Enregistrer
        </button>
      </div>
    </form>
  );
}

export function ApplicationCard({
  app,
  style,
  isStatusPending,
  onStatusChange,
  onRequestDelete,
  onSave,
}: ApplicationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const status = getStatus(app);
  const createdAtLabel = formatDate(app.createdAt);
  const description = app.jobDescription?.trim();
  const score = app.resumeMatchScore;
  const scoreStyle = score != null ? SCORE_STYLES[getScoreTone(score)] : null;

  const handleSave = async (edit: ApplicationEdit) => {
    const saved = await onSave(app.id, edit);
    if (saved) setIsEditing(false);
    return saved;
  };

  return (
    <li
      style={style}
      className={`${CARD_CLASS} flex animate-fade-up flex-col p-5 transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(28,25,23,0.04),0_20px_40px_-20px_rgba(28,25,23,0.2)]`}
    >
      {isEditing ? (
        <EditForm app={app} onCancel={() => setIsEditing(false)} onSave={handleSave} />
      ) : (
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-teal-50 to-stone-100 font-display text-lg font-medium text-teal-900 ring-1 ring-stone-900/6"
          >
            {app.companyName?.charAt(0)?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink" title={app.companyName}>
              {app.companyName}
            </p>
            <p className="truncate text-sm text-stone-500" title={app.jobTitle}>
              {app.jobTitle}
            </p>
          </div>
          <div className="-mr-1.5 -mt-1 flex shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`Modifier la candidature ${app.companyName}`}
              title="Modifier"
              className={`${ICON_BUTTON_CLASS} hover:bg-stone-100 hover:text-ink`}
            >
              <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
              </svg>
            </button>
            {/* Bouton qui ouvre la confirmation de suppression */}
            <button
              type="button"
              onClick={() => onRequestDelete(app)}
              aria-label={`Supprimer la candidature ${app.companyName}`}
              title="Supprimer"
              className={`${ICON_BUTTON_CLASS} hover:bg-rose-50 hover:text-rose-700`}
            >
              <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <div className="relative inline-flex">
          <select
            value={status}
            onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
            aria-label={`Statut de la candidature ${app.companyName}`}
            disabled={isStatusPending}
            className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-semibold ring-1 ring-inset transition-[box-shadow,opacity] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 disabled:cursor-wait disabled:opacity-60 ${STATUS_STYLES[status]}`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
        {isStatusPending && (
          <span className="text-stone-400">
            <Spinner />
            <span className="sr-only">Mise à jour du statut…</span>
          </span>
        )}
        {createdAtLabel && app.createdAt && (
          <time dateTime={app.createdAt} className="ml-auto text-xs text-stone-500">
            Ajoutée le {createdAtLabel}
          </time>
        )}
      </div>

      {/* Affichage conditionnel des retours de l'IA */}
      {score != null && scoreStyle && (
        <div className="mt-5 space-y-3 border-t border-dashed border-stone-200 pt-4">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span id={`score-${app.id}`} className="text-xs font-medium text-stone-500">
                Match IA :
              </span>
              <span className={`font-mono text-sm font-medium ${scoreStyle.text}`}>{score}%</span>
            </div>
            <div
              role="progressbar"
              aria-labelledby={`score-${app.id}`}
              aria-valuenow={clampScore(score)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-stone-100"
            >
              <div className={`h-full rounded-full ${scoreStyle.bar}`} style={{ width: `${clampScore(score)}%` }} />
            </div>
          </div>

          {app.missingSkills && app.missingSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-xs text-stone-500">Manque :</span>
              {app.missingSkills.map((skill, index) => (
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

      {/* Annonce d'origine, repliée par défaut */}
      {description && (
        <div className="mt-4 border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => setIsDescriptionOpen((open) => !open)}
            aria-expanded={isDescriptionOpen}
            aria-controls={`description-${app.id}`}
            className="inline-flex items-center gap-1 rounded-md text-xs font-semibold text-teal-800 transition-colors hover:text-teal-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20"
          >
            {isDescriptionOpen ? "Masquer l'annonce" : "Voir l'annonce"}
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`size-3.5 transition-transform duration-200 ${isDescriptionOpen ? "rotate-180" : ""}`}
            >
              <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
          <div
            id={`description-${app.id}`}
            hidden={!isDescriptionOpen}
            className="mt-3 max-h-64 overflow-y-auto whitespace-pre-line rounded-lg bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-700 ring-1 ring-inset ring-stone-900/4"
          >
            {description}
          </div>
        </div>
      )}
    </li>
  );
}
