'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getChamadoPublicoPorCodigo } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmptyStateIllustration } from '@/components/icons/EmptyStateIllustration';
import { Search } from 'lucide-react';

type StatusApi = 'NOVO' | 'A_CAMINHO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | string;

export default function ConsultaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams?.get('busca') ?? '';

  const [numeroChamado, setNumeroChamado] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [chamado, setChamado] = useState<any>(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(Boolean(initial));

  const getStatusColor = useCallback((status: StatusApi) => {
    switch (status) {
      case 'NOVO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'A_CAMINHO':
      case 'EM_ATENDIMENTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getStatusText = useCallback((status: StatusApi) => {
    switch (status) {
      case 'NOVO':
        return 'Novo';
      case 'A_CAMINHO':
        return 'A caminho';
      case 'EM_ATENDIMENTO':
        return 'Em atendimento';
      case 'CONCLUIDO':
        return 'Concluído';
      default:
        return String(status);
    }
  }, []);

  const buscarChamado = useCallback(async (code: string) => {
    setLoading(true);
    setError('');
    setChamado(null);

    try {
      const data = await getChamadoPublicoPorCodigo(code);
      if (!data) {
        setError('Nenhum chamado encontrado com esse código.');
      } else {
        setChamado(data);
      }
    } catch (e: any) {
      setError(e.message || 'Erro na consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initial) {
      setHasSearched(true);
      buscarChamado(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroChamado.trim()) return;

    const params = new URLSearchParams(window.location.search);
    params.set('busca', numeroChamado.trim());
    router.replace(`/visitante?${params.toString()}`);
    setHasSearched(true);
    buscarChamado(numeroChamado.trim());
  };

  const createdAt = useMemo(() => {
    if (!chamado?.createdAt) return null;
    try {
      return new Date(chamado.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [chamado?.createdAt]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={numeroChamado}
              onChange={(e) => setNumeroChamado(e.target.value)}
              placeholder="Buscar por código do chamado"
              className="w-full rounded-full border border-white bg-white/80 px-12 py-4 text-black placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            className="rounded-full bg-[#1F45FF] px-8 py-4 text-white hover:bg-[#1F45FF]/90"
            disabled={loading || !numeroChamado.trim()}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
        <img
          src="/3d_illustration.png"
          alt="Ilustração de Prédio"
          className="w-64 h-64 object-cover drop-shadow-xl"
        />
      </div>

      {!hasSearched && !chamado && !error && (
        <div className="flex flex-col items-center text-center gap-4 py-20">
          <EmptyStateIllustration />
          <h2 className="font-afacad text-2xl font-bold text-black">
            Busque por um chamado para visualizar os detalhes
          </h2>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center text-center gap-4 py-20">
          <EmptyStateIllustration />
          <h2 className="font-afacad text-2xl font-bold text-black">
            Nenhum chamado encontrado com esse código
          </h2>
          <p className="font-afacad text-base text-black">
            Verifique se digitou corretamente. Caso tenha dúvidas, fale com a Condy pelo WhatsApp.
          </p>
        </div>
      )}

      {chamado && (
        <div className="space-y-6">
          <div>
            <h2 className="font-afacad text-3xl font-bold text-black">
              Chamado encontrado
            </h2>
            <p className="font-afacad text-base text-black">
              Detalhes do chamado associado ao código
            </p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-white/30 px-6 py-4 border-b border-[#EFF0FF]">
              <div className="grid grid-cols-6 gap-4 text-sm font-afacad font-bold text-black">
                <div>Tipo do chamado</div>
                <div>Descrição</div>
                <div>Valor estimado</div>
                <div>Chamado</div>
                <div>Status do chamado</div>
                <div>Data de abertura</div>
              </div>
            </div>
            <div className="divide-y divide-[#EFF0FF]">
              <div className="px-6 py-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="font-afacad text-sm font-bold text-black">
                    {chamado.escopo ?? '-'}
                  </div>
                  <div className="font-afacad text-sm font-bold text-black">
                    {chamado.descricaoOcorrido ?? '-'}
                  </div>
                  <div className="font-afacad text-sm font-bold text-black">
                    {typeof chamado.valorEstimado === 'number'
                      ? `R$ ${Number(chamado.valorEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'Sem valor'}
                  </div>
                  <div className="font-afacad text-sm font-bold text-black">
                    {chamado.numeroChamado}
                  </div>
                  <div className="font-afacad text-sm font-bold text-black">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(chamado.status)}`}>
                      {getStatusText(chamado.status)}
                    </span>
                  </div>
                  <div className="font-afacad text-sm font-bold text-black">
                    {createdAt ?? '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}