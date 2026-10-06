import { describe, expect, it } from "vitest";
import {
  clampScore,
  countByStatus,
  formatDate,
  filterApplications,
  getScoreTone,
  getStatus,
  sortApplications,
  type JobApplication,
} from "./applications";

const makeApp = (overrides: Partial<JobApplication>): JobApplication => ({
  id: crypto.randomUUID(),
  companyName: "Acme",
  jobTitle: "Developer",
  status: "APPLIED",
  resumeMatchScore: null,
  missingSkills: null,
  createdAt: null,
  jobDescription: null,
  ...overrides,
});

describe("getStatus", () => {
  it("falls back to APPLIED when status is null", () => {
    expect(getStatus({ status: null })).toBe("APPLIED");
  });

  it("returns the existing status", () => {
    expect(getStatus({ status: "OFFER" })).toBe("OFFER");
  });
});

describe("getScoreTone", () => {
  it.each([
    [100, "strong"],
    [76, "strong"],
    [75, "medium"],
    [51, "medium"],
    [50, "weak"],
    [0, "weak"],
  ] as const)("maps %i to %s", (score, tone) => {
    expect(getScoreTone(score)).toBe(tone);
  });
});

describe("clampScore", () => {
  it("keeps scores within 0-100", () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(42)).toBe(42);
    expect(clampScore(150)).toBe(100);
  });
});

describe("countByStatus", () => {
  it("counts every status and the total, treating null as APPLIED", () => {
    const counts = countByStatus([
      makeApp({ status: "OFFER" }),
      makeApp({ status: null }),
      makeApp({ status: "APPLIED" }),
    ]);
    expect(counts).toEqual({
      ALL: 3,
      DRAFT: 0,
      APPLIED: 2,
      INTERVIEWING: 0,
      OFFER: 1,
      REJECTED: 0,
    });
  });
});

describe("filterApplications", () => {
  const apps = [
    makeApp({ companyName: "Société Générale", jobTitle: "Data Engineer", status: "INTERVIEWING" }),
    makeApp({ companyName: "Doctolib", jobTitle: "Frontend Developer", status: "APPLIED" }),
    makeApp({ companyName: "Qonto", jobTitle: "Backend Developer", status: "REJECTED" }),
  ];

  it("returns everything with an empty query and ALL status", () => {
    expect(filterApplications(apps, { query: "", status: "ALL" })).toHaveLength(3);
  });

  it("matches company or title, ignoring case and accents", () => {
    expect(filterApplications(apps, { query: "societe", status: "ALL" })).toHaveLength(1);
    expect(filterApplications(apps, { query: "DEVELOPER", status: "ALL" })).toHaveLength(2);
  });

  it("combines query and status filters", () => {
    const result = filterApplications(apps, { query: "developer", status: "REJECTED" });
    expect(result.map((app) => app.companyName)).toEqual(["Qonto"]);
  });
});

describe("formatDate", () => {
  it("formats an ISO date in French", () => {
    expect(formatDate("2026-10-06T14:30:00Z")).toBe("6 oct. 2026");
  });

  it("returns null for missing or invalid dates", () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate("not-a-date")).toBeNull();
  });
});

describe("sortApplications", () => {
  const apps = [
    makeApp({ companyName: "beta", resumeMatchScore: 40, createdAt: "2026-03-01T10:00:00Z" }),
    makeApp({ companyName: "Alpha", resumeMatchScore: null, createdAt: null }),
    makeApp({ companyName: "Gamma", resumeMatchScore: 90, createdAt: "2026-05-01T10:00:00Z" }),
  ];
  const names = (sorted: JobApplication[]) => sorted.map((app) => app.companyName);

  it("sorts most recent first and puts undated applications last", () => {
    expect(names(sortApplications(apps, "recent"))).toEqual(["Gamma", "beta", "Alpha"]);
  });

  it("sorts oldest first and still puts undated applications last", () => {
    expect(names(sortApplications(apps, "oldest"))).toEqual(["beta", "Gamma", "Alpha"]);
  });

  it("sorts by company name, case-insensitively", () => {
    expect(names(sortApplications(apps, "company"))).toEqual(["Alpha", "beta", "Gamma"]);
  });

  it("sorts by best score and puts missing scores last", () => {
    expect(names(sortApplications(apps, "score"))).toEqual(["Gamma", "beta", "Alpha"]);
  });

  it("does not mutate the input array", () => {
    const snapshot = [...apps];
    sortApplications(apps, "company");
    expect(apps).toEqual(snapshot);
  });
});
