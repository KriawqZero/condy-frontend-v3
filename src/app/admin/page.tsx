import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CondyLayout from '@/components/layout/CondyLayout';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
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
      title="Painel Administrativo"
      maxWidth="full"
      showFooter={false}
    >
      <AdminDashboard user={session.user} />
    </CondyLayout>
  );
}