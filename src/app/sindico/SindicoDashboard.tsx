"use client";

import { getChamadosAction } from "@/app/actions/chamados";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { ClipboardTickIcon } from "@/components/icons/ClipboardClipIcon";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { StatisticsIcon } from "@/components/icons/StatisticsIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chamado } from "@/types";
import { useEffect, useState } from "react";

const EmptyStateIllustration = () => (
  <div className="w-[148px] h-[140px] relative">
    <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-[#EFF0FF] to-[#DFE0F9] border-4 border-white shadow-lg relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-[98px] h-[97px] rounded-lg bg-gradient-to-br from-[#B5C0FF] to-[#5464DA] relative">
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-[43px] h-[17px] bg-gradient-to-r from-[#B1BDFF] to-[#7288FE] rounded-full"></div>
              <div className="w-[25px] h-[17px] bg-gradient-to-r from-[#B1BDFF] to-[#7288FE] rounded-full absolute top-0 left-2 rotate-90"></div>
            </div>
            <div className="absolute bottom-6 left-4 right-4">
              <div className="w-[62px] h-[14px] bg-white rounded mb-3"></div>
              <div className="flex items-center mb-2">
                <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                <div className="w-[47px] h-1 bg-white rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                <div className="w-[32px] h-1 bg-white rounded"></div>
              </div>
            </div>
          </div>
          <div className="absolute -top-5 -right-5 w-[34px] h-[34px] bg-[#0AA4E7] rounded-full border-3 border-white flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 3V11M3 7H11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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

export default function SindicoDashboard() {
  const [hasTickets, setHasTickets] = useState(true);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loadingChamados, setLoadingChamados] = useState(true);

  useEffect(() => {
    async function fetchChamados() {
      setLoadingChamados(true);
      const response = await getChamadosAction();
      if (response.success && response.data) {
        setChamados(response.data);
      } else {
        console.error("Erro ao buscar chamados:", response.error);
      }
      setLoadingChamados(false);
    }

    fetchChamados();
  }, []);

  const activeTicketsCount = chamados.filter(
    (chamado) => chamado.status !== "CONCLUIDO"
  ).length;
  const completedTicketsCount = chamados.filter(
    (chamado) => chamado.status === "CONCLUIDO"
  ).length;

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      {/* Cards sobrepostos ao header - Ajustado para ficar 50% dentro e 50% fora */}
      <div className="container relative -mt-20 z-10">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Invested */}
          <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <StatisticsIcon />
              </div>
              <div>
                <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                  Total investido
                </p>
                <div className="font-afacad text-2xl font-bold text-black">
                  <span className="text-base font-normal">R$</span> 7.400,00
                </div>
              </div>
            </div>
          </Card>

          {/* Active Tickets */}
          <Card className="bg-white rounded-[20px] p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <NoteIcon />
              </div>
              <div>
                <p className="font-afacad text-sm font-bold text-[#7F98BC] mb-1">
                  Chamados ativos
                </p>
                <div className="font-afacad text-2xl font-bold text-black">
                  {activeTicketsCount.toString().padStart(2, "0")} chamados
                </div>
              </div>
            </div>
          </Card>

          {/* Completed Tickets */}
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
                  {completedTicketsCount.toString().padStart(2, "0")}{" "}
                  finalizados
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
                Seus Chamados
              </h2>
              <p className="font-afacad text-base text-black">
                Acompanhe as últimas atualizações ou histórico dos seus pedidos
              </p>
            </div>
            <Button
              className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg"
              onClick={() => setHasTickets(!hasTickets)}
            >
              Novo chamado
            </Button>
          </div>

          {hasTickets ? (
            /* Tickets Table */
            <div className="bg-white rounded-2xl shadow-sm w-full">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[700px]">
                  {/* Table Header */}
                  <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
                    <div className="grid grid-cols-7 gap-4 text-sm font-afacad font-bold text-black">
                      <div>Tipo de chamado</div>
                      <div>Ativo cadastrado</div>
                      <div>Valor do serviço</div>
                      <div>Prestador vinculado</div>
                      <div>Observações gerais</div>
                      <div>Chamado</div>
                      <div>Status do chamado</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-[#EFF0FF]">
                    {chamados.map((chamado) => (
                      <div
                        key={chamado.id}
                        className="px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[700px]"
                      >
                        <div className="grid grid-cols-7 gap-4 items-center">
                          <div className="font-afacad text-sm font-bold text-black">
                            {chamado.escopo === "ORCAMENTO"
                              ? "Solicitação de orçamento"
                              : "Serviço imediato"}
                          </div>
                          <div className="font-afacad text-sm font-bold text-black">
                            {chamado.imovel?.endereco || "Sem endereço"}
                          </div>
                          <div className="font-afacad text-sm font-bold text-black text-black/50">
                            {"Não definido"} {/* valorEstimado vem separado? */}
                          </div>
                          <div className="font-afacad text-sm font-bold text-black text-black/50">
                            {"Sem prestador"}
                          </div>
                          <div className="font-afacad text-sm font-bold text-black">
                            {chamado.descricaoOcorrido}
                          </div>
                          <div className="font-afacad text-sm font-bold text-black">
                            {chamado.numeroChamado}
                          </div>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(chamado.status)}
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
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16">
              <EmptyStateIllustration />
              <div className="text-center mt-6 max-w-md">
                <h3 className="font-afacad text-3xl font-bold text-black mb-3">
                  Olá, Lucas Mezabarba
                </h3>
                <p className="font-afacad text-base text-black mb-8">
                  Você ainda não criou nenhum chamado.
                  <br />
                  Quando precisar, registre sua solicitação de forma rápida e
                  prática.
                </p>
                <Button
                  className="bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg w-full"
                  onClick={() => setHasTickets(true)}
                >
                  Novo chamado
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 bg-[#10A07B] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
          <WhatsappIcon />
        </button>
      </div>
    </div>
  );
}
