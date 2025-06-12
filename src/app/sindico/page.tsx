import CondyLayout from "@/components/layout/CondyLayout";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SindicoDashboard from "./SindicoDashboard";

export default async function SindicoPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.user) {
    redirect("/login");
  }

  // Verificar se é síndico
  if (
    !["SINDICO_RESIDENTE", "SINDICO_PROFISSIONAL"].includes(
      session.user.userType
    )
  ) {
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
