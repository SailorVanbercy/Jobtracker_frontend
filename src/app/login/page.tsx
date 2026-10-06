"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PasswordInput } from "@/components/password-input";
import {
  AlertIcon,
  AuthShell,
  ERROR_ALERT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  Spinner,
} from "@/components/ui";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  // Déclaration des variables d'état pour les champs et les erreurs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Appel API vers la route login du backend (le cookie JWT est stocké via credentials: "include")
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        // Redirection vers le tableau de bord si la connexion reussi
        router.push("/dashboard");
        return; // On garde le bouton en chargement pendant la navigation
      }
      setError("Email ou mot de passe incorrect.");
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    }
    setIsLoading(false);
  };

  return (
    <AuthShell>
      <form onSubmit={handleLogin} className="space-y-6">
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink">Job Tracker</h1>

        {/* Affichage du message d'erreur si besoin */}
        {error && (
          <div role="alert" className={ERROR_ALERT_CLASS}>
            <AlertIcon />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className={LABEL_CLASS}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              // Met à jour la variable d'état à chaque frappe
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className={LABEL_CLASS}>Mot de passe</label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              // Met à jour la variable d'état du mot de passe
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
          {isLoading && <Spinner />}
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>

        {/* Lien vers la page d'inscription */}
        <p className="border-t border-stone-200 pt-6 text-center text-sm">
          <Link
            href="/register"
            className="font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-4 transition-colors hover:decoration-teal-800"
          >
            Pas encore de compte ? S&apos;inscrire
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
