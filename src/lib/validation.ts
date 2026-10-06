export const MIN_PASSWORD_LENGTH = 8;

/* Returns a user-facing error message, or null when the password pair is valid. */
export const validateNewPassword = (password: string, confirmation: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  if (password !== confirmation) {
    return "Les mots de passe ne correspondent pas.";
  }
  return null;
};
