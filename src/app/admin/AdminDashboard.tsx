"use client";

import {
  getAdminChamadosAction,
  getSystemStatsAction,
  updateChamadoAdminAction,
} from "@/app/actions/admin";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { EmptyStateIllustration } from "@/components/icons/EmptyStateIllustration";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { StatisticsIcon } from "@/components/icons/StatisticsIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chamado, User } from "@/types";
import { useEffect, useState } from "react";

function getStatusBadge(status: Chamado["status"]) {
  switch (status) {
    case "NOVO":
      return (
        <Badge className="bg-blue-50 text-blue-600 border-blue-200">
          Novo chamado
        </Badge>
      );
    case "A_CAMINHO":
      return (
        <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
          A caminho
        </Badge>
      );
    case "EM_ATENDIMENTO":
      return (
        <Badge className="bg-orange-50 text-orange-600 border-orange-200">
          Em atendimento
        </Badge>
      );
    case "CONCLUIDO":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200">
          Concluído
        </Badge>
      );
  }
}

function getPrioridadeBadge(prioridade: string) {
  switch (prioridade) {
    case "ALTA":
      return (
        <Badge className="bg-red-50 text-red-600 border-red-200">
          URGENTE
        </Badge>
      );
    case "MEDIA":
      return (
        <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
          MÉDIA
        </Badge>
      );
    case "BAIXA":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200">
          BAIXA
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

// Ícone de Admin (escudo)
const AdminIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 2.5L22.5 6.25V13.75C22.5 20 18.125 25.625 15 27.5C11.875 25.625 7.5 20 7.5 13.75V6.25L15 2.5Z"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 15L13.75 16.25L17.5 12.5"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de Usuários
const UsersIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 26.25V23.75C20 22.4239 19.4732 21.1521 18.5355 20.2145C17.5979 19.2768 16.3261 18.75 15 18.75H7.5C6.17392 18.75 4.90215 19.2768 3.96447 20.2145C3.02678 21.1521 2.5 22.4239 2.5 23.75V26.25"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 13.75C13.8714 13.75 16 11.6214 16 9C16 6.37858 13.8714 4.25 11.25 4.25C8.62858 4.25 6.5 6.37858 6.5 9C6.5 11.6214 8.62858 13.75 11.25 13.75Z"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.5 26.25V23.75C27.4996 22.7664 27.1751 21.8084 26.5743 21.0287C25.9735 20.2489 25.1307 19.6968 24.175 19.45"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.825 4.45C19.7822 4.69558 20.6264 5.24739 21.2281 6.02731C21.8298 6.80723 22.1549 7.76592 22.1549 8.75C22.1549 9.73408 21.8298 10.6928 21.2281 11.4727C20.6264 12.2526 19.7822 12.8044 18.825 13.05"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AdminDashboard({ _user }: { _user: User }) {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loadingChamados, setLoadingChamados] = useState(true);
  const [stats, setStats] = useState({
    totalChamados: 0,
    chamadosPendentes: 0,
    totalCondominios: 0,
    mediaTempoResolucao: 0
  });
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [editingChamado, setEditingChamado] = useState<Chamado | null>(null);
  const [activeTab, setActiveTab] = useState<
    "geral" | "servico" | "acessos" | "resposta"
  >("geral");

  function formatarValor(valor: unknown, moeda: boolean = true): string {
    const numero = Number(valor);

    if (!valor || isNaN(numero)) {
      return "Não definido";
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

  useEffect(() => {
    async function fetchData() {
      setLoadingChamados(true);
      
      try {
        // Buscar chamados
        const chamadosResponse = await getAdminChamadosAction();
        if (chamadosResponse.success && chamadosResponse.data) {
          setChamados(chamadosResponse.data);
        }

        // Buscar estatísticas
        const statsResponse = await getSystemStatsAction();
        if (statsResponse.success && statsResponse.data) {
          setStats({
            totalChamados: statsResponse.data.totalChamados,
            chamadosPendentes: statsResponse.data.chamadosPendentes,
            totalCondominios: statsResponse.data.totalCondominios,
            mediaTempoResolucao: statsResponse.data.mediaTempoResolucao
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
      
      setLoadingChamados(false);
    }

    fetchData();
  }, []);

  const handleSaveChanges = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!editingChamado) return;

    const formData = new FormData(event.currentTarget);
    const updateData = {
      status: formData.get("status") as string,
      prestadorId: formData.get("prestadorId") as string,
      valorEstimado: formData.get("valorEstimado")
        ? parseFloat(formData.get("valorEstimado") as string)
        : undefined,
    };

    try {
      const response = await updateChamadoAdminAction(
        editingChamado.id,
        updateData
      );
      if (response.success) {
        setChamados((prev) =>
          prev.map((c) =>
            c.id === editingChamado.id ? { ...c, ...updateData } : c
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar chamado", error);
    }

    setEditingChamado(null);
  };

  

  const urgentTicketsCount = chamados.filter(
    (chamado) => chamado.prioridade === "ALTA"
  ).length;

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      {/* Cards sobrepostos ao header - Ajustado para ficar 50% dentro e 50% fora */}
      {loadingChamados ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <img src="/loading.gif" alt="Carregando..." className="w-16 h-16" />
        </div>
      ) : (
        <div className="container relative -mt-20 z-10">
          {/* Overview Cards - 4 cards para admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Chamados */}
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Total chamados
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.totalChamados.toString()} chamados
                  </div>
                </div>
              </div>
            </Card>

            {/* Chamados Pendentes */}
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <NoteIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados pendentes
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.chamadosPendentes.toString()} pendentes
                  </div>
                </div>
              </div>
            </Card>

            {/* Chamados Urgentes */}
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <AdminIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados urgentes
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {urgentTicketsCount.toString()} urgentes
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Condomínios */}
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <UsersIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Total condomínios
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.totalCondominios.toString()} condomínios
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tickets Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Lista de chamados
                </h2>
                <p className="font-afacad text-base text-black">
                  Acompanhe e atualize os chamados em tempo real
                </p>
              </div>
            </div>

            {chamados.length > 0 ? (
              /* Tickets Table */
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[800px]">
                    {/* Table Header */}
                    <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-8 gap-4 text-sm font-afacad font-bold text-black">
                        <div>Número</div>
                        <div>Condomínio</div>
                        <div>Tipo</div>
                        <div>Prioridade</div>
                        <div>Status</div>
                        <div>Prestador</div>
                        <div>Valor</div>
                        <div>Ações</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-[#EFF0FF]">
                      {chamados.map((chamado) => (
                        <div
                          key={chamado.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[800px]"
                          onClick={() => setSelectedChamado(chamado)}
                        >
                          <div className="grid grid-cols-8 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {chamado.numeroChamado}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {chamado.imovel?.nome || "N/A"}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {chamado.escopo === "ORCAMENTO"
                                ? "Orçamento"
                                : "Imediato"}
                            </div>
                            <div>
                              {getPrioridadeBadge(chamado.prioridade)}
                            </div>
                            <div>
                              {getStatusBadge(chamado.status)}
                            </div>
                            <div
                              className={
                                `font-afacad font-bold text-sm ` +
                                (chamado.prestadorId
                                  ? `text-black`
                                  : `text-black/50`)
                              }
                            >
                              {chamado.prestadorId || "Não alocado"}
                            </div>
                            <div
                              className={
                                `font-afacad font-bold text-sm ` +
                                (Number(chamado.valorEstimado || 0) > 0
                                  ? `text-black`
                                  : `text-black/50`)
                              }
                            >
                              {formatarValor(chamado.valorEstimado)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-blue-600 font-medium">
                                EDITAR
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
            ) : !loadingChamados ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16">
                <EmptyStateIllustration />
                <div className="text-center mt-6 max-w-md">
                  <h3 className="font-afacad text-3xl font-bold text-black mb-3">
                    Painel Administrativo
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    Nenhum chamado encontrado no sistema.
                    <br />
                    Aguarde novas solicitações dos síndicos.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {selectedChamado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-afacad text-2xl font-bold text-black">
                {selectedChamado.descricaoOcorrido || "Detalhes do chamado"}
              </h3>
              <button
                onClick={() => setSelectedChamado(null)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6 border-b border-[#EFF0FF] flex space-x-6">
              {[
                ["geral", "Geral"],
                ["servico", "Serviço"],
                ["acessos", "Acessos"],
                ["resposta", "Resposta"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`pb-2 font-afacad font-bold text-sm hover:text-blue-600 ${
                    activeTab === key
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "geral" && (
              <div className="space-y-4 font-afacad text-sm text-black">
                <p>
                  <strong>Número:</strong> {selectedChamado.numeroChamado}
                </p>
                <p>
                  <strong>Condomínio:</strong> {" "}
                  {selectedChamado.imovel?.nome || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedChamado.status}
                </p>
                <p>
                  <strong>Prioridade:</strong> {selectedChamado.prioridade}
                </p>
              </div>
            )}

            {activeTab === "servico" && (
              <div className="font-afacad text-sm text-black">
                Informações do serviço não disponíveis.
              </div>
            )}

            {activeTab === "acessos" && (
              <div className="font-afacad text-sm text-black">
                Dados de acesso não disponíveis.
              </div>
            )}

            {activeTab === "resposta" && (
              <div className="font-afacad text-sm text-black">
                Nenhuma resposta registrada.
              </div>
            )}

            <div className="flex justify-between pt-6">
              <label className="cursor-pointer">
                <input type="file" className="hidden" />
                <span className="px-6 py-3 border border-[#EFF0FF] rounded-xl text-black font-afacad font-bold">
                  Carregar Recibo / NF
                </span>
              </label>
              <Button
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold px-6 py-3 rounded-xl"
                onClick={() => {
                  setEditingChamado(selectedChamado);
                  setSelectedChamado(null);
                }}
              >
                Atualizar chamado
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingChamado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-afacad text-2xl font-bold text-black">
                Atualizando chamado
              </h3>
              <button
                onClick={() => setEditingChamado(null)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSaveChanges}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingChamado.status}
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  >
                    <option value="NOVO">Novo</option>
                    <option value="A_CAMINHO">A Caminho</option>
                    <option value="EM_ATENDIMENTO">Em Atendimento</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">
                    Prestador vinculado
                  </label>
                  <input
                    type="text"
                    name="prestadorId"
                    defaultValue={editingChamado.prestadorId || ""}
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">
                    Valor estimado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="valorEstimado"
                    defaultValue={
                      editingChamado.valorEstimado &&
                      typeof editingChamado.valorEstimado === "number"
                        ? editingChamado.valorEstimado.toString()
                        : ""
                    }
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  />
                </div>

                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">
                    Prazo de solução
                  </label>
                  <input
                    type="text"
                    name="prazo"
                    placeholder="ex: 6 meses"
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">
                    Subir Recibo / NF
                  </label>
                  <input
                    type="file"
                    className="w-full border-2 border-dashed border-[#EFF0FF] rounded-xl px-4 py-6 font-afacad"
                  />
                </div>

                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">
                    Subir Relatório de fechamento
                  </label>
                  <input
                    type="file"
                    className="w-full border-2 border-dashed border-[#EFF0FF] rounded-xl px-4 py-6 font-afacad"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  onClick={() => setEditingChamado(null)}
                  className="px-6 py-3 border-2 border-[#EFF0FF] rounded-xl text-black hover:bg-gray-50 font-afacad font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-3 bg-[#1F45FF] text-white rounded-xl hover:bg-[#1F45FF]/90 font-afacad font-bold"
                >
                  Salvar alterações
                </Button>
              </div>
            </form>
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