import { User } from '@/types';
import { logoutAction } from '@/app/actions/auth';
import { Button } from '../ui/Button';

interface HeaderProps {
  user?: User;
  title?: string;
}

export default function Header({ user, title }: HeaderProps) {
  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo e Título */}
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <h1 className='text-2xl font-bold text-blue-600'>CONDY</h1>
            </div>
            {title && (
              <div className='ml-4 pl-4 border-l border-gray-300'>
                <h2 className='text-lg font-medium text-gray-900'>{title}</h2>
              </div>
            )}
          </div>

          {/* Menu do usuário */}
          {user ? (
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <div className='text-sm'>
                  <p className='font-medium text-gray-900'>{user.name}</p>
                  <p className='text-gray-500 capitalize'>{user.userType.toLowerCase().replace('_', ' ')}</p>
                </div>
              </div>

              <form action={logoutAction}>
                <Button type='submit' variant='secondary' size='sm'>
                  Sair
                </Button>
              </form>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <a href='/login' className='text-blue-600 hover:text-blue-800'>
                Entrar
              </a>
              <a href='/register' className='text-blue-600 hover:text-blue-800'>
                Cadastrar
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
