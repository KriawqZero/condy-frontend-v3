'use client';

import { Chamado } from '@/types';
import { User, FileText, Download, ZoomIn, X } from 'lucide-react';
import { CloseIcon } from '../icons/CloseIcon';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { useEffect } from 'react';
import { adminAssignPrestadorAction, adminListPrestadoresAction } from '@/app/actions/admin';
import { updateChamado } from '@/lib/api';

interface ModalVisualizarChamadoProps {
  chamado: Chamado;
  onClose: () => void;
  onUpdate?: () => void;
}

function getStatusBadge(status: Chamado['status']) {
  switch (status) {
    case 'NOVO':
      return <Badge className='bg-blue-50 text-blue-600 border-blue-200'>Novo chamado</Badge>;
    case 'A_CAMINHO':
      return <Badge className='bg-yellow-50 text-yellow-600 border-yellow-200'>A caminho</Badge>;
    case 'EM_ATENDIMENTO':
      return <Badge className='bg-orange-50 text-orange-600 border-orange-200'>Em atendimento</Badge>;
    case 'CONCLUIDO':
      return <Badge className='bg-green-50 text-green-600 border-green-200'>Concluído</Badge>;
  }
}

function formatarValor(valor: unknown, moeda: boolean = true): string {
  const numero = Number(valor);

  if (!valor || isNaN(numero)) {
    return 'Não definido';
  }

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  if (moeda) {
    options.style = 'currency';
    options.currency = 'BRL';
  } else {
    options.style = 'decimal';
  }

  return new Intl.NumberFormat('pt-BR', options).format(numero);
}

