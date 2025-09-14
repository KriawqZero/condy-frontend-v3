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
  const [filtroAtivo, setFiltroAtivo] = useState("ORÇAMENTO");
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [mostrarSucessoProposta, setMostrarSucessoProposta] = useState(false);
  const [mostrarRecusaProposta, setMostrarRecusaProposta] = useState(false);
  const [mostrarErro, setMostrarErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

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
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#FFD9A014', color: '#FF8C00' }}>
            Em andamento
          </Badge>
        );
      case "CONCLUIDO":
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#E6F7E6', color: '#00A86B' }}>
            Concluído
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#FFE6E6', color: '#DC2626' }}>
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#E6F0FF', color: '#1F45FF' }}>
            Aguardando
          </Badge>
        );
    }
  }

  function getPropostaStatusBadge(status: string) {
    switch (status) {
      case "PROPOSTA_ACEITA":
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#E6F7E6', color: '#00A86B' }}>
            Aceita
          </Badge>
        );
      case "PROPOSTA_RECUSADA":
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#FFE6E6', color: '#DC2626' }}>
            Recusada
          </Badge>
        );
      case "CONTRAPROPOSTA_ENVIADA":
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#FFD9A014', color: '#FF8C00' }}>
            Contraproposta
          </Badge>
        );
      default:
        return (
          <Badge className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold" style={{ backgroundColor: '#FFD9A014', color: '#FF8C00' }}>
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

  function filtrarOrdens(ordens: any[], filtro: string) {
    if (filtro === "TODOS") return ordens;
    
    switch (filtro) {
      case "AGUARDANDO":
        return ordens.filter(ordem => ordem.status === "AGUARDANDO");
      case "EM_ANDAMENTO":
        return ordens.filter(ordem => ordem.status === "EM_ANDAMENTO");
      case "CONCLUIDO":
        return ordens.filter(ordem => ordem.status === "CONCLUIDO");
      case "ORÇAMENTO":
        return ordens.filter(ordem => ordem.status === "AGUARDANDO" || ordem.status === "ORÇAMENTO");
      default:
        return ordens;
    }
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
      setMostrarSucesso(true);
      // Scroll para a mensagem de sucesso
      setTimeout(() => {
        const elemento = document.getElementById('mensagem-sucesso');
        if (elemento) {
          elemento.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      // Esconder mensagem após 5 segundos
      setTimeout(() => setMostrarSucesso(false), 5000);
      await carregarOrdens();
    } else {
      setMensagemErro(r.error || "Problemas ao criar sua OS. Por favor aguarde alguns instantes e tente novamente, ok?");
      setMostrarErro(true);
      // Scroll para a mensagem de erro
      setTimeout(() => {
        const elemento = document.getElementById('mensagem-erro');
        if (elemento) {
          elemento.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      // Esconder mensagem após 5 segundos
      setTimeout(() => setMostrarErro(false), 5000);
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

  // Bloquear scroll do body quando sidebar estiver aberta
  useEffect(() => {
    if (novaOsOpen || statusModal) {
      document.body.style.overflow = 'hidden';
      // Scroll para o topo no mobile e tablet quando abrir sidebar
      if (window.innerWidth < 1024) { // lg breakpoint (inclui mobile e tablet)
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup para garantir que o scroll seja restaurado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [novaOsOpen, statusModal]);

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      {/* Ilustração de fundo */}
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
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <img src="/loading.gif" alt="Carregando..." className="w-16 h-16" />
        </div>
      ) : (
        <div className="container relative -mt-20 z-10">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center" style={{ width: '56px', height: '56px', top: '20px', left: '16px', opacity: 1, borderRadius: '50%', backgroundColor: '#F5F7FF' }}>
                  <StatisticsIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Lucro mensal
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {formatarValor(stats.receitaMensal)}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center" style={{ width: '56px', height: '56px', top: '20px', left: '16px', opacity: 1, borderRadius: '50%', backgroundColor: '#F5F7FF' }}>
                  <NoteIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Atividades no dia
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {stats.chamadosNoMes.toString()} chamados
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center" style={{ width: '56px', height: '56px', top: '20px', left: '16px', opacity: 1, borderRadius: '50%', backgroundColor: '#F5F7FF' }}>
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '30px', height: '30px', top: '33px', left: '29px', opacity: 1 }}>
                    <path d="M12.5 27.5H17.5C23.75 27.5 26.25 25 26.25 18.75V11.25C26.25 5 23.75 2.5 17.5 2.5H12.5C6.25 2.5 3.75 5 3.75 11.25V18.75C3.75 25 6.25 27.5 12.5 27.5Z" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.625 9.47498V10.725C20.625 11.75 19.7875 12.6 18.75 12.6H11.25C10.225 12.6 9.375 11.7625 9.375 10.725V9.47498C9.375 8.44998 10.2125 7.59998 11.25 7.59998H18.75C19.7875 7.59998 20.625 8.43748 20.625 9.47498Z" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.1701 17.5H10.1846" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.994 17.5H15.0084" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.8179 17.5H19.8323" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.1701 21.875H10.1846" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.994 21.875H15.0084" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.8179 21.875H19.8323" stroke="#1F45FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Custo mensal (Atual)
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {formatarValor(stats.custoMensal)}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center" style={{ width: '56px', height: '56px', top: '20px', left: '16px', opacity: 1, borderRadius: '50%', backgroundColor: '#F5F7FF' }}>
                  <ClipboardTickIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Receita mensal
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
            <div className="mb-8">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-shrink-0">
                    <h2 className="font-afacad text-2xl sm:text-3xl font-bold text-black mb-1">
                      Ordens de serviço ativas
                    </h2>
                    <p className="font-afacad text-sm sm:text-base text-black">
                      Acompanhe as últimas atualizações ou histórico dos seus trabalhos
                    </p>
                  </div>
                  <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-4">
                    {/* Filtros - visíveis em telas muito grandes */}
                    <div className="hidden 2xl:flex items-center gap-2 border-[0.5px] border-gray-200 rounded-[40px] p-1">
                      <button 
                        className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "TODOS" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                        style={filtroAtivo === "TODOS" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                        onClick={() => setFiltroAtivo("TODOS")}
                      >
                        Todos
                      </button>
                      <button 
                        className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "AGUARDANDO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                        style={filtroAtivo === "AGUARDANDO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                        onClick={() => setFiltroAtivo("AGUARDANDO")}
                      >
                        Aguardando
                      </button>
                      <button 
                        className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "EM_ANDAMENTO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                        style={filtroAtivo === "EM_ANDAMENTO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                        onClick={() => setFiltroAtivo("EM_ANDAMENTO")}
                      >
                        Em andamento
                      </button>
                      <button 
                        className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "ORÇAMENTO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                        style={filtroAtivo === "ORÇAMENTO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                        onClick={() => setFiltroAtivo("ORÇAMENTO")}
                      >
                        Orçamento
                      </button>
                      <button 
                        className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "CONCLUIDO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                        style={filtroAtivo === "CONCLUIDO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                        onClick={() => setFiltroAtivo("CONCLUIDO")}
                      >
                        Concluído
                      </button>
                    </div>
                    {/* Botões */}
                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                      <Button
                        className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 rounded-xl shadow-lg"
                        onClick={() => setNovaOsOpen(true)}
                      >
                        Criar nova OS
                      </Button>
                      <Button
                        className="bg-[#14B88E] hover:bg-[#14B88E]/90 text-white font-afacad font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 rounded-xl shadow-lg"
                      >
                        Exportar planilha
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Filtros - visíveis em telas menores */}
                <div className="flex 2xl:hidden items-center gap-1 sm:gap-2 border-[0.5px] border-gray-200 rounded-[40px] p-1 overflow-x-auto">
                  <button 
                    className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "TODOS" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                    style={filtroAtivo === "TODOS" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                    onClick={() => setFiltroAtivo("TODOS")}
                  >
                    Todos
                  </button>
                  <button 
                    className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "AGUARDANDO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                    style={filtroAtivo === "AGUARDANDO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                    onClick={() => setFiltroAtivo("AGUARDANDO")}
                  >
                    Aguardando
                  </button>
                  <button 
                    className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "EM_ANDAMENTO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                    style={filtroAtivo === "EM_ANDAMENTO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                    onClick={() => setFiltroAtivo("EM_ANDAMENTO")}
                  >
                    Em andamento
                  </button>
                  <button 
                    className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "ORÇAMENTO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                    style={filtroAtivo === "ORÇAMENTO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                    onClick={() => setFiltroAtivo("ORÇAMENTO")}
                  >
                    Orçamento
                  </button>
                  <button 
                    className={`px-3 sm:px-4 py-2 font-afacad text-xs sm:text-sm font-bold whitespace-nowrap ${filtroAtivo === "CONCLUIDO" ? "text-white" : "text-black hover:text-[#1F45FF]"}`}
                    style={filtroAtivo === "CONCLUIDO" ? { height: '40px', borderRadius: '40px', backgroundColor: '#1F45FF', opacity: 1 } : {}}
                    onClick={() => setFiltroAtivo("CONCLUIDO")}
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </div>

            {filtrarOrdens(ordens, filtroAtivo).length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[600px] sm:min-w-[800px] relative">
                    <div className="bg-gray-50 px-3 sm:px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm font-afacad font-bold text-black">
                        <div className="pl-0">Chamado</div>
                        <div className="pl-4">Condomínio</div>
                        <div className="pl-4">Valor</div>
                        <div className="pl-4">Status</div>
                        <div className="pl-4">Ações</div>
                      </div>
                    </div>
                    {/* Linhas verticais da tabela */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 bottom-0 left-[20%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[40%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[60%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[80%] w-px bg-[#EFF0FF]"></div>
                    </div>
                    <div className="divide-y divide-[#EFF0FF]">
                      {filtrarOrdens(ordens, filtroAtivo).map((ordem) => (
                        <div
                          key={ordem.id}
                          className="px-3 sm:px-6 py-4 hover:bg-gray-50 min-w-[600px] sm:min-w-[800px]"
                        >
                          <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center">
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-0">
                              {ordem.chamado?.numeroChamado}
                            </div>
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4">
                              {formatarEndereco(ordem.chamado?.imovel)}
                            </div>
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4">
                              {formatarValor(ordem.chamado?.valorEstimado)}
                            </div>
                            <div className="pl-2 sm:pl-4">{getOrdemStatusBadge(ordem.status)}</div>
                            <div className="flex items-center justify-center pl-2 sm:pl-4">
                              <Button
                                className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold hover:opacity-80"
                                style={{ backgroundColor: '#F5F7FF', color: '#1766F9' }}
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
                  <div className="min-w-[500px] sm:min-w-[700px] relative">
                    <div className="bg-gray-50 px-3 sm:px-6 py-4 border-b border-[#EFF0FF]">
                      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm font-afacad font-bold text-black">
                        <div className="pl-0">Chamado</div>
                        <div className="pl-4">Condomínio</div>
                        <div className="pl-4">Status</div>
                        <div className="pl-4">Ações</div>
                      </div>
                    </div>
                    {/* Linhas verticais da tabela */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#EFF0FF]"></div>
                      <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[#EFF0FF]"></div>
                    </div>
                    <div className="divide-y divide-[#EFF0FF]">
                      {propostas.filter(p => !['PROPOSTA_ACEITA','CONTRAPROPOSTA_APROVADA'].includes(p.status)).slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="px-3 sm:px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[500px] sm:min-w-[700px]"
                          onClick={(e) => { e.stopPropagation(); setPropostaSelecionada(p); setMostrarContra(false); setContraMax(""); setContraPrazo(""); setContraJust(""); }}
                        >
                          <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-0">
                              {p.chamado?.numeroChamado}
                            </div>
                            <div className="font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4">
                              {formatarEndereco(p.chamado?.imovel)}
                            </div>
                            <div className="pl-2 sm:pl-4">{getPropostaStatusBadge(p.status)}</div>
                            <div className="flex items-center justify-center pl-2 sm:pl-4">
                              <div className="rounded-lg px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2" style={{ backgroundColor: '#F5F7FF', color: '#1766F9' }}>
                                <span>VER</span>
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

          {/* Mensagem de Sucesso */}
          {mostrarSucesso && (
            <div id="mensagem-sucesso" className="mt-6 mx-auto max-w-md">
              <div 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white font-afacad font-bold text-sm animate-pulse"
                style={{ backgroundColor: '#1F45FF' }}
              >
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Ordem de serviço criada com sucesso!</span>
              </div>
            </div>
          )}

          {/* Mensagem de Sucesso - Proposta Aceita */}
          {mostrarSucessoProposta && (
            <div id="mensagem-sucesso-proposta" className="mt-6 mx-auto max-w-lg">
              <div 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-afacad font-bold text-base shadow-lg"
                style={{ backgroundColor: '#1F45FF' }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#1F45FF]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Você aceitou a proposta com sucesso!</span>
              </div>
            </div>
          )}

          {/* Mensagem de Aviso - Proposta Recusada */}
          {mostrarRecusaProposta && (
            <div id="mensagem-recusa-proposta" className="mt-6 mx-auto max-w-4xl">
              <div 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-afacad font-bold text-base shadow-lg"
                style={{ backgroundColor: '#FF6B8A' }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#FF6B8A]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Não foi possível aceitar a proposta. Ela não está mais disponível ou já foi aceita por outro prestador</span>
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {mostrarErro && (
            <div id="mensagem-erro" className="mt-6 mx-auto max-w-2xl">
              <div 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white font-afacad font-bold text-sm animate-pulse"
                style={{ backgroundColor: '#FF6B8A' }}
              >
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{mensagemErro}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-8 right-8 z-50">
      <button className="w-16 h-16 bg-[#10A07B] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
        <WhatsappIcon />
      </button>
      </div>

      {/* Sidebar Nova OS */}
      {novaOsOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 sm:top-0 top-24"
            onClick={() => { setNovaOsOpen(false); setNovaDescricao(''); setNovaValor(''); setNovaPrazo(''); }}
          />
          
          {/* Sidebar */}
          <div className={`fixed right-0 bg-white/95 backdrop-blur-sm z-[70] transform transition-transform duration-300 ease-in-out ${novaOsOpen ? 'translate-x-0' : 'translate-x-full'} top-24 sm:top-0 h-[calc(100vh-6rem)] sm:h-full w-full sm:w-96 rounded-t-3xl sm:rounded-none sm:bg-white sm:shadow-2xl`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-afacad font-bold text-black">Nova OS avulsa</h2>
                <button
                  onClick={() => { setNovaOsOpen(false); setNovaDescricao(''); setNovaValor(''); setNovaPrazo(''); }}
                  className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#F5F7FF',
                    width: '64px',
                    height: '64px',
                    opacity: 1
                  }}
                >
                  <svg className="w-6 h-6 text-[#1F45FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-afacad font-bold text-black mb-2">
                      Descrição *
                    </label>
                    <textarea
                      value={novaDescricao}
                      onChange={(e) => setNovaDescricao(e.target.value)}
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad resize-none focus:outline-none focus:border-[#1F45FF] transition-colors"
                      rows={4}
                      placeholder="Descreva os detalhes da ordem de serviço..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-afacad font-bold text-black mb-2">
                      Valor acordado (R$)
                    </label>
                    <input
                      type="number"
                      value={novaValor}
                      onChange={(e) => setNovaValor(e.target.value)}
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:border-[#1F45FF] transition-colors"
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-afacad font-bold text-black mb-2">
                      Prazo (dias)
                    </label>
                    <input
                      type="number"
                      value={novaPrazo}
                      onChange={(e) => setNovaPrazo(e.target.value)}
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:border-[#1F45FF] transition-colors"
                      placeholder="Ex: 7"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <Button
                  onClick={criarNovaOs}
                  disabled={salvandoNova || !novaDescricao.trim()}
                  className="w-full text-white font-afacad font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#1F45FF'
                  }}
                >
                  {salvandoNova ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sidebar Atualizar Status */}
      {statusModal && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 sm:top-0 top-24"
            onClick={() => setStatusModal(null)}
          />
          
          {/* Sidebar */}
          <div className={`fixed right-0 bg-white/95 backdrop-blur-sm z-[70] transform transition-transform duration-300 ease-in-out ${statusModal ? 'translate-x-0' : 'translate-x-full'} top-24 sm:top-0 h-[calc(100vh-6rem)] sm:h-full w-full sm:w-96 rounded-t-3xl sm:rounded-none sm:bg-white sm:shadow-2xl`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-afacad font-bold text-black">Atualizar status</h2>
                <button
                  onClick={() => setStatusModal(null)}
                  className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#F5F7FF',
                    width: '64px',
                    height: '64px',
                    opacity: 1
                  }}
                >
                  <svg className="w-6 h-6 text-[#1F45FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-afacad font-bold text-black mb-2">
                      Status da ordem de serviço
                    </label>
                    <select
                      value={novoStatus}
                      onChange={(e) => setNovoStatus(e.target.value)}
                      className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:border-[#1F45FF] transition-colors"
                    >
                      <option value="EM_ANDAMENTO">Em andamento</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <Button
                  onClick={atualizarStatus}
                  disabled={salvandoStatus}
                  className="w-full text-white font-afacad font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#1F45FF'
                  }}
                >
                  {salvandoStatus ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    "Atualizar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Detalhes Proposta */}
      {propostaSelecionada && !mostrarContra && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={()=>setPropostaSelecionada(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl mx-4" onClick={(e)=>e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 sm:p-8 pb-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-afacad text-2xl sm:text-3xl font-bold text-black pr-4">Detalhes da proposta</h2>
                <button 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F5F7FF] flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                  onClick={()=>setPropostaSelecionada(null)}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1F45FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="font-afacad text-sm sm:text-base text-[#7F98BC] mb-6 sm:mb-8">
                Confira as informações antes de aceitar ou enviar uma contra proposta.
              </p>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-8 pb-4 sm:pb-8">
              <div className="space-y-4 sm:space-y-6 font-afacad">
                <div>
                  <div className="font-bold text-black text-sm sm:text-base mb-2">Chamado</div>
                  <div className="text-black text-sm sm:text-base">#{propostaSelecionada.chamado?.numeroChamado}</div>
                </div>
                <div>
                  <div className="font-bold text-black text-sm sm:text-base mb-2">Endereço de atendimento</div>
                  <div className="text-black text-sm sm:text-base break-words">{formatarEndereco(propostaSelecionada.chamado?.imovel)}</div>
                </div>
                <div>
                  <div className="font-bold text-black text-sm sm:text-base mb-2">Faixa sugerida pela Condy</div>
                  <div className="text-black text-sm sm:text-base">
                    {formatarValor(propostaSelecionada.precoSugeridoMin) || '-'} ~ {formatarValor(propostaSelecionada.precoSugeridoMax) || '-'} | Prazo: {propostaSelecionada.prazoSugerido || '-'} dias
                  </div>
                </div>
                {propostaSelecionada.contrapropostaPrecoMin || propostaSelecionada.contrapropostaPrecoMax ? (
                  <div>
                    <div className="font-bold text-black text-sm sm:text-base mb-2">Sua contraproposta</div>
                    <div className="text-black text-sm sm:text-base">
                      {formatarValor(propostaSelecionada.contrapropostaPrecoMin) || '-'} ~ {formatarValor(propostaSelecionada.contrapropostaPrecoMax) || '-'} | Prazo: {propostaSelecionada.contrapropostaPrazo || '-'} dias
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Footer com botões */}
            <div className="flex flex-col gap-4 p-4 sm:p-8 pt-0">
              {/* Layout Mobile: Botão Recusar sozinho */}
              <div className="flex sm:hidden">
                <Button 
                  className="bg-[#FF96A51A] text-[#FF6B8A] hover:bg-[#FF6B8A] hover:text-white font-afacad font-bold py-3 px-4 rounded-xl transition-colors w-full text-sm"
                  onClick={async ()=>{ 
                    const j = prompt('Motivo da recusa (opcional)') || ''; 
                    setSalvando(true); 
                    try { 
                      await apiPrestadorRecusarProposta(propostaSelecionada.id, j); 
                      await carregarPropostas(); 
                      setPropostaSelecionada(null);
                      setMostrarRecusaProposta(true);
                      // Scroll para a mensagem de recusa
                      setTimeout(() => {
                        const elemento = document.getElementById('mensagem-recusa-proposta');
                        if (elemento) {
                          elemento.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                        }
                      }, 100);
                      // Esconder mensagem após 5 segundos
                      setTimeout(() => setMostrarRecusaProposta(false), 5000);
                    } finally { 
                      setSalvando(false); 
                    } 
                  }}
                >
                  Recusar
                </Button>
              </div>

              {/* Layout Mobile: Dois botões juntos embaixo */}
              <div className="flex gap-2 sm:hidden">
                <Button 
                  className="bg-[#F5F7FF] text-[#1F45FF] hover:bg-[#1F45FF] hover:text-white font-afacad font-bold py-3 px-2 rounded-xl transition-colors flex-1 text-xs"
                  onClick={()=> setMostrarContra(true)}
                >
                  Fazer contraproposta
                </Button>
                <Button 
                  className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold py-3 px-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 flex-1 text-xs"
                  disabled={salvando} 
                  onClick={async ()=>{ 
                    const valor = window.prompt('Valor acordado (obrigatório)'); 
                    if (!valor) { return; } 
                    setSalvando(true); 
                    try { 
                      await apiPrestadorAceitarProposta(propostaSelecionada.id, valor); 
                      await carregarPropostas(); 
                      await carregarOrdens(); 
                      setPropostaSelecionada(null);
                      setMostrarSucessoProposta(true);
                      // Scroll para a mensagem de sucesso
                      setTimeout(() => {
                        const elemento = document.getElementById('mensagem-sucesso-proposta');
                        if (elemento) {
                          elemento.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                        }
                      }, 100);
                      // Esconder mensagem após 5 segundos
                      setTimeout(() => setMostrarSucessoProposta(false), 5000);
                    } finally { 
                      setSalvando(false); 
                    } 
                  }}
                >
                  {salvando ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Aceitando...
                    </>
                  ) : (
                    'Aceitar proposta'
                  )}
                </Button>
              </div>

              {/* Layout Desktop: Linha única */}
              <div className="hidden sm:flex sm:flex-row gap-4">
                <Button 
                  className="bg-[#FF96A51A] text-[#FF6B8A] hover:bg-[#FF6B8A] hover:text-white font-afacad font-bold py-3 px-6 rounded-xl transition-colors"
                  onClick={async ()=>{ 
                    const j = prompt('Motivo da recusa (opcional)') || ''; 
                    setSalvando(true); 
                    try { 
                      await apiPrestadorRecusarProposta(propostaSelecionada.id, j); 
                      await carregarPropostas(); 
                      setPropostaSelecionada(null);
                      setMostrarRecusaProposta(true);
                      // Scroll para a mensagem de recusa
                      setTimeout(() => {
                        const elemento = document.getElementById('mensagem-recusa-proposta');
                        if (elemento) {
                          elemento.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                        }
                      }, 100);
                      // Esconder mensagem após 5 segundos
                      setTimeout(() => setMostrarRecusaProposta(false), 5000);
                    } finally { 
                      setSalvando(false); 
                    } 
                  }}
                >
                  Recusar
                </Button>
                <div className="flex gap-3 ml-auto">
                  <Button 
                    className="bg-[#F5F7FF] text-[#1F45FF] hover:bg-[#1F45FF] hover:text-white font-afacad font-bold py-3 px-4 rounded-xl transition-colors"
                    onClick={()=> setMostrarContra(true)}
                  >
                    Fazer contraproposta
                  </Button>
                  <Button 
                    className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={salvando} 
                    onClick={async ()=>{ 
                      const valor = window.prompt('Valor acordado (obrigatório)'); 
                      if (!valor) { return; } 
                      setSalvando(true); 
                      try { 
                        await apiPrestadorAceitarProposta(propostaSelecionada.id, valor); 
                        await carregarPropostas(); 
                        await carregarOrdens(); 
                        setPropostaSelecionada(null);
                        setMostrarSucessoProposta(true);
                        // Scroll para a mensagem de sucesso
                        setTimeout(() => {
                          const elemento = document.getElementById('mensagem-sucesso-proposta');
                          if (elemento) {
                            elemento.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center' 
                            });
                          }
                        }, 100);
                        // Esconder mensagem após 5 segundos
                        setTimeout(() => setMostrarSucessoProposta(false), 5000);
                      } finally { 
                        setSalvando(false); 
                      } 
                    }}
                  >
                    {salvando ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aceitando...
                      </>
                    ) : (
                      'Aceitar proposta'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contraproposta */}
      {propostaSelecionada && mostrarContra && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={()=>setMostrarContra(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl mx-4" onClick={(e)=>e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 sm:p-6 pb-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-afacad text-xl sm:text-2xl font-bold text-black pr-4">Fazer contraproposta</h2>
                <button 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F5F7FF] flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                  onClick={()=>setMostrarContra(false)}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F45FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="font-afacad text-xs sm:text-sm text-[#7F98BC] mb-4 sm:mb-6">
                Envie sua contraproposta com valor e prazo personalizados.
              </p>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-3 sm:space-y-4 font-afacad">
                <div className="p-3 bg-[#F5F7FF] rounded-lg">
                  <p className="text-xs sm:text-sm text-[#1F45FF] font-bold">
                    Faixa sugerida: {formatarValor(propostaSelecionada.precoSugeridoMin) || '-'} ~ {formatarValor(propostaSelecionada.precoSugeridoMax) || '-'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-afacad font-bold text-black mb-1">Meu valor proposto</label>
                  <input 
                    className="w-full border-2 border-[#EFF0FF] rounded-lg px-3 py-2 font-afacad focus:outline-none focus:border-[#1F45FF] transition-colors text-xs sm:text-sm" 
                    value={contraMax} 
                    onChange={(e)=>setContraMax(e.target.value)} 
                    placeholder="Ex.: R$ 3.200,00" 
                  />
                  {contraMax && propostaSelecionada.precoSugeridoMin && Number(contraMax) < Number(propostaSelecionada.precoSugeridoMin) * 0.5 && (
                    <div className="text-xs text-red-600 mt-1 font-afacad">Valor abaixo de 50% do mínimo permitido.</div>
                  )}
                  {contraMax && propostaSelecionada.precoSugeridoMax && Number(contraMax) > Number(propostaSelecionada.precoSugeridoMax) && (
                    <div className="text-xs text-red-600 mt-1 font-afacad">Valor acima do máximo permitido.</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-afacad font-bold text-black mb-1">Prazo (dias)</label>
                  <input 
                    className="w-full border-2 border-[#EFF0FF] rounded-lg px-3 py-2 font-afacad focus:outline-none focus:border-[#1F45FF] transition-colors text-xs sm:text-sm" 
                    value={contraPrazo} 
                    onChange={(e)=>setContraPrazo(e.target.value)} 
                    placeholder="Ex.: 7 dias" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-afacad font-bold text-black mb-1">Observações (opcional)</label>
                  <textarea 
                    className="w-full border-2 border-[#EFF0FF] rounded-lg px-3 py-2 font-afacad resize-none focus:outline-none focus:border-[#1F45FF] transition-colors text-xs sm:text-sm" 
                    rows={3} 
                    value={contraJust} 
                    onChange={(e)=>setContraJust(e.target.value)}
                    placeholder="Adicione observações sobre sua proposta..."
                  />
                </div>
              </div>
            </div>

            {/* Footer com botões */}
            <div className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 pt-0">
              <Button 
                className="bg-[#FF96A51A] text-[#FF6B8A] hover:bg-[#FF6B8A] hover:text-white font-afacad font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                onClick={()=>setMostrarContra(false)}
              >
                Voltar
              </Button>
              <Button 
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 text-sm"
                disabled={salvando || (contraMax && propostaSelecionada.precoSugeridoMin && Number(contraMax) < Number(propostaSelecionada.precoSugeridoMin) * 0.5) || (contraMax && propostaSelecionada.precoSugeridoMax && Number(contraMax) > Number(propostaSelecionada.precoSugeridoMax))} 
                onClick={async ()=>{ 
                  setSalvando(true); 
                  try { 
                    await apiPrestadorContraproposta(propostaSelecionada.id, { 
                      precoMax: contraMax || undefined, 
                      prazo: contraPrazo ? Number(contraPrazo) : undefined, 
                      justificativa: contraJust || '' 
                    }); 
                    await carregarPropostas(); 
                  } finally { 
                    setSalvando(false); 
                    setMostrarContra(false); 
                    setPropostaSelecionada(null); 
                  } 
                }}
              >
                {salvando ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar contraproposta'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}