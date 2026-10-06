"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/password-input";
import { useToast } from "@/components/toast";
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
import { MIN_PASSWORD_LENGTH, validateNewPassword } from "@/lib/validation";

export default function RegisterPage() {
  // Déclaration des états
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const showToast = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation côté client avant d'appeler l'API
    const validationError = validateNewPassword(passwordHash, passwordConfirmation);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Appel API vers la route de création d'utilisateur
      const res = await apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Le DTO backend attend "passwordHash" comme clé
        body: JSON.stringify({ email: email.trim(), passwordHash }),
      });

      if (res.ok) {
        // Redirection vers le login si le compte est créé
        showToast("Compte créé avec succès. Vous pouvez maintenant vous connecter.", "success");
        router.push("/login");
        return;
      }
      if (res.status === 409) {
        // Gestion de l'erreur d'email en doublon (géré par ton backend)
        setError("Cet email est déjà utilisé.");
      } else {
        setError("Erreur lors de la création du compte.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    }
    setIsLoading(false);
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
              autoComplete="email"
              autoFocus
              value={email}
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
              autoComplete="new-password"
              aria-describedby="password-hint"
              minLength={MIN_PASSWORD_LENGTH}
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              required
              disabled={isLoading}
            />
            <p id="password-hint" className="mt-1.5 text-xs text-stone-500">
              {MIN_PASSWORD_LENGTH} caractères minimum.
            </p>
          </div>

          <div>
            <label htmlFor="password-confirmation" className={LABEL_CLASS}>Confirmer le mot de passe</label>
            <PasswordInput
              id="password-confirmation"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
          {isLoading && <Spinner />}
          {isLoading ? "Création du compte..." : "S'inscrire"}
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