function formatarData(data: Date | string): string {
  const date = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// formatarDataSimples não utilizado no momento

export function ModalVisualizarChamado({ chamado, onClose, onUpdate }: ModalVisualizarChamadoProps) {
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);
  const [abrirVinculo, setAbrirVinculo] = useState(false);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [prestadorId, setPrestadorId] = useState<string>('');
  const [vinculandoPrestador, setVinculandoPrestador] = useState(false);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState(chamado.status);
  const [prioridade, setPrioridade] = useState(chamado.prioridade);
  const [valorEstimado, setValorEstimado] = useState(chamado.valorEstimado?.toString() || '');
  const [prestadorIdEdit, setPrestadorIdEdit] = useState(chamado.prestadorId || '');

  useEffect(() => {
    if (abrirVinculo) {
      adminListPrestadoresAction().then((r: any) => setPrestadores(r.data || []));
    }
  }, [abrirVinculo]);

  const handleVincularPrestador = async () => {
    if (!prestadorId) {
      alert('Selecione um prestador');
      return;
    }

    setVinculandoPrestador(true);
    try {
      const result = await adminAssignPrestadorAction(chamado.id, prestadorId);
      if (result.success) {
        alert('Prestador vinculado com sucesso!');
        setAbrirVinculo(false);
        onUpdate?.();
      } else {
        alert('Erro ao vincular prestador');
      }
    } catch (error) {
      console.error('Erro ao vincular prestador:', error);
      alert('Erro ao vincular prestador');
    } finally {
      setVinculandoPrestador(false);
    }
  };

  const salvarAlteracoes = async () => {
    setSalvando(true);
    try {
      const updateData: any = {
        status,
        prioridade,
        prestadorId: prestadorIdEdit || undefined,
      };

      if (valorEstimado) {
        updateData.valorEstimado = parseFloat(valorEstimado);
      }

      await updateChamado(chamado.id, updateData);
      setEditando(false);
      onUpdate?.();
      alert('Chamado atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar chamado:', error);
      alert('Erro ao atualizar chamado: ' + (error.response?.data?.message || error.message));
    } finally {
      setSalvando(false);
    }
  };

  const abas = [
    { id: 'geral', label: 'Geral' },
    { id: 'servico', label: 'Serviço' },
    { id: 'anexos', label: 'Anexos' },
    { id: 'prestador', label: 'Prestador' },
  ];

  const tipoDescricao = chamado.escopo === 'ORCAMENTO' ? 'Solicitação de orçamento' : 'Manutenção preventiva';

  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const downloadAnexo = (url: string, title?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'anexo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Efeito para bloquear o scroll da página quando o modal estiver aberto
  useEffect(() => {
    // Adiciona a classe que bloqueia o scroll
    document.body.classList.add('overflow-hidden');

    // Função de limpeza que remove a classe quando o componente for desmontado
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-2 sm:p-4'>
        <div className='bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col'>
          {/* Header */}
          <div className='bg-white px-4 sm:px-6 py-4 sm:py-6'>
            <div className='flex items-start justify-between'>
              <div>
                <h2 className='text-2xl font-bold font-afacad text-black mb-1'>{tipoDescricao}</h2>
                <p className='text-gray-600 font-afacad'>
                  Chamado #{chamado.numeroChamado} — {chamado.imovel?.nome || 'Imóvel'}
                </p>
              </div>
              <button
                className='w-8 h-8 flex items-center justify-center bg-white rounded-full text-blue-600 border border-blue-600 hover:bg-gray-50 transition-colors'
                onClick={onClose}
              >
                <CloseIcon size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className='bg-white'>
              <h3 className='font-afacad text-lg font-bold text-black mb-2 px-6'>Detalhes do chamado</h3>
            </div>
            <div
              className='flex flex-row justify-start w-full px-6 py-3'
              style={{
                height: 'auto',
                minHeight: '75px',
                opacity: 1,
                position: 'relative',
              }}
            >
              <div className='inline-flex space-x-1 xs:space-x-2'>
                {abas.map(aba => (
                  <button
                    key={aba.id}
                    className={`px-2 xs:px-3 sm:px-6 py-1 xs:py-2 font-afacad font-semibold text-[10px] xs:text-xs sm:text-sm rounded-full transition-all min-w-[50px] xs:min-w-[70px] sm:min-w-[100px] text-center ${
                      abaAtiva === aba.id
                        ? 'bg-[#1F45FF] text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setAbaAtiva(aba.id)}
                  >
                    {aba.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='overflow-y-auto flex-grow'>
            <div className='p-4 sm:p-6'>
              {editando && (
                <div className='mb-6 sm:mb-8 p-4 sm:p-8 bg-white shadow-lg rounded-2xl'>
                  <h3 className='font-afacad text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6'>
                    Editar chamado
                  </h3>
                  <div className='grid grid-cols-1 gap-4 sm:gap-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                      <div>
                        <label className='block text-sm font-afacad text-gray-600 mb-1 sm:mb-2'>Status</label>
                        <div className='relative'>
                          <select
                            className='w-full appearance-none border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all bg-gray-50'
                            value={status}
                            onChange={e => setStatus(e.target.value as any)}
                          >
                            <option value='NOVO'>Novo</option>
                            <option value='A_CAMINHO'>A Caminho</option>
                            <option value='EM_ATENDIMENTO'>Em Atendimento</option>
                            <option value='CONCLUIDO'>Concluído</option>
                          </select>
                          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500'>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M19 9l-7 7-7-7'
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-afacad text-gray-600 mb-1 sm:mb-2'>Prioridade</label>
                        <div className='relative'>
                          <select
                            className='w-full appearance-none border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all bg-gray-50'
                            value={prioridade}
                            onChange={e => setPrioridade(e.target.value as any)}
                          >
                            <option value='BAIXA'>Baixa</option>
                            <option value='MEDIA'>Média</option>
                            <option value='ALTA'>Alta</option>
                          </select>
                          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500'>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M19 9l-7 7-7-7'
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-afacad text-gray-600 mb-1 sm:mb-2'>Prestador (CNPJ)</label>
                      <input
                        type='text'
                        className='w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all bg-gray-50'
                        placeholder='Digite o CNPJ do prestador'
                        value={prestadorIdEdit}
                        onChange={e => setPrestadorIdEdit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-afacad text-gray-600 mb-1 sm:mb-2'>Valor Estimado</label>
                      <input
                        type='number'
                        step='0.01'
                        className='w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all bg-gray-50'
                        placeholder='0.00'
                        value={valorEstimado}
                        onChange={e => setValorEstimado(e.target.value)}
                      />
                    </div>
                    <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6'>
                      <button
                        className='w-full sm:flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-gray-50 transition-all order-2 sm:order-1'
                        onClick={() => setEditando(false)}
                        disabled={salvando}
                      >
                        Cancelar
                      </button>
                      <button
                        className='w-full sm:flex-1 bg-[#1F45FF] text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-sm hover:shadow order-1 sm:order-2 mb-2 sm:mb-0'
                        onClick={salvarAlteracoes}
                        disabled={salvando}
                      >
                        {salvando ? 'Salvando...' : 'Salvar alterações'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA GERAL */}
              {abaAtiva === 'geral' && (
                <div className='pb-4'>
                  <h3 className='font-afacad text-lg font-bold text-black mb-4 sm:mb-6'>Dados gerais do chamado</h3>

                  <div className='space-y-4'>
                    <div className='flex flex-col sm:flex-row'>
                      <div className='w-full sm:w-1/2 space-y-4 sm:space-y-6 sm:pr-6 mb-4 sm:mb-0'>
                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Tipo de chamado</label>
                          <p className='text-black font-medium'>{tipoDescricao}</p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>
                            Imóvel e local do ativo
                          </label>
                          <p className='text-black font-medium'>
                            {chamado.imovel?.endereco || '...'}
                            {chamado.imovel?.numero && `, ${chamado.imovel.numero}`}
                          </p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Ativo cadastrado</label>
                          <p className='text-gray-400'>...</p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Status do chamado:</label>
                          <div>{getStatusBadge(chamado.status)}</div>
                        </div>
                      </div>

                      <div className='w-full sm:w-px h-px sm:h-auto bg-gray-200 my-3 sm:my-0 sm:mx-2'></div>

                      <div className='w-full sm:w-1/2 space-y-4 sm:space-y-6 sm:pl-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Prioridade</label>
                          <div className='flex items-center gap-2'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                chamado.prioridade === 'ALTA'
                                  ? 'bg-red-500'
                                  : chamado.prioridade === 'MEDIA'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                            />
                            <span className='text-black font-medium'>
                              {chamado.prioridade === 'ALTA'
                                ? 'Urgência'
                                : chamado.prioridade === 'MEDIA'
                                  ? 'Média'
                                  : 'Baixa'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Data de abertura</label>
                          <p className='text-black font-medium'>{formatarData(chamado.createdAt)}</p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Número do chamado</label>
                          <p className='text-black font-medium'>#{chamado.numeroChamado}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA SERVIÇO */}
              {abaAtiva === 'servico' && (
                <div className='pb-4'>
                  <h3 className='font-afacad text-lg font-bold text-black mb-4 sm:mb-6'>Informações sobre o serviço</h3>

                  <div className='space-y-4'>
                    <div className='flex flex-col sm:flex-row'>
                      <div className='w-full sm:w-1/2 space-y-4 sm:space-y-6 sm:pr-6 mb-4 sm:mb-0'>
                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Prestador vinculado</label>
                          <p className={`font-medium ${chamado.prestadorId ? 'text-black' : 'text-gray-400'}`}>
                            {chamado.prestadorId || 'Nenhum prestador alocado'}
                          </p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Valor do serviço</label>
                          <p className='text-black font-medium'>{formatarValor(chamado.valorEstimado)}</p>
                        </div>
                      </div>

                      <div className='w-full sm:w-px h-px sm:h-auto bg-gray-200 my-3 sm:my-0 sm:mx-2'></div>

                      <div className='w-full sm:w-1/2 space-y-4 sm:space-y-6 sm:pl-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Forma de pagamento</label>
                          <p className='text-gray-400'>...</p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Garantia adquirida</label>
                          <p className='text-gray-400'>...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA ANEXOS */}
              {abaAtiva === 'anexos' && (
                <div className='pb-4'>
                  <h3 className='font-afacad text-lg font-bold text-black mb-4 sm:mb-6'>Descrição e imagens</h3>

                  <div className='space-y-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-2'>
                        Descrição textual do ocorrido:
                      </label>
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <p className='text-black leading-relaxed'>{chamado.descricaoOcorrido}</p>
                        {chamado.informacoesAdicionais && (
                          <div className='mt-4 pt-4 border-t border-gray-200'>
                            <p className='text-sm font-medium text-gray-600 mb-1'>Informações adicionais:</p>
                            <p className='text-black'>{chamado.informacoesAdicionais}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-2'>
                        Anexos ({chamado.anexos?.length || 0}):
                      </label>

                      {chamado.anexos && chamado.anexos.length > 0 ? (
                        <div className='space-y-4'>
                          {/* Grid de Imagens */}
                          {chamado.anexos.filter(anexo => isImageFile(anexo.url)).length > 0 && (
                            <div>
                              <h4 className='font-afacad font-semibold text-black mb-3'>Imagens</h4>
                              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                                {chamado.anexos
                                  .filter(anexo => isImageFile(anexo.url))
                                  .map(anexo => (
                                    <div key={anexo.id} className='relative group cursor-pointer'>
                                      <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                                        <img
                                          src={anexo.url}
                                          alt={anexo.title || `Anexo ${anexo.id}`}
                                          className='w-full h-full object-cover transition-transform group-hover:scale-105'
                                          onClick={() => setImagemAmpliada(anexo.url)}
                                        />
                                      </div>

                                      {/* Overlay com ações */}
                                      <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                        <div className='flex gap-2'>
                                          <button
                                            onClick={() => setImagemAmpliada(anexo.url)}
                                            className='p-2 bg-white/90 rounded-full hover:bg-white transition-colors'
                                            title='Ampliar imagem'
                                          >
                                            <ZoomIn className='w-4 h-4 text-gray-700' />
                                          </button>
                                          <button
                                            onClick={() => downloadAnexo(anexo.url, anexo.title || `anexo-${anexo.id}`)}
                                            className='p-2 bg-white/90 rounded-full hover:bg-white transition-colors'
                                            title='Baixar imagem'
                                          >
                                            <Download className='w-4 h-4 text-gray-700' />
                                          </button>
                                        </div>
                                      </div>

                                      {anexo.title && (
                                        <p className='text-xs text-gray-600 mt-1 truncate'>{anexo.title}</p>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Lista de Outros Arquivos */}
                          {chamado.anexos.filter(anexo => !isImageFile(anexo.url)).length > 0 && (
                            <div>
                              <h4 className='font-afacad font-semibold text-black mb-3'>Outros arquivos</h4>
                              <div className='space-y-2'>
                                {chamado.anexos
                                  .filter(anexo => !isImageFile(anexo.url))
                                  .map(anexo => (
                                    <div
                                      key={anexo.id}
                                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                                    >
                                      <div className='flex items-center gap-3'>
                                        <FileText className='w-5 h-5 text-gray-500' />
                                        <div>
                                          <p className='font-medium text-sm text-black'>
                                            {anexo.title || `Anexo ${anexo.id}`}
                                          </p>
                                          <p className='text-xs text-gray-500'>
                                            Criado em {formatarData(anexo.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => downloadAnexo(anexo.url, anexo.title || `anexo-${anexo.id}`)}
                                        className='p-2 text-gray-500 hover:text-[#1F45FF] hover:bg-blue-50 rounded-lg transition-colors'
                                        title='Baixar arquivo'
                                      >
                                        <Download className='w-4 h-4' />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='bg-gray-50 rounded-lg p-8 text-center'>
                          <FileText className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                          <p className='text-gray-400'>Nenhum anexo disponível</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA PRESTADOR */}
              {abaAtiva === 'prestador' && (
                <div className='pb-4'>
                  <h3 className='font-afacad text-lg font-bold text-black mb-4 sm:mb-6'>Informações do prestador</h3>

                  {chamado.prestadorId ? (
                    <div className='bg-blue-50 rounded-xl p-6 border border-blue-200'>
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                          <User className='w-6 h-6 text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-afacad text-lg font-bold text-black'>{chamado.prestadorId}</h4>
                          <p className='text-sm text-blue-600 font-medium'>Prestador alocado</p>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Status:</label>
                          <p className='text-black font-medium'>Ativo no chamado</p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-600 mb-1'>Contato:</label>
                          <p className='text-gray-400'>...</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='bg-gray-50 rounded-xl p-8 text-center'>
                      <User className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h4 className='font-afacad text-lg font-bold text-gray-700 mb-2'>Nenhum prestador alocado</h4>
                      <p className='text-gray-500'>Aguardando a administração alocar um prestador para este chamado.</p>
                      <div className='mt-4'>
                        <button
                          className='px-6 py-3 bg-[#1F45FF] text-white rounded-lg font-afacad font-semibold hover:bg-[#1F45FF]/90 transition-colors shadow-md'
                          onClick={() => setAbrirVinculo(true)}
                        >
                          Vincular prestador
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Botões fixos */}
          <div className='px-6 py-4'>
            <div className='flex flex-col sm:flex-row gap-3 sm:justify-end'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <button className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-afacad font-semibold hover:bg-gray-300 transition-colors'>
                  Carregar Recibo / NF
                </button>
                {!editando ? (
                  <button
                    className='px-6 py-3 bg-[#1F45FF] text-white rounded-lg font-afacad font-semibold hover:bg-[#1F45FF]/90 transition-colors shadow-md'
                    onClick={() => setEditando(true)}
                  >
                    Atualizar chamado
                  </button>
                ) : (
                  <button
                    className='px-6 py-3 bg-green-600 text-white rounded-lg font-afacad font-semibold hover:bg-green-700 transition-colors shadow-md'
                    onClick={salvarAlteracoes}
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox para ampliar imagens */}
      {imagemAmpliada && (
        <div
          className='fixed inset-0 bg-black/80 flex items-center justify-center z-[100]'
          onClick={() => setImagemAmpliada(null)}
        >
          <div className='relative max-w-screen-lg max-h-screen-lg p-4'>
            <button
              onClick={() => setImagemAmpliada(null)}
              className='absolute -top-10 right-0 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors'
            >
              <CloseIcon size={24} />
            </button>
            <img
              src={imagemAmpliada}
              alt='Imagem ampliada'
              className='max-w-full max-h-full object-contain rounded-lg'
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal de Vinculação de Prestador */}
      {abrirVinculo && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='font-afacad text-xl font-bold text-black'>Vincular Prestador</h3>
                <button
                  onClick={() => setAbrirVinculo(false)}
                  className='w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors'
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block font-afacad text-sm font-bold text-black mb-2'>Selecione o prestador:</label>
                  <select
                    value={prestadorId}
                    onChange={e => setPrestadorId(e.target.value)}
                    className='w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad'
                  >
                    <option value=''>Selecione um prestador</option>
                    {prestadores.map(prestador => (
                      <option key={prestador.id} value={prestador.id}>
                        {prestador.name || prestador.email} - {prestador.cnpj || prestador.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    onClick={() => setAbrirVinculo(false)}
                    className='px-4 py-2 border-2 border-[#EFF0FF] rounded-xl text-black hover:bg-gray-50 font-afacad font-bold'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleVincularPrestador}
                    disabled={vinculandoPrestador || !prestadorId}
                    className='px-4 py-2 bg-[#1F45FF] text-white rounded-xl hover:bg-[#1F45FF]/90 font-afacad font-bold disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {vinculandoPrestador ? 'Vinculando...' : 'Vincular'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
