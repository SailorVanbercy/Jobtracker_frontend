"use client";

import { useEffect, useState } from "react";
import { fetchCurrentUser, type ProfileResult } from "@/lib/user";

type CurrentUserState = { kind: "loading" } | ProfileResult;

/* Loads the authenticated user's profile. Callers decide how to react to "unauthorized". */
export function useCurrentUser() {
  const [state, setState] = useState<CurrentUserState>({ kind: "loading" });

  useEffect(() => {
    let isCancelled = false;
    fetchCurrentUser().then((result) => {
      if (!isCancelled) setState(result);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  return state;
}
