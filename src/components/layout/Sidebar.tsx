'use client';

import { User } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface SidebarProps {
  user: User;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  // Navegação baseada no tipo de usuário
  const getNavItems = (): NavItem[] => {
    const _baseItems: NavItem[] = [];

    switch (user.user_type) {
      case 'SINDICO_RESIDENTE':
      case 'SINDICO_PROFISSIONAL':
        return [
          { name: 'Dashboard', href: '/sindico', icon: '🏠' },
          { name: 'Chamados', href: '/sindico/chamados', icon: '📞' },
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
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header da sidebar */}
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <h1 className="text-white text-xl font-bold">CONDY</h1>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  {
                    'bg-blue-100 text-blue-700': isActive,
                    'text-gray-700 hover:bg-gray-100 hover:text-gray-900': !isActive,
                  }
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer da sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-medium">{user.name}</p>
            <p className="capitalize">
              {user.user_type.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 