'use client';

import { User } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface CondySidebarProps {
  user: User;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export default function CondySidebar({ user }: CondySidebarProps) {
  const pathname = usePathname();

  // Navegação baseada no tipo de usuário
  const getNavItems = (): NavItem[] => {
    switch (user.user_type) {
      case 'SINDICO_RESIDENTE':
      case 'SINDICO_PROFISSIONAL':
        return [
          { name: 'Dashboard', href: '/sindico', icon: '🏠' },
          { name: 'Meus Chamados', href: '/sindico/chamados', icon: '📞' },
          { name: 'Novo Chamado', href: '/sindico/chamados/novo', icon: '➕' },
          { name: 'Imóveis', href: '/sindico/imoveis', icon: '🏢' },
          { name: 'Ativos', href: '/sindico/ativos', icon: '🔧' },
        ];

      case 'ADMIN_PLATAFORMA':
        return [
          { name: 'Dashboard', href: '/admin', icon: '📊' },
          { name: 'Todos os Chamados', href: '/admin/chamados', icon: '📞' },
          { name: 'Usuários', href: '/admin/usuarios', icon: '👥' },
          { name: 'Imóveis', href: '/admin/imoveis', icon: '🏢' },
          { name: 'Relatórios', href: '/admin/relatorios', icon: '📈' },
        ];

      case 'ADMIN_IMOVEIS':
        return [
          { name: 'Dashboard', href: '/admin-imoveis', icon: '🏠' },
          { name: 'Imóveis', href: '/admin-imoveis/imoveis', icon: '🏢' },
          { name: 'Ativos', href: '/admin-imoveis/ativos', icon: '🔧' },
          { name: 'Chamados', href: '/admin-imoveis/chamados', icon: '📞' },
        ];

      case 'PRESTADOR':
        return [
          { name: 'Dashboard', href: '/prestador', icon: '🛠️' },
          { name: 'Meus Serviços', href: '/prestador/servicos', icon: '📋' },
          { name: 'Agenda', href: '/prestador/agenda', icon: '📅' },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (navItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Header da sidebar */}
        <div className="flex items-center justify-center h-16 bg-blue-600 border-b border-blue-700">
          <img
            src="/horizontal_logo_white.svg"
            alt="Condy"
            className="h-8"
          />
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/sindico' && item.href !== '/admin' && 
               item.href !== '/admin-imoveis' && item.href !== '/prestador' && 
               pathname.startsWith(item.href + '/'));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  {
                    'bg-blue-50 text-blue-700 border border-blue-200': isActive,
                    'text-gray-700 hover:bg-gray-50 hover:text-gray-900': !isActive,
                  }
                )}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer da sidebar */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">{user.name}</p>
            <p className="capitalize">
              {user.user_type.toLowerCase().replace('_', ' ')}
            </p>
            <p className="mt-2 text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 