import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CondyLayout from '@/components/layout/CondyLayout';
import AdminChamadosManagement from './AdminChamadosManagement';

export default async function AdminChamadosPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.user) {
    redirect('/login');
  }

  // Verificar se é admin
  if (session.user.userType !== 'ADMIN_PLATAFORMA') {
    redirect('/login');
  }

  return (
    <CondyLayout 
      user={session.user} 
      title="Gerenciamento de Chamados"
      maxWidth="full"
      showFooter={false}
    >
      <AdminChamadosManagement user={session.user} />
    </CondyLayout>
  );
}