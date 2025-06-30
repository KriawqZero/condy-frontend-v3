import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Verificar se já está logado
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login"); // Redirecionar para dashboard padrão
  }

  redirect("/sindico"); // Redirecionar para dashboard do síndico
}
