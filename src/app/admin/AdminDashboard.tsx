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
import { ModalAtualizarChamado } from "@/components/admin/ModalAtualizarChamado";

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
  const [abrirProposta, setAbrirProposta] = useState<Chamado | null>(null);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [prestadoresSelecionados, setPrestadoresSelecionados] = useState<string[]>([]);
  const [precoMin, setPrecoMin] = useState<string>("");
  const [precoMax, setPrecoMax] = useState<string>("");
  const [prazo, setPrazo] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [propostasChamado, setPropostasChamado] = useState<any[]>([]);
  const [valorAcordadoAdmin, setValorAcordadoAdmin] = useState<string>("");

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
                  Acompanhe as últimas atualizações na plataforma
                </p>
              </div>
              <Button
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
              >
                Exportar dados
              </Button>
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
                                (chamado.prestadorAssignadoId
                                  ? `text-black`
                                  : `text-black/50`)
                              }
                            >
                              {chamado.prestadorAssignadoId ? (chamado.prestadorAssignado?.name || "Nome não disponível") : "Não alocado"}
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
                                GERENCIAR
                              </span>
                              <div className="w-6 h-6 rounded-full bg-[#F5F7FF] flex items-center justify-center ml-2">
                                <ChevronRightIcon />
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button className="bg-[#1F45FF] text-white" onClick={(e)=>{ e.stopPropagation(); setAbrirProposta(chamado); (async()=>{ const list = await adminListPrestadoresAction(); setPrestadores(Array.isArray(list.data) ? list.data : []); const prop = await adminListPropostasPorChamadoAction(Number(chamado.id)); setPropostasChamado(Array.isArray(prop.data) ? prop.data : []); })(); }}>Fazer proposta a prestador</Button>
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
        <ModalVisualizarChamado
          chamado={selectedChamado}
          onClose={() => setSelectedChamado(null)}
          onUpdate={() => {
            setEditingChamado(selectedChamado);
            setSelectedChamado(null);
          }}
        />
      )}

      {editingChamado && (
        <ModalAtualizarChamado
          chamado={editingChamado}
          onClose={() => setEditingChamado(null)}
          onUpdated={fetchData}
        />
      )}

      {abrirProposta && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={()=>setAbrirProposta(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-afacad text-xl font-bold">Fazer proposta a prestador</div>
              <button onClick={()=>setAbrirProposta(null)} className="text-gray-500 hover:text-gray-700">Fechar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-afacad font-bold text-black mb-2">Selecione prestadores</label>
                <div className="max-h-48 overflow-auto border rounded-lg p-2">
                  {(Array.isArray(prestadores) ? prestadores : []).map((p)=> (
                    <label key={p.id} className="flex items-center gap-2 py-1">
                      <input type="checkbox" checked={prestadoresSelecionados.includes(p.id)} onChange={(e)=>{
                        setPrestadoresSelecionados((prev)=> e.target.checked ? [...prev, p.id] : prev.filter(id=>id!==p.id));
                      }} />
                      <span className="text-sm">{p.nomeFantasia || p.name} — {p.cpfCnpj}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-afacad font-bold text-black mb-2">Preço sugerido (mínimo)</label>
                <input className="w-full border rounded-lg px-3 py-2" value={precoMin} onChange={(e)=>setPrecoMin(e.target.value)} placeholder="Opcional" />
                {precoMin && precoMax && Number(precoMin) > Number(precoMax) && (
                  <div className="text-xs text-red-600 mt-1">Mínimo não pode ser maior que máximo.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-afacad font-bold text-black mb-2">Preço sugerido (máximo)</label>
                <input className="w-full border rounded-lg px-3 py-2" value={precoMax} onChange={(e)=>setPrecoMax(e.target.value)} placeholder="Opcional" />
                {precoMin && precoMax && Number(precoMin) > Number(precoMax) && (
                  <div className="text-xs text-red-600 mt-1">Máximo deve ser maior ou igual ao mínimo.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-afacad font-bold text-black mb-2">Prazo (dias)</label>
                <input className="w-full border rounded-lg px-3 py-2" value={prazo} onChange={(e)=>setPrazo(e.target.value)} placeholder="Opcional" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button className="bg-gray-200 text-black" onClick={()=>setAbrirProposta(null)}>Cancelar</Button>
              <Button className="bg-[#1F45FF] text-white" disabled={enviando || prestadoresSelecionados.length===0 || (!!precoMin && !!precoMax && Number(precoMin) > Number(precoMax))} onClick={async ()=>{
                try {
                  setEnviando(true);
                  await adminEnviarPropostasAction({ chamadoId: Number(abrirProposta.id), prestadores: prestadoresSelecionados, precoMin: precoMin || undefined, precoMax: precoMax || undefined, prazo: prazo ? Number(prazo) : undefined });
                  const prop = await adminListPropostasPorChamadoAction(Number(abrirProposta.id));
                  setPropostasChamado(prop.data || []);
                  setPrestadoresSelecionados([]);
                } finally {
                  setEnviando(false);
                }
              }}>Enviar propostas</Button>
            </div>

            {propostasChamado.length > 0 && (
              <div className="mt-6">
                <div className="font-afacad text-lg font-bold mb-2">Propostas deste chamado</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {propostasChamado.map((p)=> (
                    <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div className="text-sm">
                        <div><span className="font-bold">Prestador:</span> {p.prestador?.nomeFantasia || p.prestador?.name}</div>
                        <div><span className="font-bold">Status:</span> {p.status}</div>
                        <div><span className="font-bold">Sugestão:</span> {p.precoSugeridoMin || '-'} ~ {p.precoSugeridoMax || '-'}</div>
                        {p.contrapropostaPrecoMin || p.contrapropostaPrecoMax ? (
                          <div><span className="font-bold">Contraproposta:</span> {p.contrapropostaPrecoMin || '-'} ~ {p.contrapropostaPrecoMax || '-'} | Prazo: {p.contrapropostaPrazo || '-'}</div>
                        ) : null}
                      </div>
                      {p.status === 'CONTRAPROPOSTA_ENVIADA' && (
                        <div className="flex gap-2">
                          <input className="border rounded px-2 py-1 text-sm" placeholder="Valor acordado (obrigatório)" value={valorAcordadoAdmin} onChange={(e)=>setValorAcordadoAdmin(e.target.value)} />
                          <Button className="bg-green-600 text-white" onClick={async ()=>{ if (!valorAcordadoAdmin) { alert('Informe o valor acordado'); return; } await adminDecidirContrapropostaAction(p.id, 'aprovar', /* @ts-ignore */ { valorAcordado: valorAcordadoAdmin }); setValorAcordadoAdmin(""); const prop = await adminListPropostasPorChamadoAction(Number(abrirProposta.id)); setPropostasChamado(prop.data || []); fetchData(); }}>Aprovar</Button>
                          <Button className="bg-red-600 text-white" onClick={async ()=>{ await adminDecidirContrapropostaAction(p.id, 'recusar'); const prop = await adminListPropostasPorChamadoAction(Number(abrirProposta.id)); setPropostasChamado(prop.data || []); }}>Recusar</Button>
                        </div>
                      )}
                    </div>
                  ))}
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
