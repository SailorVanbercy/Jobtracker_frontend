import { apiFetch, isUnauthorized } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  hasResume: boolean;
}

export type ProfileResult =
  | { kind: "ok"; profile: UserProfile }
  | { kind: "unauthorized" }
  | { kind: "error" };

export async function fetchCurrentUser(): Promise<ProfileResult> {
  try {
    const res = await apiFetch("/api/users/me");
    if (res.ok) return { kind: "ok", profile: await res.json() };
    if (isUnauthorized(res)) return { kind: "unauthorized" };
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}
