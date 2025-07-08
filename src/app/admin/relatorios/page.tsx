"use client";

import { useState, useEffect } from 'react';
import { getSystemStatsAction } from '@/app/actions/admin';

export default function AdminRelatoriosPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    const response = await getSystemStatsAction();
    if (response.success && response.data) {
      setStats(response.data);
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
                Relatórios e Analytics
              </h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                ADMIN
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Exportar Relatório
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
            <a href="/admin/relatorios" className="border-b-2 border-red-500 py-4 px-1 text-sm font-medium text-gray-900">
              Relatórios
            </a>
            <a href="/admin/sistema" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Sistema
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio Resolução</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.mediaTempoResolucao || 0}h
                </p>
                <p className="text-xs text-green-600">↓ 12% este mês</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfação Média</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.satisfacaoMedia || 0}/5
                </p>
                <p className="text-xs text-green-600">↑ 3% este mês</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ 125.4k
                </p>
                <p className="text-xs text-green-600">↑ 8% este mês</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                <p className="text-2xl font-semibold text-gray-900">
                  94.2%
                </p>
                <p className="text-xs text-green-600">↑ 2% este mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chamados por Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribuição de Chamados por Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Novos</span>
                </div>
                <span className="text-sm font-medium text-gray-900">23%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Em Andamento</span>
                </div>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Concluídos</span>
                </div>
                <span className="text-sm font-medium text-gray-900">32%</span>
              </div>
            </div>
          </div>

          {/* Top Prestadores */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Prestadores por Volume
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">TechService LTDA</p>
                  <p className="text-xs text-gray-500">CNPJ: 12.345.678/0001-90</p>
                </div>
                <span className="text-sm font-medium text-gray-900">42 chamados</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Manutenção Express</p>
                  <p className="text-xs text-gray-500">CNPJ: 98.765.432/0001-10</p>
                </div>
                <span className="text-sm font-medium text-gray-900">38 chamados</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">ServiComp Solutions</p>
                  <p className="text-xs text-gray-500">CNPJ: 11.222.333/0001-44</p>
                </div>
                <span className="text-sm font-medium text-gray-900">29 chamados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Relatório de Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Performance por Condomínio
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Condomínio Aurora</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Excelente</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Residencial Vista</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Bom</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Edifício Flores</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Precisa Atenção</span>
              </div>
            </div>
            <button className="mt-4 w-full text-center text-sm text-red-600 hover:text-red-700 font-medium">
              Ver relatório completo →
            </button>
          </div>

          {/* Relatório Financeiro */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Receita Total</span>
                <span className="text-sm font-medium text-gray-900">R$ 125.450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Comissões Pagas</span>
                <span className="text-sm font-medium text-gray-900">R$ 18.720</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lucro Líquido</span>
                <span className="text-sm font-medium text-green-600">R$ 106.730</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Margem</span>
                <span className="text-sm font-medium text-gray-900">85.1%</span>
              </div>
            </div>
            <button className="mt-4 w-full text-center text-sm text-red-600 hover:text-red-700 font-medium">
              Exportar relatório financeiro →
            </button>
          </div>

          {/* Relatório de Usuários */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Atividade de Usuários
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Novos Usuários</span>
                <span className="text-sm font-medium text-gray-900">+127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuários Ativos</span>
                <span className="text-sm font-medium text-gray-900">1,285</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa Retenção</span>
                <span className="text-sm font-medium text-green-600">92.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sessões Médias</span>
                <span className="text-sm font-medium text-gray-900">2.4/dia</span>
              </div>
            </div>
            <button className="mt-4 w-full text-center text-sm text-red-600 hover:text-red-700 font-medium">
              Ver métricas detalhadas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}