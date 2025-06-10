'use client';

import { useState, useEffect } from 'react';
import { getChamadosAction } from '@/app/actions/chamados';
import { Chamado } from '@/types';

export default function AdminChamadosTable() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChamados = async () => {
      const result = await getChamadosAction();
      if (result.success) {
        setChamados(result.data);
      }
      setLoading(false);
    };

    fetchChamados();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <img src="/loading.gif" alt="Carregando" className="w-8 h-8 mx-auto mb-2" />
        Carregando chamados...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chamado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Síndico
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Condomínio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Serviço
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {chamados.map((chamado) => (
            <tr key={chamado.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-blue-600">
                  {chamado.numero_chamado}
                </div>
                <div className="text-xs text-gray-500">
                  {chamado.prioridade === 'EMERGENCIA' ? '🚨 Emergência' :
                   chamado.prioridade === 'URGENCIA' ? '⚠️ Urgência' : '📋 Normal'}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {chamado.sindico?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {chamado.sindico?.email}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {chamado.condominio?.nome_fantasia}
                </div>
                <div className="text-sm text-gray-500">
                  {chamado.condominio?.endereco}
                </div>
              </td>
              
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {chamado.ativo?.descricao_ativo}
                </div>
                <div className="text-sm text-gray-500">
                  {chamado.ativo?.local_instalacao}
                </div>
                <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                  {chamado.descricao_ocorrido}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  chamado.status === 'ABERTO' ? 'bg-blue-100 text-blue-800' :
                  chamado.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {chamado.status === 'ABERTO' ? 'Aberto' :
                   chamado.status === 'EM_ANDAMENTO' ? 'Em Andamento' :
                   'Concluído'}
                </span>
                {chamado.garantia && (
                  <div className="text-xs text-green-600 mt-1">✓ Garantia</div>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {chamado.valor ? (
                  <div className="text-sm font-medium text-green-600">
                    R$ {chamado.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
                {chamado.prestador_info && (
                  <div className="text-xs text-gray-500 mt-1">
                    {chamado.prestador_info.nome_fantasia}
                  </div>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  Editar
                </button>
                <button 
                  className="text-green-600 hover:text-green-900"
                  onClick={() => {
                    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999';
                    const message = encodeURIComponent(`Sobre o chamado ${chamado.numero_chamado}`);
                    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                  }}
                >
                  WhatsApp
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {chamados.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum chamado encontrado
        </div>
      )}
    </div>
  );
} 