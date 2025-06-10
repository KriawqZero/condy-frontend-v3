'use client';

import { useState, useEffect } from 'react';
import { getChamadosAction } from '@/app/actions/chamados';
import { Chamado } from '@/types';

export default function ChamadosListSindico() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  useEffect(() => {
    const fetchChamados = async () => {
      try {
        setLoading(true);
        const result = await getChamadosAction();
        
        if (result.success) {
          setChamados(result.data);
        } else {
          setError(result.error || 'Erro ao carregar chamados');
        }
      } catch (err: any) {
        setError('Erro interno. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'NORMAL':
        return 'bg-blue-50 text-blue-700';
      case 'URGENCIA':
        return 'bg-yellow-50 text-yellow-700';
      case 'EMERGENCIA':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWhatsAppClick = (numero: string) => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999';
    const message = encodeURIComponent(`Olá! Gostaria de falar sobre o chamado ${numero}.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const chamadosFiltrados = filtroStatus === 'TODOS' 
    ? chamados 
    : chamados.filter(c => c.status === filtroStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <img src="/loading.gif" alt="Carregando" className="w-8 h-8 mr-3" />
        <span className="text-gray-600">Carregando chamados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'TODOS' ? 'Todos' : 
               status === 'ABERTO' ? 'Abertos' :
               status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Concluídos'}
              {status !== 'TODOS' && (
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  {chamados.filter(c => c.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de chamados */}
      {chamadosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 mb-4">
            {filtroStatus === 'TODOS' 
              ? 'Nenhum chamado encontrado' 
              : `Nenhum chamado ${filtroStatus.toLowerCase()} encontrado`}
          </div>
          <a
            href="/sindico/chamados/novo"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <img src="/svg/plus_icon.svg" alt="" className="w-4 h-4 mr-2" />
            Criar Primeiro Chamado
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {chamadosFiltrados.map((chamado) => (
            <div key={chamado.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Informações principais */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-lg font-bold text-blue-600">
                      {chamado.numero_chamado}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(chamado.status)}`}>
                      {chamado.status === 'ABERTO' ? 'Aberto' :
                       chamado.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Concluído'}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPrioridadeColor(chamado.prioridade)}`}>
                      {chamado.prioridade === 'NORMAL' ? 'Normal' :
                       chamado.prioridade === 'URGENCIA' ? 'Urgência' : 'Emergência'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {chamado.ativo?.descricao_ativo}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {chamado.descricao_ocorrido}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <img src="/svg/building_icon.svg" alt="" className="w-4 h-4 mr-1" />
                      {chamado.condominio?.nome_fantasia}
                    </div>
                    <div className="flex items-center">
                      <img src="/svg/location_pin.svg" alt="" className="w-4 h-4 mr-1" />
                      {chamado.ativo?.local_instalacao}
                    </div>
                    <div className="flex items-center">
                      <img src="/svg/calendar_icon.svg" alt="" className="w-4 h-4 mr-1" />
                      {formatDate(chamado.created_at)}
                    </div>
                  </div>

                  {chamado.valor && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Valor do Serviço:</span>
                        <span className="text-lg font-bold text-green-600">
                          R$ {chamado.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {chamado.prestador_info && (
                        <div className="text-xs text-green-700 mt-1">
                          Prestador: {chamado.prestador_info.nome_fantasia}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                  <button
                    onClick={() => handleWhatsAppClick(chamado.numero_chamado)}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <img src="/svg/whatsapp_icon.svg" alt="" className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                  
                  <a
                    href={`/sindico/chamados/${chamado.id}`}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Ver Detalhes
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 