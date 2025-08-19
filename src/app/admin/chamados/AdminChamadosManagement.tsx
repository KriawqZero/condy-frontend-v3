"use client";

import { useState, useEffect } from 'react';
import { getAdminChamadosAction, updateChamadoAdminAction } from '@/app/actions/admin';
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { ClipboardTickIcon } from "@/components/icons/ClipboardClipIcon";
import { EmptyStateIllustration } from "@/components/icons/EmptyStateIllustration";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { StatisticsIcon } from "@/components/icons/StatisticsIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chamado, User } from "@/types";
import { useRouter } from "next/navigation";

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

export default function AdminChamadosManagement({ _user }: { _user: User }) {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loadingChamados, setLoadingChamados] = useState(true);
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadChamados();
  }, []);

  const loadChamados = async () => {
    setLoadingChamados(true);
    try {
      const response = await getAdminChamadosAction();
      if (response.success && response.data) {
        setChamados(response.data);
      } else {
        console.error('Erro ao carregar chamados:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    }
    setLoadingChamados(false);
  };

  const filteredChamados = chamados.filter(chamado => {
    const matchesFilter = filter === 'todos' || chamado.status === filter;
    const matchesSearch = chamado.numeroChamado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chamado.descricaoOcorrido?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSaveChanges = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChamado) return;

    const formData = new FormData(event.currentTarget);
    const updateData = {
      status: formData.get('status') as string,
      prioridade: formData.get('prioridade') as string,
      prestadorId: formData.get('prestadorId') as string,
      valorEstimado: formData.get('valorEstimado') ? parseFloat(formData.get('valorEstimado') as string) : undefined,
      observacoesInternas: formData.get('observacoesInternas') as string,
    };

    try {
      const response = await updateChamadoAdminAction(selectedChamado.id, updateData);
      if (response.success) {
        // Atualizar o chamado na lista local
        setChamados(chamados.map(c => 
          c.id === selectedChamado.id 
            ? { ...c, ...updateData }
            : c
        ));
        setSelectedChamado(null);
        // Recarregar dados para garantir sincronização
        loadChamados();
        alert('Chamado atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar chamado: ' + response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao salvar alterações');
    }
  };

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

  const activeTicketsCount = chamados.filter(
    (chamado) => chamado.status !== "CONCLUIDO"
  ).length;
  const completedTicketsCount = chamados.filter(
    (chamado) => chamado.status === "CONCLUIDO"
  ).length;
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
                    {chamados.length.toString()} chamados
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
                    {activeTicketsCount.toString()} pendentes
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

            {/* Chamados Concluídos */}
            <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <ClipboardTickIcon />
                </div>
                <div>
                  <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                    Chamados concluídos
                  </p>
                  <div className="font-afacad text-2xl font-bold text-black">
                    {completedTicketsCount.toString()} finalizados
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="font-afacad text-sm font-bold text-black">Filtrar por status:</label>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="border-2 border-[#EFF0FF] rounded-xl px-4 py-2 font-afacad bg-white"
                >
                  <option value="todos">Todos</option>
                  <option value="NOVO">Novo</option>
                  <option value="A_CAMINHO">A Caminho</option>
                  <option value="EM_ATENDIMENTO">Em Atendimento</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Buscar por número ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 border-[#EFF0FF] rounded-xl px-4 py-2 font-afacad w-80"
                />
                <Button
                  onClick={loadChamados}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-afacad font-bold text-base px-6 py-2 h-10 rounded-xl"
                >
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Tickets Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-afacad text-3xl font-bold text-black mb-1">
                  Gerenciar Todos os Chamados
                </h2>
                <p className="font-afacad text-base text-black">
                  Administre e edite todos os chamados do sistema ({filteredChamados.length} encontrados)
                </p>
              </div>
              <Button
                className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
                onClick={() => router.push('/admin')}
              >
                ← Voltar ao Dashboard
              </Button>
            </div>

            {filteredChamados.length > 0 ? (
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
                      {filteredChamados.map((chamado) => (
                        <div
                          key={chamado.id}
                          className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[800px]"
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
                              <button
                                onClick={() => setSelectedChamado(chamado)}
                                className="text-xs text-blue-600 font-bold hover:text-blue-800 mr-2"
                              >
                                EDITAR
                              </button>
                              <div className="w-6 h-6 rounded-full bg-[#F5F7FF] flex items-center justify-center">
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
                    Nenhum chamado encontrado
                  </h3>
                  <p className="font-afacad text-base text-black mb-8">
                    {searchTerm || filter !== 'todos' ? 
                      'Tente ajustar os filtros para encontrar chamados.' :
                      'Ainda não há chamados no sistema.'
                    }
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {selectedChamado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-afacad text-2xl font-bold text-black">
                  Editar Chamado {selectedChamado.numeroChamado}
                </h3>
                <button
                  onClick={() => setSelectedChamado(null)}
                  className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSaveChanges}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-afacad text-sm font-bold text-black mb-2">Status</label>
                    <select 
                      name="status"
                      defaultValue={selectedChamado.status}
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                    >
                      <option value="NOVO">Novo</option>
                      <option value="A_CAMINHO">A Caminho</option>
                      <option value="EM_ATENDIMENTO">Em Atendimento</option>
                      <option value="CONCLUIDO">Concluído</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-afacad text-sm font-bold text-black mb-2">Prioridade</label>
                    <select 
                      name="prioridade"
                      defaultValue={selectedChamado.prioridade}
                      className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                    >
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">Prestador (CNPJ)</label>
                  <input
                    type="text"
                    name="prestadorId"
                    defaultValue={selectedChamado.prestadorId || ''}
                    placeholder="Digite o CNPJ do prestador"
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  />
                </div>

                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">Valor Estimado</label>
                  <input
                    type="number"
                    step="0.01"
                    name="valorEstimado"
                    defaultValue={selectedChamado.valorEstimado && typeof selectedChamado.valorEstimado === 'number' ? selectedChamado.valorEstimado.toString() : ''}
                    placeholder="0.00"
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  />
                </div>

                <div>
                  <label className="block font-afacad text-sm font-bold text-black mb-2">Observações Internas</label>
                  <textarea
                    rows={3}
                    name="observacoesInternas"
                    placeholder="Observações visíveis apenas para administradores"
                    className="w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Button
                    type="button"
                    onClick={() => setSelectedChamado(null)}
                    className="px-6 py-3 border-2 border-[#EFF0FF] rounded-xl text-black hover:bg-gray-50 font-afacad font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 py-3 bg-[#1F45FF] text-white rounded-xl hover:bg-[#1F45FF]/90 font-afacad font-bold"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </div>
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