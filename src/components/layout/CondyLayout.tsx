import { User } from '@/types';
import { ReactNode } from 'react';
import Footer from '../Footer';
import CondyHeader from './CondyHeader';

interface CondyLayoutProps {
  children: ReactNode;
  user?: User;
  showFooter?: boolean;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  background?: 'white' | 'gray' | 'gradient';
  visitante?: boolean;
}

export default function CondyLayout({
  children,
  user,
  showFooter = true,
  title,
  background = 'gray',
  visitante = false,
}: CondyLayoutProps) {
  const getBackgroundClass = () => {
    switch (background) {
      case 'white':
        return 'bg-white';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100';
      default:
        return 'bg-gray-50';
    }
  };

  // getMaxWidthClass não utilizado por enquanto

  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()}`}>
      {/* Header */}
      <CondyHeader user={user} title={title} visitante={visitante} />

      <main className='relative flex-grow'>
        <div className='container mx-auto px-4 py-6 mt-0'>{children}</div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
