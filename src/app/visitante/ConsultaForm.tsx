'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getChamadoPublicoPorCodigo } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';

type StatusApi = 'NOVO' | 'A_CAMINHO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | string;

export default function ConsultaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams?.get('busca') ?? '';

  const [numeroChamado, setNumeroChamado] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [chamado, setChamado] = useState<any>(null);
  const [error, setError] = useState('');

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Código do Chamado"
          type="text"
          value={numeroChamado}
          onChange={(e) => setNumeroChamado(e.target.value)}
          placeholder="Ex: CH-20250614-0001"
          required
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !numeroChamado.trim()}
        >
          {loading ? 'Consultando...' : 'Consultar Chamado'}
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {chamado && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Chamado {chamado.numeroChamado}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(chamado.status)}`}>
              {getStatusText(chamado.status)}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Descrição</h4>
              <p className="text-gray-700">{chamado.descricaoOcorrido}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">Condomínio</h4>
              <p className="text-gray-700">{chamado?.imovel?.nome}</p>
            </div>

            {typeof chamado.valorEstimado === 'string' || typeof chamado.valorEstimado === 'number' ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Valor estimado</h4>
                <p className="text-gray-700">R$ {Number(chamado.valorEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            ) : null}

            <div>
              <h4 className="font-medium text-gray-900 mb-1">Data de abertura</h4>
              <p className="text-gray-700">{createdAt ?? '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}