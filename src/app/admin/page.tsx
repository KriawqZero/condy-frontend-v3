"use client";

import { useState, useEffect } from 'react';
import { getChamadosAction } from '@/app/actions/chamados';
import { getSystemStatsAction } from '@/app/actions/admin';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalChamados: 0,
    chamadosPendentes: 0,
    totalUsuarios: 0,
    totalCondominios: 0
  });
  const [recentChamados, setRecentChamados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas do sistema
      const statsResponse = await getSystemStatsAction();
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalChamados: statsResponse.data.totalChamados,
          chamadosPendentes: statsResponse.data.chamadosPendentes,
          totalUsuarios: statsResponse.data.totalUsuarios,
          totalCondominios: statsResponse.data.totalCondominios
        });
      }

      // Carregar chamados recentes
      const chamadosResponse = await getChamadosAction();
      if (chamadosResponse.success && chamadosResponse.data) {
        // Pegar os 3 chamados mais recentes
        const recent = chamadosResponse.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setRecentChamados(recent);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                ACESSO RESTRITO
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin do Sistema</span>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <a href="/admin" className="border-b-2 border-red-500 py-4 px-1 text-sm font-medium text-gray-900">
              Dashboard
            </a>
            <a href="/admin/chamados" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Chamados
            </a>
            <a href="/admin/usuarios" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Usuários
            </a>
            <a href="/admin/relatorios" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Relatórios
            </a>
            <a href="/admin/sistema" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Sistema
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Chamados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.totalChamados}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendentes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.chamadosPendentes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuários Ativos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.totalUsuarios.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Condomínios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.totalCondominios}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tickets */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Chamados Recentes
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Carregando...</p>
                  </div>
                ) : recentChamados.length > 0 ? (
                  recentChamados.map((chamado: any) => {
                    const getPrioridadeColor = (prioridade: string) => {
                      switch (prioridade) {
                        case 'ALTA': return { dot: 'bg-red-500', badge: 'bg-red-100 text-red-800', text: 'URGENTE' };
                        case 'MEDIA': return { dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800', text: 'MÉDIA' };
                        case 'BAIXA': return { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800', text: 'BAIXA' };
                        default: return { dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-800', text: 'N/A' };
                      }
                    };
                    
                    const statusColor = chamado.status === 'CONCLUIDO' ? 
                      { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800', text: 'CONCLUÍDO' } :
                      getPrioridadeColor(chamado.prioridade);
                    
                    const timeAgo = new Date(chamado.createdAt);
                    const now = new Date();
                    const diffMinutes = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60));
                    const timeText = diffMinutes < 60 ? `há ${diffMinutes} min` : 
                                   diffMinutes < 1440 ? `há ${Math.floor(diffMinutes / 60)}h` : 
                                   `há ${Math.floor(diffMinutes / 1440)} dias`;

                    return (
                      <div key={chamado.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 ${statusColor.dot} rounded-full mr-3`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {chamado.numeroChamado} - {chamado.descricaoOcorrido.substring(0, 30)}...
                            </p>
                            <p className="text-xs text-gray-600">
                              {chamado.imovel?.nome || 'Sem condomínio'} - {timeText}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs ${statusColor.badge} rounded-full`}>
                          {statusColor.text}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>Nenhum chamado recente encontrado</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <a href="/admin/chamados" className="text-sm font-medium text-red-600 hover:text-red-500">
                  Ver todos os chamados →
                </a>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Status do Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">API Principal</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operacional</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Banco de Dados</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operacional</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Notificações WhatsApp</span>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Lentidão</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">Upload de Arquivos</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operacional</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Manutenção Programada
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Sistema ficará indisponível por 30min hoje às 02:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}