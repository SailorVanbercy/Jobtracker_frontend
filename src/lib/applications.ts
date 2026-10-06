export type ApplicationStatus = "DRAFT" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus | null;
  resumeMatchScore: number | null;
  missingSkills: string[] | null;
  createdAt: string | null;
  jobDescription: string | null;
}

export const DEFAULT_STATUS: ApplicationStatus = "APPLIED";

export const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "APPLIED", label: "Postulé" },
  { value: "INTERVIEWING", label: "En entretien" },
  { value: "OFFER", label: "Offre reçue" },
  { value: "REJECTED", label: "Refusé" },
];

export type StatusFilter = ApplicationStatus | "ALL";

export type SortKey = "recent" | "oldest" | "company" | "score";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Plus récentes" },
  { value: "oldest", label: "Plus anciennes" },
  { value: "company", label: "Entreprise (A–Z)" },
  { value: "score", label: "Meilleur match" },
];

const STRONG_MATCH_THRESHOLD = 75;
const MEDIUM_MATCH_THRESHOLD = 50;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

export type ScoreTone = "strong" | "medium" | "weak";

export const getStatus = (app: Pick<JobApplication, "status">): ApplicationStatus =>
  app.status ?? DEFAULT_STATUS;

export const getScoreTone = (score: number): ScoreTone => {
  if (score > STRONG_MATCH_THRESHOLD) return "strong";
  if (score > MEDIUM_MATCH_THRESHOLD) return "medium";
  return "weak";
};

export const clampScore = (score: number) => Math.min(Math.max(score, MIN_SCORE), MAX_SCORE);

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const countByStatus = (apps: JobApplication[]): Record<StatusFilter, number> => {
  const counts: Record<StatusFilter, number> = {
    ALL: apps.length,
    DRAFT: 0,
    APPLIED: 0,
    INTERVIEWING: 0,
    OFFER: 0,
    REJECTED: 0,
  };
  for (const app of apps) counts[getStatus(app)] += 1;
  return counts;
};

export const filterApplications = (
  apps: JobApplication[],
  { query, status }: { query: string; status: StatusFilter },
) => {
  const needle = normalize(query);
  return apps.filter((app) => {
    if (status !== "ALL" && getStatus(app) !== status) return false;
    if (!needle) return true;
    return normalize(`${app.companyName} ${app.jobTitle}`).includes(needle);
  });
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/* Formats an ISO timestamp as "6 oct. 2026"; returns null for missing or invalid dates. */
export const formatDate = (iso: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
};

const toTimestamp = (iso: string | null) => {
  const time = iso ? new Date(iso).getTime() : Number.NaN;
  return Number.isNaN(time) ? null : time;
};

/* Sorts by creation date; applications created before dates were tracked always go last. */
const compareByDate = (a: JobApplication, b: JobApplication, direction: 1 | -1) => {
  const timeA = toTimestamp(a.createdAt);
  const timeB = toTimestamp(b.createdAt);
  if (timeA === null && timeB === null) return 0;
  if (timeA === null) return 1;
  if (timeB === null) return -1;
  return (timeA - timeB) * direction;
};

export const sortApplications = (apps: JobApplication[], sortKey: SortKey) => {
  switch (sortKey) {
    case "recent":
      return [...apps].sort((a, b) => compareByDate(a, b, -1));
    case "oldest":
      return [...apps].sort((a, b) => compareByDate(a, b, 1));
    case "company":
      return [...apps].sort((a, b) =>
        a.companyName.localeCompare(b.companyName, "fr", { sensitivity: "base" }),
      );
    case "score":
      // Applications without a score go last.
      return [...apps].sort((a, b) => (b.resumeMatchScore ?? -1) - (a.resumeMatchScore ?? -1));
  }
};
