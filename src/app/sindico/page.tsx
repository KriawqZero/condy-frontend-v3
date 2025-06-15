import CondyLayout from "@/components/layout/CondyLayout";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SindicoDashboard from "./SindicoDashboard";

export default async function SindicoPage() {
  const session = await getSession();

  if (
    !session.isLoggedIn ||
    session.user === undefined ||
    session.user === null
  ) {
    console.error("Usuário não está logado ou dados do usuário inválidos");
    redirect("/login");
  }

  // Verificar se é síndico
  if (
    !["SINDICO_RESIDENTE", "SINDICO_PROFISSIONAL"].includes(
      session.user.userType
    )
  ) {
    console.error("Usuário não é síndico");
    redirect("/login");
  }

  return (
    <CondyLayout
      user={session.user}
      title="Dashboard"
      maxWidth="full"
      background="gray"
    >
      <SindicoDashboard user={session.user} />
    </CondyLayout>
  );
}
