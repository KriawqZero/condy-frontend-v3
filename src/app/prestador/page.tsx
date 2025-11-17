import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CondyLayout from '@/components/layout/CondyLayout';
import PrestadorDashboard from './PrestadorDashboard';

export default async function PrestadorPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.user) {
    redirect('/login');
  }

  if (session.user.userType !== 'PRESTADOR') {
    redirect('/login');
  }

  return (
    <CondyLayout user={session.user} title='Dashboard' maxWidth='full' showFooter={false}>
      <PrestadorDashboard user={session.user} />
    </CondyLayout>
  );
}
