"use client";

import { logoutAction } from "@/app/actions/auth";
import { User } from "@/types";

interface CondyHeaderProps {
  user?: User;
  title?: string;
}

export default function CondyHeader({ user, title }: CondyHeaderProps) {
  const handleWhatsAppClick = () => {
    const whatsappNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
    const message = encodeURIComponent(
      "Olá! Preciso de ajuda com o sistema CONDY."
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src="/horizontal_logo.svg"
                alt="Condy"
                className="h-8 md:h-10"
              />
            </div>
            {title && (
              <div className="ml-4 pl-4 border-l border-gray-300">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              </div>
            )}
          </div>

          {/* Menu do usuário */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Botão WhatsApp */}
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                title="Falar no WhatsApp"
              >
                <img
                  src="/svg/whatsapp_icon.svg"
                  alt="WhatsApp"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Ajuda</span>
              </button>

              {/* Dados do usuário */}
              <div className="flex items-center space-x-2">
                <div className="text-sm text-right">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500 capitalize text-xs">
                    {user.userType.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </div>

              {/* Botão de logout */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Botão WhatsApp para visitantes */}
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                title="Falar no WhatsApp"
              >
                <img
                  src="/svg/whatsapp_icon.svg"
                  alt="WhatsApp"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Ajuda</span>
              </button>

              {/* Links para visitantes */}
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  Entrar
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="/consulta"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  Consultar Chamado
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
