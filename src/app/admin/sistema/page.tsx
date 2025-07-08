"use client";

import { useState, useEffect } from 'react';
import { getSystemLogsAction } from '@/app/actions/admin';

export default function AdminSistemaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    api: 'operational',
    database: 'operational',
    whatsapp: 'degraded',
    storage: 'operational'
  });

  useEffect(() => {
    loadLogs();
    // Simular atualização de status em tempo real
    const interval = setInterval(() => {
      // Aqui faria chamadas reais para verificar status
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const response = await getSystemLogsAction();
    if (response.success && response.data) {
      setLogs(response.data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operacional';
      case 'degraded': return 'Degradado';
      case 'down': return 'Indisponível';
      default: return 'Desconhecido';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema e Monitoramento
              </h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                ADMIN
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={loadLogs}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Atualizar Logs
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Configurações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <a href="/admin" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
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
            <a href="/admin/sistema" className="border-b-2 border-red-500 py-4 px-1 text-sm font-medium text-gray-900">
              Sistema
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status Overview */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Status dos Serviços</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${getStatusColor(systemStatus.api)} rounded-full mr-3`}></div>
                <span className="text-sm font-medium text-gray-900">API Principal</span>
              </div>
              <span className="text-sm text-gray-600">{getStatusText(systemStatus.api)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${getStatusColor(systemStatus.database)} rounded-full mr-3`}></div>
                <span className="text-sm font-medium text-gray-900">Banco de Dados</span>
              </div>
              <span className="text-sm text-gray-600">{getStatusText(systemStatus.database)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${getStatusColor(systemStatus.whatsapp)} rounded-full mr-3`}></div>
                <span className="text-sm font-medium text-gray-900">WhatsApp API</span>
              </div>
              <span className="text-sm text-gray-600">{getStatusText(systemStatus.whatsapp)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${getStatusColor(systemStatus.storage)} rounded-full mr-3`}></div>
                <span className="text-sm font-medium text-gray-900">Armazenamento</span>
              </div>
              <span className="text-sm text-gray-600">{getStatusText(systemStatus.storage)}</span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Server Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Servidor</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-gray-900">15 dias, 3h 42m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU</span>
                <span className="text-sm font-medium text-gray-900">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Memória</span>
                <span className="text-sm font-medium text-gray-900">4.2GB / 8GB (52%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Disco</span>
                <span className="text-sm font-medium text-gray-900">120GB / 500GB (24%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Versão API</span>
                <span className="text-sm font-medium text-gray-900">v3.1.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ambiente</span>
                <span className="text-sm font-medium text-gray-900">Produção</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Limpar Cache</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Limpa cache da aplicação</span>
              </button>

              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Reiniciar Serviços</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Reinicia serviços do sistema</span>
              </button>

              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Backup Banco</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Executa backup do banco de dados</span>
              </button>

              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Testar Integrações</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Testa conectividade com APIs externas</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Logs do Sistema
              </h3>
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="all">Todos os níveis</option>
                  <option value="error">Apenas erros</option>
                  <option value="warning">Avisos e erros</option>
                  <option value="info">Info e acima</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Carregando logs...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {logs.map((log: any) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            {log.userId && <span>Usuário: {log.userId}</span>}
                            {log.action && <span>Ação: {log.action}</span>}
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Schedule */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Próxima Manutenção Programada
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Atualização de segurança agendada para Domingo, 28/01 às 02:00 (duração estimada: 2 horas)
              </p>
              <div className="mt-3">
                <button className="text-sm text-blue-800 hover:text-blue-600 font-medium">
                  Ver detalhes da manutenção →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}