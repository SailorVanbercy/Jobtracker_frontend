"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "@/components/toast";

/* Sends the user back to the login page with an explanation when their JWT cookie is missing or expired. */
export function useSessionExpired() {
  const router = useRouter();
  const showToast = useToast();

  return useCallback(() => {
    showToast("Votre session a expiré. Merci de vous reconnecter.", "info");
    router.push("/login");
  }, [router, showToast]);
}
