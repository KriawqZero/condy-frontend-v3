"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGetPrestadorDashboard } from "@/app/actions/prestador";
import { apiPrestadorListOrdens } from "@/app/actions/ordens";
import { apiPrestadorListPropostas } from "@/app/actions/propostas";

import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { EmptyStateIllustration } from "@/components/icons/EmptyStateIllustration";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { StatisticsIcon } from "@/components/icons/StatisticsIcon";
import { ClipboardTickIcon } from "@/components/icons/ClipboardClipIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { User } from "@/types";

interface DashboardStats {
  receitaMensal: number;
  chamadosNoMes: number;
  custoMensal: number;
  receitaTotal: number;
}

export default function PrestadorDashboard({ _user }: { _user: User }) {
  const [stats, setStats] = useState<DashboardStats>({
    receitaMensal: 0,
    chamadosNoMes: 0,
    custoMensal: 0,
    receitaTotal: 0,
  });
  const [ordens, setOrdens] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  function formatarValor(valor: unknown, moeda: boolean = true): string {
    const numero = Number(valor);
    if (!valor || isNaN(numero)) {
      return moeda ? "R$ 0,00" : "0,00";
    }

    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    if (moeda) {
      options.style = "currency";
      options.currency = "BRL";
    } else {
      options.style = "decimal";
    }
    return new Intl.NumberFormat("pt-BR", options).format(numero);
  }

  function getOrdemStatusBadge(status: string) {
    switch (status) {
      case "EM_ANDAMENTO":
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Em execução
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
          <Badge className="bg-blue-50 text-blue-600 border-blue-200">
            Aguardando
          </Badge>
        );
    }
  }

  function getPropostaStatusBadge(status: string) {
    switch (status) {
      case "ACEITA":
        return (
          <Badge className="bg-green-50 text-green-600 border-green-200">
            Aceita
          </Badge>
        );
      case "RECUSADA":
        return (
          <Badge className="bg-red-50 text-red-600 border-red-200">
            Recusada
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Pendente
          </Badge>
        );
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const dash = await apiGetPrestadorDashboard();
        if (dash.success && dash.data) {
          setStats({
            receitaMensal: dash.data.receitaMensal || 0,
            chamadosNoMes: dash.data.chamadosNoMes || 0,
            custoMensal: dash.data.custoMensal || 0,
            receitaTotal:
              dash.data.receitaTotal ?? dash.data.lucroMensal ?? 0,
          });
        }
        const ord = await apiPrestadorListOrdens();
        if (ord.success) {
          setOrdens(ord.data.items || []);
        }
        const prop = await apiPrestadorListPropostas();
        if (prop.success) {
          setPropostas(prop.data || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Receita mensal
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {formatarValor(stats.receitaMensal)}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <NoteIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados no mês
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.chamadosNoMes.toString()} chamados
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
                    Custo mensal
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {formatarValor(stats.custoMensal)}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <ClipboardTickIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Receita total
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {formatarValor(stats.receitaTotal)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Ordens de serviço */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Ordens de serviço ativas
                </h2>
                <p className="font-afacad text-base text-black">
                  Acompanhe as ordens de serviço em andamento
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-6 py-3 h-12 rounded-xl shadow-lg"
                  onClick={() => router.push("/prestador/ordens")}
                >
                  Criar nova OS
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl border-[#1F45FF] text-[#1F45FF] font-afacad font-bold"
                >
                  Exportar planilha
                </Button>
              </div>
            </div>

            {ordens.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[800px]">
                    <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-5 gap-4 text-sm font-afacad font-bold text-black">
                        <div>Chamado</div>
                        <div>Condomínio</div>
                        <div>Valor</div>
                        <div>Status</div>
                        <div>Ações</div>
                      </div>
                    </div>
                    <div className="divide-y divide-[#EFF0FF]">
                      {ordens.slice(0, 5).map((ordem) => (
                        <div
                          key={ordem.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[800px]"
                          onClick={() => router.push("/prestador/ordens")}
                        >
                          <div className="grid grid-cols-5 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.chamado?.numeroChamado}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.chamado?.imovel?.nome || ordem.chamado?.imovel?.endereco || "N/A"}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {formatarValor(ordem.chamado?.valorEstimado)}
                            </div>
                            <div>{getOrdemStatusBadge(ordem.status)}</div>
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
                    Nenhuma ordem encontrada
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    Ainda não existem ordens de serviço para este mês.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Propostas de serviços */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Propostas de serviços Condy
                </h2>
                <p className="font-afacad text-base text-black">
                  Gerencie as propostas de serviço recebidas
                </p>
              </div>
            </div>

            {propostas.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[700px]">
                    <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-4 gap-4 text-sm font-afacad font-bold text-black">
                        <div>Chamado</div>
                        <div>Condomínio</div>
                        <div>Status</div>
                        <div>Ações</div>
                      </div>
                    </div>
                    <div className="divide-y divide-[#EFF0FF]">
                      {propostas.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[700px]"
                          onClick={() => router.push("/prestador/propostas")}
                        >
                          <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.chamado?.numeroChamado}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.chamado?.imovel?.nome || p.chamado?.imovel?.endereco || "N/A"}
                            </div>
                            <div>{getPropostaStatusBadge(p.status)}</div>
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
                    Nenhuma proposta recebida
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    No momento não há propostas disponíveis.
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

