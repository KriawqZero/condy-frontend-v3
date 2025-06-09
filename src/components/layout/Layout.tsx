import { ReactNode } from 'react';
import { User } from '@/types';
import Header from './Header';
import Sidebar from './Sidebar';
import WhatsAppButton from '../WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
  user?: User;
  showSidebar?: boolean;
  title?: string;
}

export default function Layout({ 
  children, 
  user, 
  showSidebar = true, 
  title 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} title={title} />
      
      <div className="flex">
        {showSidebar && user && (
          <Sidebar user={user} />
        )}
        
        <main className={`flex-1 ${showSidebar && user ? 'ml-64' : ''}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      <WhatsAppButton />
    </div>
  );
} 