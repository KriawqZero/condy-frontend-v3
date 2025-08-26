"use client";

import { useEffect, useState } from "react";

import { apiGetPrestadorDashboard } from "@/app/actions/prestador";
import {
  apiPrestadorListOrdens,
  apiPrestadorAlterarStatus,
  apiPrestadorCriarOrdemAvulsa,
} from "@/app/actions/ordens";
import { apiPrestadorListPropostas, apiPrestadorAceitarProposta, apiPrestadorRecusarProposta, apiPrestadorContraproposta } from "@/app/actions/propostas";

import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { EmptyStateIllustration } from "@/components/icons/EmptyStateIllustration";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { StatisticsIcon } from "@/components/icons/StatisticsIcon";
import { ClipboardTickIcon } from "@/components/icons/ClipboardClipIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";

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
  const [propostaSelecionada, setPropostaSelecionada] = useState<any|null>(null);
  const [mostrarContra, setMostrarContra] = useState(false);
  const [contraMax, setContraMax] = useState("");
  const [contraPrazo, setContraPrazo] = useState("");
  const [contraJust, setContraJust] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [novaOsOpen, setNovaOsOpen] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaValor, setNovaValor] = useState("");
  const [novaPrazo, setNovaPrazo] = useState("");
  const [salvandoNova, setSalvandoNova] = useState(false);
  const [statusModal, setStatusModal] = useState<any|null>(null);
  const [novoStatus, setNovoStatus] = useState("EM_ANDAMENTO");
  const [salvandoStatus, setSalvandoStatus] = useState(false);

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
      case "PROPOSTA_ACEITA":
        return (
          <Badge className="bg-green-50 text-green-600 border-green-200">
            Aceita
          </Badge>
        );
      case "PROPOSTA_RECUSADA":
        return (
          <Badge className="bg-red-50 text-red-600 border-red-200">
            Recusada
          </Badge>
        );
      case "CONTRAPROPOSTA_ENVIADA":
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Contraproposta
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

  function formatarEndereco(imovel?: any) {
    if (!imovel) return "N/A";
    const parts = [imovel.endereco, imovel.numero, imovel.bairro, imovel.cidade, imovel.uf].filter(Boolean);
    return parts.join(", ");
  }

  async function carregarPainel() {
    setLoading(true);
    try {
      const dash = await apiGetPrestadorDashboard();
      if (dash.success && dash.data) {
        setStats({
          receitaMensal: dash.data.receitaMensal || 0,
          chamadosNoMes: dash.data.chamadosNoMes || 0,
          custoMensal: dash.data.custoMensal || 0,
          receitaTotal: dash.data.receitaTotal ?? dash.data.lucroMensal ?? 0,
        });
      }
      await carregarOrdens();
      await carregarPropostas();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function carregarOrdens() {
    const ord = await apiPrestadorListOrdens();
    if (ord.success) setOrdens(ord.data.items || []);
  }

  async function carregarPropostas() {
    const prop = await apiPrestadorListPropostas();
    if (prop.success) setPropostas(prop.data || []);
  }

  async function criarNovaOs() {
    setSalvandoNova(true);
    const r = await apiPrestadorCriarOrdemAvulsa({
      descricao: novaDescricao,
      valorAcordado: novaValor ? Number(novaValor) : undefined,
      prazoAcordado: novaPrazo ? Number(novaPrazo) : undefined,
    });
    setSalvandoNova(false);
    if (r.success) {
      setNovaOsOpen(false);
      setNovaDescricao("");
      setNovaValor("");
      setNovaPrazo("");
      await carregarOrdens();
    } else {
      alert(r.error);
    }
  }

  async function atualizarStatus() {
    if (!statusModal) return;
    setSalvandoStatus(true);
    const r = await apiPrestadorAlterarStatus(statusModal.id, novoStatus as any);
    setSalvandoStatus(false);
    if (r.success) {
      setStatusModal(null);
      await carregarOrdens();
    } else {
      alert(r.error);
    }
  }

  useEffect(() => {
    carregarPainel();
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
                  onClick={() => setNovaOsOpen(true)}
                >
                  Nova OS (avulsa)
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
                      {ordens.map((ordem) => (
                        <div
                          key={ordem.id}
                          className="px-6 py-4 hover:bg-gray-50 min-w-[800px]"
                        >
                          <div className="grid grid-cols-5 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {ordem.chamado?.numeroChamado}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {formatarEndereco(ordem.chamado?.imovel)}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {formatarValor(ordem.chamado?.valorEstimado)}
                            </div>
                            <div>{getOrdemStatusBadge(ordem.status)}</div>
                            <div className="flex items-center justify-center">
                              <Button
                                className="bg-[#1F45FF] text-white"
                                onClick={() => {
                                  setStatusModal(ordem);
                                  setNovoStatus(ordem.status);
                                }}
                              >
                                Alterar
                              </Button>
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

            {propostas.filter(p => !['PROPOSTA_ACEITA','CONTRAPROPOSTA_APROVADA'].includes(p.status)).length > 0 ? (
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
                      {propostas.filter(p => !['PROPOSTA_ACEITA','CONTRAPROPOSTA_APROVADA'].includes(p.status)).slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[700px]"
                          onClick={(e) => { e.stopPropagation(); setPropostaSelecionada(p); setMostrarContra(false); setContraMax(""); setContraPrazo(""); setContraJust(""); }}
                        >
                          <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="font-afacad text-sm font-bold text-black">
                              {p.chamado?.numeroChamado}
                            </div>
                            <div className="font-afacad text-sm font-bold text-black">
                              {formatarEndereco(p.chamado?.imovel)}
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

      {/* Modal Nova OS */}
      {novaOsOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nova OS avulsa</h2>
            <div className="space-y-4">
              <Input label="Descrição" value={novaDescricao} onChange={(e)=>setNovaDescricao(e.target.value)} required />
              <Input label="Valor acordado" type="number" value={novaValor} onChange={(e)=>setNovaValor(e.target.value)} />
              <Input label="Prazo (dias)" type="number" value={novaPrazo} onChange={(e)=>setNovaPrazo(e.target.value)} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
              <Button
                variant="secondary"
                onClick={()=>{ setNovaOsOpen(false); setNovaDescricao(''); setNovaValor(''); setNovaPrazo(''); }}
                className="sm:min-w-[120px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={criarNovaOs}
                disabled={salvandoNova}
                className="bg-[#1F45FF] text-white sm:min-w-[120px]"
              >
                {salvandoNova ? "Salvando..." : "Criar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atualizar Status */}
      {statusModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Atualizar status</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-black">Status</label>
              <select
                value={novoStatus}
                onChange={(e)=>setNovoStatus(e.target.value)}
                className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
              >
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
              <Button
                variant="secondary"
                onClick={()=>setStatusModal(null)}
                className="sm:min-w-[120px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={atualizarStatus}
                disabled={salvandoStatus}
                className="bg-[#1F45FF] text-white sm:min-w-[120px]"
              >
                {salvandoStatus ? "Salvando..." : "Atualizar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes Proposta */}
      {propostaSelecionada && !mostrarContra && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={()=>setPropostaSelecionada(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-afacad text-2xl font-bold">Detalhes da proposta</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>setPropostaSelecionada(null)}>Fechar</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-bold">Chamado</div>
                <div>#{propostaSelecionada.chamado?.numeroChamado}</div>
              </div>
              <div>
                <div className="font-bold">Endereço de atendimento</div>
                <div>{formatarEndereco(propostaSelecionada.chamado?.imovel)}</div>
              </div>
              <div>
                <div className="font-bold">Faixa sugerida pelo admin</div>
                <div>
                  {propostaSelecionada.precoSugeridoMin || '-'} ~ {propostaSelecionada.precoSugeridoMax || '-'} | Prazo: {propostaSelecionada.prazoSugerido || '-'}
                </div>
              </div>
              {propostaSelecionada.contrapropostaPrecoMin || propostaSelecionada.contrapropostaPrecoMax ? (
                <div>
                  <div className="font-bold">Sua contraproposta</div>
                  <div>
                    {propostaSelecionada.contrapropostaPrecoMin || '-'} ~ {propostaSelecionada.contrapropostaPrecoMax || '-'} | Prazo: {propostaSelecionada.contrapropostaPrazo || '-'}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button className="bg-red-600 text-white" onClick={async ()=>{ const j = prompt('Motivo da recusa (opcional)') || ''; setSalvando(true); try { await apiPrestadorRecusarProposta(propostaSelecionada.id, j); await carregarPropostas(); } finally { setSalvando(false); setPropostaSelecionada(null); } }}>Recusar</Button>
              <Button className="bg-yellow-600 text-white" onClick={()=> setMostrarContra(true)}>Fazer contraproposta</Button>
              <Button className="bg-green-600 text-white" disabled={salvando} onClick={async ()=>{ setSalvando(true); try { await apiPrestadorAceitarProposta(propostaSelecionada.id); await carregarPropostas(); await carregarOrdens(); } finally { setSalvando(false); setPropostaSelecionada(null); } }}>Aceitar proposta</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contraproposta */}
      {propostaSelecionada && mostrarContra && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={()=>setMostrarContra(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-afacad text-xl font-bold">Fazer contraproposta</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>setMostrarContra(false)}>Fechar</button>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-[#1F45FF]">Faixa sugerida: {propostaSelecionada.precoSugeridoMin || '-'} ~ {propostaSelecionada.precoSugeridoMax || '-'}</div>
              <div>
                <label className="block text-sm font-afacad font-bold text-black mb-1">Meu valor proposto</label>
                <input className="w-full border rounded-lg px-3 py-2" value={contraMax} onChange={(e)=>setContraMax(e.target.value)} placeholder="Ex.: 3200,00" />
              </div>
              <div>
                <label className="block text-sm font-afacad font-bold text-black mb-1">Prazo (dias)</label>
                <input className="w-full border rounded-lg px-3 py-2" value={contraPrazo} onChange={(e)=>setContraPrazo(e.target.value)} placeholder="Ex.: 3" />
              </div>
              <div>
                <label className="block text-sm font-afacad font-bold text-black mb-1">Observações (opcional)</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={contraJust} onChange={(e)=>setContraJust(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button className="bg-gray-200 text-black" onClick={()=>setMostrarContra(false)}>Voltar</Button>
              <Button className="bg-[#1F45FF] text-white" disabled={salvando} onClick={async ()=>{ setSalvando(true); try { await apiPrestadorContraproposta(propostaSelecionada.id, { precoMax: contraMax || undefined, prazo: contraPrazo ? Number(contraPrazo) : undefined, justificativa: contraJust || '' }); await carregarPropostas(); } finally { setSalvando(false); setMostrarContra(false); setPropostaSelecionada(null); } }}>Enviar contraproposta</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

