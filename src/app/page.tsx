import { redirect } from "next/navigation";

export default function Home() {
  // Redirige automatiquement l'utilisateur vers la page de login à la racine
  redirect("/login");
}
