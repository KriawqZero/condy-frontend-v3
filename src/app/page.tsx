import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <Layout showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mx-auto max-w-7xl px-4 pt-10 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">CONDY</span>{' '}
                    <span className="block text-blue-600 xl:inline">
                      Sistema de Gestão
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Plataforma completa para gestão condominial. Gerencie chamados, 
                    acompanhe serviços e mantenha tudo organizado em um só lugar.
                  </p>
                  
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/login">
                        <Button size="lg" className="w-full px-8 py-3">
                          Entrar no Sistema
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/consulta">
                        <Button variant="secondary" size="lg" className="w-full px-8 py-3">
                          Consultar Chamado
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full bg-gradient-to-r from-blue-400 to-blue-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold mb-2">Gestão Inteligente</h3>
                <p className="text-blue-100">Para condomínios modernos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                Funcionalidades
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Tudo que você precisa em um só lugar
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <div className="relative">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📞</div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Gestão de Chamados
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Abra, acompanhe e gerencie todos os chamados de manutenção 
                      do seu condomínio de forma organizada.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="relative">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔧</div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Controle de Ativos
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Registre e monitore todos os equipamentos e ativos 
                      do condomínio com códigos únicos.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="relative">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Acesso Mobile
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Acesse o sistema de qualquer dispositivo, 
                      a qualquer hora e em qualquer lugar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Pronto para começar?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Entre no sistema ou consulte o status do seu chamado
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="secondary" size="lg" className="px-8">
                  Fazer Login
                </Button>
              </Link>
              <Link href="/consulta">
                <Button variant="secondary" size="lg" className="px-8">
                  Consultar Chamado
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
