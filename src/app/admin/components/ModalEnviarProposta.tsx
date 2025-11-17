'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  adminDecidirContrapropostaAction,
  adminEnviarPropostasAction,
  adminListPrestadoresAction,
  adminListPropostasPorChamadoAction,
} from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Chamado } from '@/types';

interface ModalEnviarPropostaProps {
  chamado: Chamado;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalEnviarProposta({ chamado, onClose, onSuccess }: ModalEnviarPropostaProps) {
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [prestadoresSelecionados, setPrestadoresSelecionados] = useState<string[]>([]);
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  const [prazo, setPrazo] = useState<string>('');
  const [enviando, setEnviando] = useState(false);
  const [propostasChamado, setPropostasChamado] = useState<any[]>([]);
  const [valorAcordadoAdmin, setValorAcordadoAdmin] = useState<string>('');
  const [loadingListas, setLoadingListas] = useState(true);

  const carregouPrestadores = prestadores.length > 0;

  const fetchPrestadoresEPropostas = async () => {
    setLoadingListas(true);
    try {
      const [prestadoresResponse, propostasResponse] = await Promise.all([
        adminListPrestadoresAction(),
        adminListPropostasPorChamadoAction(Number(chamado.id)),
      ]);

      if (prestadoresResponse.success && prestadoresResponse.data) {
        setPrestadores(prestadoresResponse.data);
      } else {
        setPrestadores([]);
      }

      if (propostasResponse.success && propostasResponse.data) {
        setPropostasChamado(propostasResponse.data);
      } else {
        setPropostasChamado([]);
      }
    } catch {
      setPrestadores([]);
      setPropostasChamado([]);
    } finally {
      setLoadingListas(false);
    }
  };

  useEffect(() => {
    fetchPrestadoresEPropostas();
    setPrestadoresSelecionados([]);
    setPrecoMin('');
    setPrecoMax('');
    setPrazo('');
    setValorAcordadoAdmin('');
  }, [chamado.id]);

  const isFaixaInvalida = useMemo(
    () => !!precoMin && !!precoMax && Number(precoMin) > Number(precoMax),
    [precoMin, precoMax],
  );

  const handleEnviarPropostas = async () => {
    try {
      setEnviando(true);
      await adminEnviarPropostasAction({
        chamadoId: Number(chamado.id),
        prestadores: prestadoresSelecionados,
        precoMin: precoMin || undefined,
        precoMax: precoMax || undefined,
        prazo: prazo ? Number(prazo) : undefined,
      });
      await fetchPrestadoresEPropostas();
      setPrestadoresSelecionados([]);
      onSuccess();
    } finally {
      setEnviando(false);
    }
  };

  const handleDecisaoContraproposta = async (propostaId: number, acao: 'aprovar' | 'recusar') => {
    if (acao === 'aprovar' && !valorAcordadoAdmin) {
      alert('Informe o valor acordado');
      return;
    }

    if (acao === 'aprovar') {
      await adminDecidirContrapropostaAction(propostaId, 'aprovar', {
        // @ts-ignore
        valorAcordado: valorAcordadoAdmin,
      });
    } else {
      await adminDecidirContrapropostaAction(propostaId, 'recusar');
    }

    setValorAcordadoAdmin('');
    await fetchPrestadoresEPropostas();
    onSuccess();
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-2 sm:p-4' onClick={onClose}>
      <div
        className='bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col'
        onClick={event => event.stopPropagation()}
      >
        <div className='bg-white px-4 sm:px-6 py-4 sm:py-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-2xl font-bold font-afacad text-black mb-1'>Fazer proposta a prestador</h2>
              <p className='text-gray-600 font-afacad'>
                Chamado #{chamado.numeroChamado} — {chamado.imovel?.nome || 'Imóvel'}
              </p>
            </div>
            <button
              className='w-8 h-8 flex items-center justify-center bg-white rounded-full text-blue-600 border border-blue-600 hover:bg-gray-50 transition-colors'
              onClick={onClose}
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        <div className='overflow-y-auto flex-grow'>
          <div className='p-4 sm:p-6'>
            <div className='mb-6'>
              <h3 className='font-afacad text-lg font-bold text-black mb-4'>Selecione prestadores</h3>
              <div className='max-h-48 overflow-auto border border-gray-200 rounded-xl p-4 bg-gray-50'>
                {loadingListas && !carregouPrestadores ? (
                  <p className='text-sm text-gray-500 font-afacad'>Carregando prestadores...</p>
                ) : prestadores.length === 0 ? (
                  <p className='text-sm text-gray-500 font-afacad'>Nenhum prestador disponível.</p>
                ) : (
                  prestadores.map((prestador: any) => (
                    <label
                      key={prestador.id}
                      className='flex items-center gap-3 py-2 hover:bg-white rounded-lg px-2 transition-colors cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={prestadoresSelecionados.includes(prestador.id)}
                        onChange={event => {
                          const checked = event.target.checked;
                          setPrestadoresSelecionados(prev =>
                            checked ? [...prev, prestador.id] : prev.filter(id => id !== prestador.id),
                          );
                        }}
                        className='w-4 h-4 text-[#1F45FF] bg-gray-100 border-gray-300 rounded focus:ring-[#1F45FF] focus:ring-2'
                      />
                      <span className='font-afacad text-sm text-gray-700'>
                        {prestador.nomeFantasia || prestador.name} — {prestador.cpfCnpj}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6'>
              <div>
                <label className='block font-afacad text-sm font-bold text-black mb-2'>Preço sugerido (mínimo)</label>
                <input
                  className='w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all'
                  value={precoMin}
                  onChange={event => setPrecoMin(event.target.value)}
                  placeholder='R$ 0,00'
                />
                {isFaixaInvalida && (
                  <div className='text-xs text-red-500 mt-1 font-afacad'>Mínimo não pode ser maior que máximo.</div>
                )}
              </div>
              <div>
                <label className='block font-afacad text-sm font-bold text-black mb-2'>Preço sugerido (máximo)</label>
                <input
                  className='w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all'
                  value={precoMax}
                  onChange={event => setPrecoMax(event.target.value)}
                  placeholder='R$ 0,00'
                />
                {isFaixaInvalida && (
                  <div className='text-xs text-red-500 mt-1 font-afacad'>Máximo deve ser maior ou igual ao mínimo.</div>
                )}
              </div>
              <div>
                <label className='block font-afacad text-sm font-bold text-black mb-2'>Prazo (dias)</label>
                <input
                  className='w-full border-2 border-[#EFF0FF] rounded-xl px-4 py-3 font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF] transition-all'
                  value={prazo}
                  onChange={event => setPrazo(event.target.value)}
                  placeholder='Ex: 7 dias'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white px-4 sm:px-6 py-4 border-t border-gray-100'>
          <div className='flex flex-col sm:flex-row justify-end gap-3'>
            <Button
              className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-afacad font-semibold px-6 py-3 rounded-xl transition-all duration-200'
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className='bg-[#1F45FF] hover:bg-[#1a3de6] text-white font-afacad font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={enviando || prestadoresSelecionados.length === 0 || isFaixaInvalida}
              onClick={handleEnviarPropostas}
            >
              {enviando ? 'Enviando...' : 'Enviar propostas'}
            </Button>
          </div>
        </div>

        {propostasChamado.length > 0 && (
          <div className='border-t border-gray-100 bg-gray-50'>
            <div className='p-4 sm:p-6'>
              <h3 className='font-afacad text-lg font-bold text-black mb-4'>Propostas deste chamado</h3>
              <div className='space-y-3 max-h-64 overflow-auto'>
                {propostasChamado.map((proposta: any) => (
                  <div
                    key={proposta.id}
                    className='bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow'
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                      <div className='space-y-1'>
                        <div className='font-afacad text-sm text-gray-600'>
                          <span className='font-bold text-black'>Prestador:</span>{' '}
                          {proposta.prestador?.nomeFantasia || proposta.prestador?.name}
                        </div>
                        <div className='font-afacad text-sm text-gray-600'>
                          <span className='font-bold text-black'>Status:</span>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                              proposta.status === 'CONTRAPROPOSTA_ENVIADA'
                                ? 'bg-yellow-100 text-yellow-800'
                                : proposta.status === 'APROVADA'
                                  ? 'bg-green-100 text-green-800'
                                  : proposta.status === 'RECUSADA'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {proposta.status}
                          </span>
                        </div>
                        <div className='font-afacad text-sm text-gray-600'>
                          <span className='font-bold text-black'>Sugestão:</span> {proposta.precoSugeridoMin || '-'} ~{' '}
                          {proposta.precoSugeridoMax || '-'}
                        </div>
                        {(proposta.contrapropostaPrecoMin || proposta.contrapropostaPrecoMax) && (
                          <div className='font-afacad text-sm text-gray-600'>
                            <span className='font-bold text-black'>Contraproposta:</span>{' '}
                            {proposta.contrapropostaPrecoMin || '-'} ~ {proposta.contrapropostaPrecoMax || '-'} | Prazo:{' '}
                            {proposta.contrapropostaPrazo || '-'}
                          </div>
                        )}
                      </div>

                      {proposta.status === 'CONTRAPROPOSTA_ENVIADA' && (
                        <div className='flex flex-col sm:flex-row gap-2 lg:flex-shrink-0'>
                          <input
                            className='border-2 border-[#EFF0FF] rounded-xl px-3 py-2 text-sm font-afacad focus:outline-none focus:ring-1 focus:ring-[#1F45FF] focus:border-[#1F45FF]'
                            placeholder='Valor acordado'
                            value={valorAcordadoAdmin}
                            onChange={event => setValorAcordadoAdmin(event.target.value)}
                          />
                          <div className='flex gap-2'>
                            <Button
                              className='bg-green-600 hover:bg-green-700 text-white font-afacad font-semibold px-4 py-2 rounded-xl text-sm transition-all'
                              onClick={() => handleDecisaoContraproposta(proposta.id, 'aprovar')}
                            >
                              Aprovar
                            </Button>
                            <Button
                              className='bg-red-600 hover:bg-red-700 text-white font-afacad font-semibold px-4 py-2 rounded-xl text-sm transition-all'
                              onClick={() => handleDecisaoContraproposta(proposta.id, 'recusar')}
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
  );
}
