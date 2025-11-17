'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';
import { EmptyStateIllustration } from '@/components/icons/EmptyStateIllustration';
import { Chamado } from '@/types';

interface ChamadosSectionProps {
  chamados: Chamado[];
  chamadosFiltrados: Chamado[];
  termoBusca: string;
  onChangeTermoBusca: (value: string) => void;
  onClearBusca: () => void;
  loadingChamados: boolean;
  onSelectChamado: (chamado: Chamado) => void;
  onOpenProposta: (chamado: Chamado) => void;
  onOpenCreateUser: () => void;
  onOpenListUsers: () => void;
  onOpenCreateImovel: () => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'NOVO':
    case 'PENDENTE':
    case 'AGUARDANDO_TECNICO':
    case 'AGUARDANDO_ORCAMENTO':
    case 'AGUARDANDO_APROVACAO':
      return (
        <Badge className='bg-blue-50 text-blue-600 border-blue-200 px-3 py-1 text-xs font-medium rounded-full'>
          Pendente
        </Badge>
      );
    case 'A_CAMINHO':
    case 'EM_ATENDIMENTO':
    case 'EM_ANDAMENTO':
      return (
        <Badge className='bg-orange-50 text-orange-600 border-orange-200 px-3 py-1 text-xs font-medium rounded-full'>
          Em andamento
        </Badge>
      );
    case 'CONCLUIDO':
    case 'SERVICO_CONCLUIDO':
      return (
        <Badge className='bg-green-50 text-green-600 border-green-200 px-3 py-1 text-xs font-medium rounded-full'>
          Serviço concluído
        </Badge>
      );
    case 'CANCELADO':
      return (
        <Badge className='bg-red-50 text-red-600 border-red-200 px-3 py-1 text-xs font-medium rounded-full'>
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge className='bg-gray-50 text-gray-600 border-gray-200 px-3 py-1 text-xs font-medium rounded-full'>
          {status}
        </Badge>
      );
  }
}

