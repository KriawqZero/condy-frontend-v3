"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGetPrestadorDashboard } from "../actions/prestador";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { ClipboardTickIcon } from "@/components/icons/ClipboardClipIcon";
import { EmptyStateIllustration } from "@/components/icons/EmptyStateIllustration";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { StatisticsIcon } from "@/components/icons/StatisticsIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

import type { User } from "@/types";

function getStatusBadge(status: string | undefined) {
  switch (status) {
    case "NOVA":
      return (
        <Badge className="bg-blue-50 text-blue-600 border-blue-200">
          Nova
        </Badge>
      );
    case "EM_ANDAMENTO":
      return (
        <Badge className="bg-orange-50 text-orange-600 border-orange-200">
          Em andamento
        </Badge>
      );
    case "CONCLUIDO":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200">
          Concluído
        </Badge>
      );
    case "CANCELADO":
      return (
        <Badge className="bg-red-50 text-red-600 border-red-200">
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-50 text-gray-600 border-gray-200">
          N/A
        </Badge>
      );
  }
}

function getPagamentoBadge(status: string | undefined) {
  switch (status) {
    case "PAGO":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200">
          Pago
        </Badge>
      );
    case "PENDENTE":
      return (
        <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
          Pendente
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-50 text-gray-600 border-gray-200">
          N/A
        </Badge>
      );
  }
}

function formatarValor(valor: unknown): string {
  const numero = Number(valor);
  if (!valor || isNaN(numero)) {
    return "0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

export default function PrestadorDashboard({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await apiGetPrestadorDashboard();
      if (res.success) setData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  const resumo = {
    receita: formatarValor(data?.receitaMensal),
    ativos: data?.chamadosAtivos?.toString() || "0",
    analises: formatarValor(data?.analisesCompletadas),
    recebidos: formatarValor(data?.valorRecebido),
  };

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <img src="/loading.gif" alt="Carregando..." className="w-16 h-16" />
        </div>
      ) : (
        <div className="container relative -mt-20 z-10">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Receita mensal
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {resumo.receita}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <NoteIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados ativos
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {resumo.ativos}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <ClipboardTickIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Com análises completadas
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {resumo.analises}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Recebidos
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {resumo.recebidos}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Ordens de serviço ativas
                </h2>
                <p className="font-afacad text-base text-black">
                  Acompanhe as últimas atualizações de seus trabalhos
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
                  onClick={() => router.push("/prestador/ordens")}
                >
                  Criar nova OS
                </Button>
                <Button
                  variant="outline"
                  className="font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl"
                >
                  Exportar planilha
                </Button>
              </div>
            </div>

            {data?.ordens?.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[900px]">
                    <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-7 gap-4 text-sm font-afacad font-bold text-black">
                        <div>OS</div>
                        <div>Data</div>
                        <div>Condomínio</div>
                        <div>Serviço</div>
                        <div>Status</div>
                        <div>Orçamento</div>
                        <div>Pagamento</div>
                      </div>
                    </div>
                    <div className="divide-y divide-[#EFF0FF]">
                      {data.ordens.map((ordem: any) => (
                        <div
                          key={ordem.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[900px]"
                          onClick={() => router.push("/prestador/ordens")}
                        >
                          <div className="grid grid-cols-7 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.chamado?.numeroChamado || ordem.id}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.createdAt
                                ? new Date(ordem.createdAt).toLocaleDateString("pt-BR")
                                : "--"}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.chamado?.imovel?.nome || ordem.chamado?.imovel?.endereco || "N/A"}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.chamado?.escopo === "ORCAMENTO" ? "Orçamento" : "Imediato"}
                            </div>
                            <div>{getStatusBadge(ordem.status)}</div>
                            <div
                              className={`font-afacad font-bold text-sm ${
                                Number(ordem.valorEstimado || ordem.valorOrcamento || 0) > 0
                                  ? "text-black"
                                  : "text-black/50"
                              }`}
                            >
                              {formatarValor(ordem.valorEstimado || ordem.valorOrcamento)}
                            </div>
                            <div>{getPagamentoBadge(ordem.pagamentoStatus)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <EmptyStateIllustration />
                <div className="text-center mt-6 max-w-md">
                  <h3 className="font-afacad text-3xl font-bold text-black mb-3">
                    Olá, {user.name || "Prestador"}!
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    Nenhuma ordem de serviço ativa no momento.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Proposals Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Propostas de serviços Condy
                </h2>
                <p className="font-afacad text-base text-black">
                  Veja novas oportunidades de trabalho com agilidade.
                </p>
              </div>
              <Button
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
                onClick={() => router.push("/prestador/propostas")}
              >
                Ver todas
              </Button>
            </div>

            {data?.propostas?.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[900px]">
                    <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-6 gap-4 text-sm font-afacad font-bold text-black">
                        <div>Proposta</div>
                        <div>Cliente</div>
                        <div>Serviço</div>
                        <div>Data</div>
                        <div>Valor</div>
                        <div>Ações</div>
                      </div>
                    </div>
                    <div className="divide-y divide-[#EFF0FF]">
                      {data.propostas.map((p: any) => (
                        <div
                          key={p.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[900px]"
                          onClick={() => router.push("/prestador/propostas")}
                        >
                          <div className="grid grid-cols-6 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.id}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.chamado?.imovel?.nome || p.chamado?.imovel?.endereco || "N/A"}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.chamado?.escopo === "ORCAMENTO" ? "Orçamento" : "Imediato"}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString("pt-BR")
                                : "--"}
                            </div>
                            <div
                              className={`font-afacad font-bold text-sm ${
                                Number(p.valor || 0) > 0 ? "text-black" : "text-black/50"
                              }`}
                            >
                              {formatarValor(p.valor)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-blue-600 font-medium">
                                VER
                              </span>
                              <div className="w-6 h-6 rounded-full bg-[#F5F7FF] flex items-center justify-center ml-2">
                                <ChevronRightIcon />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <EmptyStateIllustration />
                <div className="text-center mt-6 max-w-md">
                  <h3 className="font-afacad text-3xl font-bold text-black mb-3">
                    Nenhuma proposta disponível
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    Aguarde novas propostas de serviço para analisar e aceitar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 bg-[#10A07B] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
          <WhatsappIcon />
        </button>
      </div>
    </div>
  );
}

