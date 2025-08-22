import CondyLayout from '@/components/layout/CondyLayout';
import ConsultaForm from './ConsultaForm';
import { Suspense } from 'react';

export default function VisitantePage() {
  return (
    <CondyLayout 
      title="Acompanhar chamado"
      showFooter={true}
      maxWidth="md"
      background="gradient"
      visitante={true}
    >

        <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="px-6 py-8">
            <Suspense fallback={<div className="text-black font-afacad">Carregando...</div>}>
              <ConsultaForm />
            </Suspense>
          </div>
        </div>
    </CondyLayout>
  );
}


