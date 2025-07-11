import CondyLayout from '@/components/layout/CondyLayout';
import ConsultaForm from './ConsultaForm';

export default function ConsultaPage() {
  return (
    <CondyLayout 
      title="Consulta de Chamados"
      showSidebar={false}
      maxWidth="md"
      background="gradient"
    >
      <div className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Consulta de Chamados
          </h1>
          <p className="text-lg text-gray-600">
            Digite o número do chamado para consultar o status do seu serviço
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-6 py-8">
            <ConsultaForm />
          </div>
        </div>

        {/* Informações de ajuda */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            O número do chamado é fornecido pelo síndico quando o serviço é solicitado.
          </p>
          <p className="text-sm text-gray-600">
            Problemas para encontrar seu chamado?{' '}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}?text=${encodeURIComponent('Olá! Preciso de ajuda para consultar um chamado no sistema CONDY.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Fale conosco no WhatsApp
            </a>
          </p>
        </div>
      </div>
    </CondyLayout>
  );
} 