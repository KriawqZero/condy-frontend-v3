import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import Layout from '@/components/layout/Layout';
import SindicoDashboard from './SindicoDashboard';

export default async function SindicoPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.user) {
    redirect('/login');
  }

  // Verificar se é síndico
  if (!['SINDICO_RESIDENTE', 'SINDICO_PROFISSIONAL'].includes(session.user.user_type)) {
    redirect('/login');
  }

  return (
    <Layout user={session.user} title="Dashboard do Síndico">
      <SindicoDashboard user={session.user} />
    </Layout>
  );
} 