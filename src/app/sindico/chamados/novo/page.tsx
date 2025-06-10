import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CondyLayout from '@/components/layout/CondyLayout';
import CriarChamadoForm from './CriarChamadoForm';

export default async function NovoChamadoPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.user) {
    redirect('/login');
  }

  // Verificar se é síndico
  if (!['SINDICO_RESIDENTE', 'SINDICO_PROFISSIONAL'].includes(session.user.user_type)) {
    redirect('/login');
  }

  return (
    <CondyLayout 
      user={session.user} 
      title="Novo Chamado"
      maxWidth="lg"
      background="white"
    >
      <div className="space-y-6">
        {/* Header da página */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Abertura de Novo Chamado
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Preencha as informações abaixo para solicitar um serviço. 
            Ao final, você receberá um número de chamado e será contactado via WhatsApp.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <CriarChamadoForm />
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <img
                src="/svg/messages.svg"
                alt="Informação"
                className="w-6 h-6 text-white"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-800 mb-1">
                Como funciona?
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Seu chamado receberá um número único</li>
                <li>• Você será contactado via WhatsApp para confirmação</li>
                <li>• Acompanhe o status do serviço na tela "Meus Chamados"</li>
                <li>• Em caso de emergência, selecione a prioridade adequada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CondyLayout>
  );
} 