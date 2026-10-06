"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  AlertIcon,
  AuthShell,
  ERROR_ALERT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/ui";

export default function LoginPage() {
  // Déclaration des variables d'état pour les champs et les erreurs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Appel API vers la route login du backend
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Indispensable pour stocker le cookie JWT
      });

      if (res.ok) {
        // Redirection vers le tableau de bord si la connexion reussi
        router.push("/dashboard");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    }
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
              value={email}
              // Met à jour la variable d'état à chaque frappe
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={LABEL_CLASS}>Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              // Met à jour la variable d'état du mot de passe
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </div>
        </div>

        <button type="submit" className={`${PRIMARY_BUTTON_CLASS} w-full`}>
          Se connecter
        </button>

        {/* Lien vers la page d'inscription */}
        <p className="border-t border-stone-200 pt-6 text-center text-sm">
          <Link
            href="/register"
            className="font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-4 transition-colors hover:decoration-teal-800"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
