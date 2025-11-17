import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LoginPageContent from './LoginPageContent';

interface LoginPageProps {
  searchParams?: {
    logoutNotice?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Verificar se já está logado
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect('/sindico'); // Redirecionar para dashboard padrão
  }

  const logoutNotice = searchParams?.logoutNotice
    ? decodeURIComponent(searchParams.logoutNotice)
    : undefined;

  return <LoginPageContent logoutNotice={logoutNotice} />;
}
