"use client";

import { getAdminChamadosAction, getSystemStatsAction, adminListPrestadoresAction, adminEnviarPropostasAction, adminListPropostasPorChamadoAction, adminDecidirContrapropostaAction } from "@/app/actions/admin";
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
import { ModalVisualizarChamado } from "@/components/admin/ModalVisualizarChamado";


function getStatusBadge(status: string) {
  switch (status) {
    case "NOVO":
    case "PENDENTE":
    case "AGUARDANDO_TECNICO":
    case "AGUARDANDO_ORCAMENTO":
    case "AGUARDANDO_APROVACAO":
      return (
        <Badge className="bg-blue-50 text-blue-600 border-blue-200 px-3 py-1 text-xs font-medium rounded-full">
          Pendente
        </Badge>
      );
    case "A_CAMINHO":
    case "EM_ATENDIMENTO":
    case "EM_ANDAMENTO":
      return (
        <Badge className="bg-orange-50 text-orange-600 border-orange-200 px-3 py-1 text-xs font-medium rounded-full">
          Em andamento
        </Badge>
      );
    case "CONCLUIDO":
    case "SERVICO_CONCLUIDO":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200 px-3 py-1 text-xs font-medium rounded-full">
          Serviço concluído
        </Badge>
      );
    case "CANCELADO":
      return (
        <Badge className="bg-red-50 text-red-600 border-red-200 px-3 py-1 text-xs font-medium rounded-full">
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-50 text-gray-600 border-gray-200 px-3 py-1 text-xs font-medium rounded-full">
          {status}
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

// Ícone de Urgência (relógio com alerta)
const UrgentIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="15"
      cy="15"
      r="11.25"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 7.5V15L20 17.5"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5 7.5L25 5"
      stroke="#1F45FF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25 10L27.5 10"
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
  const [chamadosFiltrados, setChamadosFiltrados] = useState<Chamado[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [loadingChamados, setLoadingChamados] = useState(true);
  const [stats, setStats] = useState({
    totalChamados: 0,
    chamadosPendentes: 0,
    totalCondominios: 0,
    mediaTempoResolucao: 0
  });
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);

  const [abrirProposta, setAbrirProposta] = useState<Chamado | null>(null);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [prestadoresSelecionados, setPrestadoresSelecionados] = useState<string[]>([]);
  const [precoMin, setPrecoMin] = useState<string>("");
  const [precoMax, setPrecoMax] = useState<string>("");
  const [prazo, setPrazo] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [propostasChamado, setPropostasChamado] = useState<any[]>([]);
  const [valorAcordadoAdmin, setValorAcordadoAdmin] = useState<string>("");

  // Função para filtrar chamados
  const filtrarChamados = (termo: string) => {
    if (!termo.trim()) {
      setChamadosFiltrados(chamados);
      return;
    }

    const termoLower = termo.toLowerCase();
    const chamadosFiltrados = chamados.filter((chamado) => {
      const numeroChamado = chamado.numeroChamado?.toString().toLowerCase() || "";
      const condominio = chamado.imovel?.nome?.toLowerCase() || "";
      const tipo = (chamado.escopo === "ORCAMENTO" ? "Orçamento" : "Imediato").toLowerCase();
      const status = chamado.status?.toLowerCase() || "";
      const prestador = chamado.prestadorAssignado?.name?.toLowerCase() || "";
      
      return (
        numeroChamado.includes(termoLower) ||
        condominio.includes(termoLower) ||
        tipo.includes(termoLower) ||
        status.includes(termoLower) ||
        prestador.includes(termoLower)
      );
    });

    setChamadosFiltrados(chamadosFiltrados);
  };

  // useEffect para filtrar quando o termo de busca mudar
  useEffect(() => {
    filtrarChamados(termoBusca);
  }, [termoBusca, chamados]);

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

  const fetchData = async () => {
    setLoadingChamados(true);

    try {
      // Buscar chamados
      const chamadosResponse = await getAdminChamadosAction();
      if (chamadosResponse.success && chamadosResponse.data) {
        setChamados(chamadosResponse.data);
        setChamadosFiltrados(chamadosResponse.data);
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
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // Removido useEffect que atualizava os chamados para a busca mockada
  
  // Adiciona event listener para abrir o modal de visualização do chamado quando o evento for disparado
  useEffect(() => {
    const handleVisualizarChamado = (event: CustomEvent) => {
      const chamadoId = event.detail?.chamadoId;
      if (chamadoId) {
        // Encontra o chamado correspondente na lista de chamados
        const chamado = chamados.find(c => Number(c.id) === Number(chamadoId));
        if (chamado) {
          setSelectedChamado(chamado);
        }
      }
    };
    
    // Adiciona o event listener
    window.addEventListener('visualizarChamado', handleVisualizarChamado as EventListener);
    
    // Remove o event listener quando o componente for desmontado
    return () => {
      window.removeEventListener('visualizarChamado', handleVisualizarChamado as EventListener);
    };
  }, [chamados]);


  

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
          <div className="relative">
            <img 
              src="/3d_illustration.png" 
              alt="Ilustração 3D de prédio" 
              className="w-[330px] h-[303px] opacity-100 absolute hidden md:block lg:block" 
              style={{ 
                right: '0', 
                top: '-280px', 
                transform: 'rotate(0deg)' 
              }} 
            />
          </div>
          {/* Overview Cards - 4 cards para admin */}
          <div className="flex flex-wrap justify-start mb-8 sm:mb-10 md:mb-12 px-2 sm:pl-3">
           
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3" style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}>
              <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Total Chamados
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.totalChamados.toString()} 
                  </div>
                </div>
              </div>
            </Card>

            {/* Chamados Pendentes */}
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3" style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <NoteIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Pendentes
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.chamadosPendentes.toString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Chamados Urgentes */}
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3" style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <UrgentIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Urgentes
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {urgentTicketsCount.toString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Condomínios */}
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3" style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center">
                  <UsersIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Total condomínios
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.totalCondominios.toString()}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tickets Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Lista de chamados
                </h2>
                <p className="font-afacad text-base text-black">
                  Acompanhe as últimas atualizações na plataforma
                </p>
              </div>
              <Button
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
              >
                Exportar dados
              </Button>
            </div>

            {/* Barra de pesquisa */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por número, condomínio, tipo, status ou prestador..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] font-afacad text-sm"
                />
                {termoBusca && (
                  <button
                    onClick={() => setTermoBusca("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {termoBusca && (
                <p className="mt-2 text-sm text-gray-600 font-afacad">
                  {chamadosFiltrados.length} chamado(s) encontrado(s) para "{termoBusca}"
                </p>
              )}
            </div>

            {chamadosFiltrados.length > 0 ? (
              /* Tickets Table */
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[800px] relative">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-3 sm:px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-8 gap-2 sm:gap-4 text-xs sm:text-sm font-afacad font-bold text-black">
                        <div className="pl-0">Tipo de chamado</div>
                        <div className="pl-4">Ativo cadastrado</div>
                        <div className="pl-4">Valor do serviço</div>
                        <div className="pl-4">Prestador vinculado</div>
                        <div className="pl-4">Observações gerais</div>
                        <div className="pl-4">Chamado</div>
                        <div className="pl-4">Status do chamado</div>
                        <div className="pl-4">Ações</div>
                      </div>
                    </div>
                    {/* Linhas verticais da tabela */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 bottom-0 left-[12.5%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[37.5%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[62.5%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[87.5%] w-px bg-[#EFF0FF]"></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-[#EFF0FF]">
                      {chamadosFiltrados.map((chamado) => (
                        <div
                          key={chamado.id}
                          className="px-3 sm:px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[800px]"
                          onClick={() => setSelectedChamado(chamado)}
                        >
                          <div className="grid grid-cols-8 gap-2 sm:gap-4 items-center">
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-0">
                              {chamado.escopo === "ORCAMENTO"
                                ? "Solicitação de orçamento"
                                : "Serviço imediato"}
                            </div>
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4">
                              {chamado.imovel?.nome || "Sem ativo"}
                            </div>
                            <div
                              className={
                                `font-afacad font-bold text-xs sm:text-sm pl-2 sm:pl-4 ` +
                                (Number(chamado.valorEstimado || 0) > 0
                                  ? `text-black`
                                  : `text-black/50`)
                              }
                            >
                              {Number(chamado.valorEstimado || 0) > 0 ? formatarValor(chamado.valorEstimado) : "Sem valor"}
                            </div>
                            <div
                              className={
                                `font-afacad font-bold text-xs sm:text-sm pl-2 sm:pl-4 ` +
                                (chamado.prestadorAssignadoId
                                  ? `text-black`
                                  : `text-black/50`)
                              }
                            >
                              {chamado.prestadorAssignadoId ? (chamado.prestadorAssignado?.name || "N/D") : "Sem prestador"}
                            </div>
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4">
                              {chamado.descricaoOcorrido || "Sem descrição"}
                            </div>
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4">
                              {chamado.numeroChamado}
                            </div>
                            <div className="pl-2 sm:pl-4">
                              {getStatusBadge(chamado.status)}
                            </div>
                            <div className="flex items-center justify-between pl-2 sm:pl-4">
                              <div className="flex-1">
                                {chamado.status === 'NOVO' ? (
                                  <button 
                                    className="bg-[#1F45FF] hover:bg-[#1a3de6] text-white px-2 py-1 rounded-lg text-xs font-afacad font-bold transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAbrirProposta(chamado);
                                    }}
                                  >
                                    Proposta
                                  </button>
                                ) : (
                                  <div className="h-6"></div>
                                )}
                              </div>
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

            ) : !loadingChamados && chamados.length > 0 && chamadosFiltrados.length === 0 ? (
              /* Empty Search State */
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center mt-6 max-w-md">
                  <h3 className="font-afacad text-2xl font-bold text-black mb-3">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="font-afacad text-base text-gray-600 mb-4">
                    Não encontramos chamados que correspondam à sua busca por "{termoBusca}".
                  </p>
                  <Button
                    onClick={() => setTermoBusca("")}
                    className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-sm px-6 py-2 rounded-lg"
                  >
                    Limpar busca
                  </Button>
                </div>
              </div>
            ) : !loadingChamados && chamados.length === 0 ? (
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
        <ModalVisualizarChamado
          chamado={selectedChamado}
          onClose={() => setSelectedChamado(null)}
          onUpdate={fetchData}
        />
      )}

      {abrirProposta && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-2 sm:p-4" onClick={()=>setAbrirProposta(null)}>
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
            {/* Header */}
            <div className="bg-white px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-afacad text-black mb-1">
                    Fazer proposta a prestador
                  </h2>
                  <p className="text-gray-600 font-afacad">
                    Chamado #{abrirProposta.numeroChamado} — {abrirProposta.imovel?.nome || "Imóvel"}
                  </p>
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-blue-600 border border-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={()=>setAbrirProposta(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-grow">
              <div className="p-4 sm:p-6">
                {/* Prestadores Selection */}
                <div className="mb-6">
                  <h3 className="font-afacad text-lg font-bold text-black mb-4">Selecione prestadores</h3>
                  <div className="max-h-48 overflow-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                    {(Array.isArray(prestadores) ? prestadores : []).map((p)=> (
                      <label key={p.id} className="flex items-center gap-3 py-2 hover:bg-white rounded-lg px-2 transition-colors cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={prestadoresSelecionados.includes(p.id)} 
                          onChange={(e)=>{
                            setPrestadoresSelecionados((prev)=> e.target.checked ? [...prev, p.id] : prev.filter(id=>id!==p.id));
                          }} 
                          className="w-4 h-4 text-[#1F45FF] bg-gray-100 border-gray-300 rounded focus:ring-[#1F45FF] focus:ring-2"
                        />
                        <span className="font-afacad text-sm text-gray-700">{p.nomeFantasia || p.name} — {p.cpfCnpj}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price and Deadline Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  <div>
                    <label className="block font-afacad text-sm font-bold text-black mb-2">Preço sugerido (mínimo)</label>
                    <input 
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all" 
                      value={precoMin} 
                      onChange={(e)=>setPrecoMin(e.target.value)} 
                      placeholder="R$ 0,00" 
                    />
                    {precoMin && precoMax && Number(precoMin) > Number(precoMax) && (
                      <div className="text-xs text-red-500 mt-1 font-afacad">Mínimo não pode ser maior que máximo.</div>
                    )}
                  </div>
                  <div>
                    <label className="block font-afacad text-sm font-bold text-black mb-2">Preço sugerido (máximo)</label>
                    <input 
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all" 
                      value={precoMax} 
                      onChange={(e)=>setPrecoMax(e.target.value)} 
                      placeholder="R$ 0,00" 
                    />
                    {precoMin && precoMax && Number(precoMin) > Number(precoMax) && (
                      <div className="text-xs text-red-500 mt-1 font-afacad">Máximo deve ser maior ou igual ao mínimo.</div>
                    )}
                  </div>
                  <div>
                    <label className="block font-afacad text-sm font-bold text-black mb-2">Prazo (dias)</label>
                    <input 
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all" 
                      value={prazo} 
                      onChange={(e)=>setPrazo(e.target.value)} 
                      placeholder="Ex: 7 dias" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white px-4 sm:px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-afacad font-semibold px-6 py-3 rounded-xl transition-all duration-200" 
                  onClick={()=>setAbrirProposta(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#1F45FF] hover:bg-[#1a3de6] text-white font-afacad font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={enviando || prestadoresSelecionados.length===0 || (!!precoMin && !!precoMax && Number(precoMin) > Number(precoMax))} 
                  onClick={async ()=>{
                    try {
                      setEnviando(true);
                      await adminEnviarPropostasAction({ chamadoId: Number(abrirProposta.id), prestadores: prestadoresSelecionados, precoMin: precoMin || undefined, precoMax: precoMax || undefined, prazo: prazo ? Number(prazo) : undefined });
                      const prop = await adminListPropostasPorChamadoAction(Number(abrirProposta.id));
                      setPropostasChamado(prop.data || []);
                      setPrestadoresSelecionados([]);
                    } finally {
                      setEnviando(false);
                    }
                  }}
                >
                  {enviando ? 'Enviando...' : 'Enviar propostas'}
                </Button>
              </div>
            </div>

            {/* Proposals List */}
            {propostasChamado.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="p-4 sm:p-6">
                  <h3 className="font-afacad text-lg font-bold text-black mb-4">Propostas deste chamado</h3>
                  <div className="space-y-3 max-h-64 overflow-auto">
                    {propostasChamado.map((p)=> (
                      <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="font-afacad text-sm text-gray-600">
                              <span className="font-bold text-black">Prestador:</span> {p.prestador?.nomeFantasia || p.prestador?.name}
                            </div>
                            <div className="font-afacad text-sm text-gray-600">
                              <span className="font-bold text-black">Status:</span> 
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                p.status === 'CONTRAPROPOSTA_ENVIADA' ? 'bg-yellow-100 text-yellow-800' :
                                p.status === 'APROVADA' ? 'bg-green-100 text-green-800' :
                                p.status === 'RECUSADA' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="font-afacad text-sm text-gray-600">
                              <span className="font-bold text-black">Sugestão:</span> {p.precoSugeridoMin || '-'} ~ {p.precoSugeridoMax || '-'}
                            </div>
                            {p.contrapropostaPrecoMin || p.contrapropostaPrecoMax ? (
                              <div className="font-afacad text-sm text-gray-600">
                                <span className="font-bold text-black">Contraproposta:</span> {p.contrapropostaPrecoMin || '-'} ~ {p.contrapropostaPrecoMax || '-'} | Prazo: {p.contrapropostaPrazo || '-'}
                              </div>
                            ) : null}
                          </div>
                          {p.status === 'CONTRAPROPOSTA_ENVIADA' && (
                            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                              <input 
                                className="border-2 border-[#EFF0FF] rounded-xl px-3 py-2 text-sm font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF]" 
                                placeholder="Valor acordado" 
                                value={valorAcordadoAdmin} 
                                onChange={(e)=>setValorAcordadoAdmin(e.target.value)} 
                              />
                              <div className="flex gap-2">
                                <Button 
                                  className="bg-green-600 hover:bg-green-700 text-white font-afacad font-semibold px-4 py-2 rounded-xl text-sm transition-all" 
                                  onClick={async ()=>{ 
                                    if (!valorAcordadoAdmin) { 
                                      alert('Informe o valor acordado'); 
                                      return; 
                                    } 
                                    await adminDecidirContrapropostaAction(p.id, 'aprovar', /* @ts-ignore */ { valorAcordado: valorAcordadoAdmin }); 
                                    setValorAcordadoAdmin(""); 
                                    const prop = await adminListPropostasPorChamadoAction(Number(abrirProposta.id)); 
                                    setPropostasChamado(prop.data || []); 
                                    fetchData(); 
                                  }}
                                >
                                  Aprovar
                                </Button>
                                <Button 
                                  className="bg-red-600 hover:bg-red-700 text-white font-afacad font-semibold px-4 py-2 rounded-xl text-sm transition-all" 
                                  onClick={async ()=>{ 
                                    await adminDecidirContrapropostaAction(p.id, 'recusar'); 
                                    const prop = await adminListPropostasPorChamadoAction(Number(abrirProposta.id)); 
                                    setPropostasChamado(prop.data || []); 
                                  }}
                                >
                                  Recusar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="w-16 h-16 bg-[#10A07B] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
          <WhatsappIcon />
        </button>
      </div>
    </div>
  );
}