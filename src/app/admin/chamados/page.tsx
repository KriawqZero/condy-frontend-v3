import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CondyLayout from '@/components/layout/CondyLayout';
import AdminChamadosTable from './AdminChamadosTable';

export default async function AdminChamadosPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.user) {
    redirect('/login');
  }

  // Verificar se é admin
  if (session.user.user_type !== 'ADMIN_PLATAFORMA') {
    redirect('/login');
  }

  return (
    <CondyLayout 
      user={session.user} 
      title="Gestão de Chamados"
      maxWidth="full"
      background="white"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Gestão de Chamados
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize, gerencie e exporte todos os chamados do sistema
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => {
                // TODO: Implementar exportação XLSX
                alert('Funcionalidade de exportação XLSX será implementada em breve');
              }}
            >
              <img src="/svg/excel_icon.svg" alt="" className="w-4 h-4 mr-2" />
              Exportar XLSX
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => window.location.reload()}
            >
              <img src="/svg/refresh_icon.svg" alt="" className="w-4 h-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <img src="/svg/clipboard_icon.svg" alt="" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Chamados</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <img src="/svg/clock_icon.svg" alt="" className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <img src="/svg/checkmark_success.svg" alt="" className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <img src="/svg/warning_icon.svg" alt="" className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emergências</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de chamados */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <AdminChamadosTable />
        </div>
      </div>
    </CondyLayout>
  );
} 