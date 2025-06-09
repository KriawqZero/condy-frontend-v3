'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Mock data - em produção consultaria a API
const mockChamados = [
  {
    id: '1',
    numero_chamado: 'CH001',
    status: 'ABERTO',
    descricao: 'Portão automático não está funcionando',
    condominio: 'Condomínio Residencial Teste',
    endereco: 'Rua de Teste, 999 - São Paulo/SP',
    valor: null,
    prestador: null,
    garantia: false,
    observacao_prestador: null,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    numero_chamado: 'CH002',
    status: 'EM_ANDAMENTO',
    descricao: 'Vazamento na piscina',
    condominio: 'Condomínio Residencial Teste',
    endereco: 'Rua de Teste, 999 - São Paulo/SP',
    valor: 850.00,
    prestador: 'Hidráulica Silva',
    garantia: true,
    observacao_prestador: 'Peça em falta, aguardando fornecedor',
    created_at: '2024-01-10T14:30:00Z'
  }
];

export default function ConsultaForm() {
  const [numeroChamado, setNumeroChamado] = useState('');
  const [loading, setLoading] = useState(false);
  const [chamado, setChamado] = useState<any>(null);
  const [error, setError] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'Aberto';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CONCLUIDO':
        return 'Concluído';
      default:
        return status;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setChamado(null);

    try {
      // Simular busca na API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const encontrado = mockChamados.find(c => 
        c.numero_chamado.toLowerCase() === numeroChamado.toLowerCase()
      );

      if (encontrado) {
        setChamado(encontrado);
      } else {
        setError('Chamado não encontrado. Verifique o número e tente novamente.');
      }
    } catch (err) {
      setError('Erro na consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de busca */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Número do Chamado"
          type="text"
          value={numeroChamado}
          onChange={(e) => setNumeroChamado(e.target.value)}
          placeholder="Ex: CH001"
          required
        />
        
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading || !numeroChamado.trim()}
        >
          {loading ? 'Consultando...' : 'Consultar Chamado'}
        </Button>
      </form>

      {/* Resultado da busca */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {chamado && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Chamado {chamado.numero_chamado}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(chamado.status)}`}>
              {getStatusText(chamado.status)}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Descrição</h4>
              <p className="text-gray-700">{chamado.descricao}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">Condomínio</h4>
              <p className="text-gray-700">{chamado.condominio}</p>
              <p className="text-sm text-gray-600">{chamado.endereco}</p>
            </div>

            {chamado.valor && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Valor</h4>
                <p className="text-gray-700">R$ {chamado.valor.toFixed(2)}</p>
              </div>
            )}

            {chamado.prestador && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Prestador</h4>
                <p className="text-gray-700">{chamado.prestador}</p>
              </div>
            )}

            {chamado.garantia && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Garantia</h4>
                <p className="text-green-700 font-medium">✓ Serviço com garantia</p>
              </div>
            )}

            {chamado.observacao_prestador && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Observação do Prestador</h4>
                <p className="text-gray-700">{chamado.observacao_prestador}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-1">Data de Abertura</h4>
              <p className="text-gray-700">
                {new Date(chamado.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 