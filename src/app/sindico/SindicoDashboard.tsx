import Button from "@/components/ui/Button";
import { User } from "@/types";
import Link from "next/link";

interface SindicoDashboardProps {
  user: User;
}

export default function SindicoDashboard({ user }: SindicoDashboardProps) {
  const chamadosAbertos = mockChamados.filter((c) => c.status !== "CONCLUIDO");
  const temChamados = chamadosAbertos.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ABERTO":
        return "bg-yellow-100 text-yellow-800";
      case "EM_ANDAMENTO":
        return "bg-blue-100 text-blue-800";
      case "CONCLUIDO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ABERTO":
        return "Aberto";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CONCLUIDO":
        return "Concluído";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Olá, {user.name}! 👋
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao painel do síndico. Aqui você pode acompanhar e gerenciar
          todos os seus chamados.
        </p>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/sindico/chamados/novo">
          <div className="bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 rounded-lg p-6 cursor-pointer">
            <div className="flex items-center">
              <span className="text-2xl mr-3">➕</span>
              <div>
                <h3 className="font-semibold text-blue-900">Novo Chamado</h3>
                <p className="text-sm text-blue-700">Abrir novo chamado</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/sindico/chamados">
          <div className="bg-green-50 hover:bg-green-100 transition-colors border border-green-200 rounded-lg p-6 cursor-pointer">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📞</span>
              <div>
                <h3 className="font-semibold text-green-900">Meus Chamados</h3>
                <p className="text-sm text-green-700">Ver todos os chamados</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/sindico/imoveis">
          <div className="bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200 rounded-lg p-6 cursor-pointer">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏢</span>
              <div>
                <h3 className="font-semibold text-purple-900">Imóveis</h3>
                <p className="text-sm text-purple-700">Gerenciar imóveis</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Lista de chamados */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Chamados Abertos
          </h2>
        </div>

        <div className="p-6">
          {temChamados ? (
            <div className="space-y-4">
              {chamadosAbertos.map((chamado) => (
                <div
                  key={chamado.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-medium text-gray-600">
                          {chamado.numero_chamado}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            chamado.status
                          )}`}
                        >
                          {getStatusText(chamado.status)}
                        </span>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-1">
                        {chamado.descricao}
                      </h3>

                      <div className="text-sm text-gray-600 space-y-1">
                        {chamado.valor && (
                          <p>
                            <span className="font-medium">Valor:</span> R${" "}
                            {chamado.valor.toFixed(2)}
                          </p>
                        )}
                        {chamado.prestador && (
                          <p>
                            <span className="font-medium">Prestador:</span>{" "}
                            {chamado.prestador}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Criado em:</span>{" "}
                          {new Date(chamado.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>

                    <Link href={`/sindico/chamados/${chamado.id}`}>
                      <Button variant="secondary" size="sm">
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📞</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum chamado aberto
              </h3>
              <p className="text-gray-500 mb-4">
                Você não possui chamados abertos no momento.
              </p>
              <Link href="/sindico/chamados/novo">
                <Button>Abrir novo chamado</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
