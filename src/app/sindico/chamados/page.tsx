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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Meus Chamados
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie e acompanhe o status de todos os seus chamados de
              manutenção
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <a
              href="/sindico/chamados/novo"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <img src="/svg/plus_icon.svg" alt="" className="w-5 h-5 mr-2" />
              Novo Chamado
            </a>
          </div>
        </div>

        {/* Lista de chamados */}
        <ChamadosListSindico />
      </div>
    </CondyLayout>
  );
}
