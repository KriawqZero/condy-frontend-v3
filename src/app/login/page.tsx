import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LoginPageContent from './LoginPageContent';

export default async function LoginPage() {
  // Verificar se já está logado
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect('/sindico'); // Redirecionar para dashboard padrão
  }

  return <LoginPageContent />;
}
