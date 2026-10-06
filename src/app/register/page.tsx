"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertIcon,
  AuthShell,
  ERROR_ALERT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/ui";

export default function RegisterPage() {
  // Déclaration des états
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Appel API vers la route de création d'utilisateur
      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Le DTO backend attend "passwordHash" comme clé
        body: JSON.stringify({ email, passwordHash }),
      });

      if (res.ok) {
        // Redirection vers le login si le compte est créé
        router.push("/login");
      } else if (res.status === 409) {
        // Gestion de l'erreur d'email en doublon (géré par ton backend)
        setError("Cet email est déjà utilisé.");
      } else {
        setError("Erreur lors de la création du compte.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleRegister} className="space-y-6">
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink">Créer un compte</h1>

        {/* Affichage des erreurs */}
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
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </div>
        </div>

        <button type="submit" className={`${PRIMARY_BUTTON_CLASS} w-full`}>
          S'inscrire
        </button>

        {/* Lien de retour vers la connexion */}
        <p className="border-t border-stone-200 pt-6 text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-4 transition-colors hover:decoration-teal-800"
          >
            Déjà un compte ? Se connecter
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