function formatarValor(valor: unknown): string {
  const numero = Number(valor);

  if (!valor || Number.isNaN(numero)) {
    return 'Sem valor';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

export function ChamadosSection({
  chamados,
  chamadosFiltrados,
  termoBusca,
  onChangeTermoBusca,
  onClearBusca,
  loadingChamados,
  onSelectChamado,
  onOpenProposta,
  onOpenCreateUser,
  onOpenListUsers,
  onOpenCreateImovel,
}: ChamadosSectionProps) {
  const encontrouResultados = useMemo(() => chamadosFiltrados.length > 0, [chamadosFiltrados.length]);

  return (
    <div className='mb-8'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
        <div>
          <h2 className='font-afacad text-3xl font-bold text-black mb-1'>Lista de chamados</h2>
          <p className='font-afacad text-base text-black'>Acompanhe as últimas atualizações na plataforma</p>
        </div>
        <div className='flex flex-wrap items-center justify-start lg:justify-end gap-3'>
          <Button
            type='button'
            onClick={onOpenCreateUser}
            className='bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-6 py-3 h-12 rounded-xl shadow-lg'
          >
            Criar usuário
          </Button>
          <Button
            type='button'
            onClick={onOpenListUsers}
            className='bg-[#334155] hover:bg-[#1e293b] text-white font-afacad font-bold text-base px-6 py-3 h-12 rounded-xl shadow-lg'
          >
            Listar usuários
          </Button>
          <Button
            type='button'
            onClick={onOpenCreateImovel}
            className='bg-[#10A07B] hover:bg-[#0c7c5c] text-white font-afacad font-bold text-base px-6 py-3 h-12 rounded-xl shadow-lg'
          >
            Criar imóvel
          </Button>
          <Button className='bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-base px-8 py-3 h-12 rounded-xl shadow-lg'>
            Exportar dados
          </Button>
        </div>
      </div>

      <div className='mb-6'>
        <div className='relative max-w-md'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <input
            type='text'
            placeholder='Buscar por número, condomínio, tipo, status ou prestador...'
            value={termoBusca}
            onChange={event => onChangeTermoBusca(event.target.value)}
            className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] font-afacad text-sm'
          />
          {termoBusca && (
            <button onClick={onClearBusca} className='absolute inset-y-0 right-0 pr-3 flex items-center'>
              <svg
                className='h-5 w-5 text-gray-400 hover:text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>
        {termoBusca && (
          <p className='mt-2 text-sm text-gray-600 font-afacad'>
            {chamadosFiltrados.length} chamado(s) encontrado(s) para "{termoBusca}"
          </p>
        )}
      </div>

      {encontrouResultados ? (
        <div className='bg-white rounded-2xl shadow-sm w-full'>
          <div className='overflow-x-auto w-full'>
            <div className='min-w-[800px] relative'>
              <div className='bg-gray-50 px-3 sm:px-6 py-4 border-b border-[#EFF0FF]'>
                <div className='grid grid-cols-8 gap-2 sm:gap-4 text-xs sm:text-sm font-afacad font-bold text-black'>
                  <div className='pl-0'>Tipo de chamado</div>
                  <div className='pl-4'>Ativo cadastrado</div>
                  <div className='pl-4'>Valor do serviço</div>
                  <div className='pl-4'>Prestador vinculado</div>
                  <div className='pl-4'>Observações gerais</div>
                  <div className='pl-4'>Chamado</div>
                  <div className='pl-4'>Status do chamado</div>
                  <div className='pl-4'>Ações</div>
                </div>
              </div>
              <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute top-0 bottom-0 left-[12.5%] w-px bg-[#EFF0FF]' />
                <div className='absolute top-0 bottom-0 left-[25%] w-px bg-[#EFF0FF]' />
                <div className='absolute top-0 bottom-0 left-[37.5%] w-px bg-[#EFF0FF]' />
                <div className='absolute top-0 bottom-0 left-[50%] w-px bg-[#EFF0FF]' />
                <div className='absolute top-0 bottom-0 left-[62.5%] w-px bg-[#EFF0FF]' />
                <div className='absolute top-0 bottom-0 left-[75%] w-px bg-[#EFF0FF]' />
                <div className='absolute top-0 bottom-0 left-[87.5%] w-px bg-[#EFF0FF]' />
              </div>

              <div className='divide-y divide-[#EFF0FF]'>
                {chamadosFiltrados.map(chamado => (
                  <div
                    key={chamado.id}
                    className='px-3 sm:px-6 py-4 hover:bg-gray-50 group cursor-pointer min-w-[800px]'
                    onClick={() => onSelectChamado(chamado)}
                  >
                    <div className='grid grid-cols-8 gap-2 sm:gap-4 items-center'>
                      <div className='font-afacad text-xs sm:text-sm font-bold text-black pl-0'>
                        {chamado.escopo === 'ORCAMENTO' ? 'Solicitação de orçamento' : 'Serviço imediato'}
                      </div>
                      <div className='font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4'>
                        {chamado.imovel?.nome || 'Sem ativo'}
                      </div>
                      <div
                        className={`font-afacad font-bold text-xs sm:text-sm pl-2 sm:pl-4 ${
                          Number(chamado.valorEstimado || 0) > 0 ? 'text-black' : 'text-black/50'
                        }`}
                      >
                        {Number(chamado.valorEstimado || 0) > 0 ? formatarValor(chamado.valorEstimado) : 'Sem valor'}
                      </div>
                      <div
                        className={`font-afacad font-bold text-xs sm:text-sm pl-2 sm:pl-4 ${
                          chamado.prestadorAssignadoId ? 'text-black' : 'text-black/50'
                        }`}
                      >
                        {chamado.prestadorAssignadoId ? chamado.prestadorAssignado?.name || 'N/D' : 'Sem prestador'}
                      </div>
                      <div className='font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4'>
                        {chamado.descricaoOcorrido || 'Sem descrição'}
                      </div>
                      <div className='font-afacad text-xs sm:text-sm font-bold text-black pl-2 sm:pl-4'>
                        {chamado.numeroChamado}
                      </div>
                      <div className='pl-2 sm:pl-4'>{getStatusBadge(chamado.status)}</div>
                      <div className='flex items-center justify-between pl-2 sm:pl-4'>
                        <div className='flex-1'>
                          {chamado.status === 'NOVO' ? (
                            <button
                              className='bg-[#1F45FF] hover:bg-[#1a3de6] text-white px-2 py-1 rounded-lg text-xs font-afacad font-bold transition-colors'
                              onClick={event => {
                                event.stopPropagation();
                                onOpenProposta(chamado);
                              }}
                            >
                              Proposta
                            </button>
                          ) : (
                            <div className='h-6' />
                          )}
                        </div>
                        <div className='w-6 h-6 rounded-full bg-[#F5F7FF] flex items-center justify-center ml-2'>
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
        <div className='flex flex-col items-center justify-center py-16'>
          <div className='text-center mt-6 max-w-md'>
            <h3 className='font-afacad text-2xl font-bold text-black mb-3'>Nenhum resultado encontrado</h3>
            <p className='font-afacad text-base text-gray-600 mb-4'>
              Não encontramos chamados que correspondam à sua busca por "{termoBusca}".
            </p>
            <Button
              onClick={onClearBusca}
              className='bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-sm px-6 py-2 rounded-lg'
            >
              Limpar busca
            </Button>
          </div>
        </div>
      ) : !loadingChamados && chamados.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16'>
          <EmptyStateIllustration />
          <div className='text-center mt-6 max-w-md'>
            <h3 className='font-afacad text-3xl font-bold text-black mb-3'>Painel Administrativo</h3>
            <p className='font-afacad text-base text-black mb-8'>
              Nenhum chamado encontrado no sistema.
              <br />
              Aguarde novas solicitações dos síndicos.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
