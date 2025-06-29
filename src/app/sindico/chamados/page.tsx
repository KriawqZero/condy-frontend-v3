import CondyLayout from "@/components/layout/CondyLayout";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ChamadosListSindico from "./ChamadosListSindico";

export default async function ChamadosSindicoPage() {
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
      title="Meus Chamados"
      maxWidth="full"
      background="gray"
    >
      <div className="space-y-6">
        {/* Header simples */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src="/horizontal_logo.svg" alt="Condy" className="h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Olá, {session.user.name}
          </h1>
          <p className="text-sm text-gray-600">Condomínio Millionen Ipane</p>
        </div>

        {/* Lista de chamados */}
        <ChamadosListSindico />
      </div>
    </CondyLayout>
  );
}
