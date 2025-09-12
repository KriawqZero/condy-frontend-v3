"use client";

import LoginForm from "@/components/auth/LoginForm";
import Head from "next/head";
import { useState as _useState } from "react";

export default function LoginPageContent() {
  

  const handleWhatsAppClick = () => {
    const whatsappNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
    const message = encodeURIComponent(
      "Esqueci minha senha ou email de cadastro. Preciso de ajuda para acessar minha conta no sistema CONDY."
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex bg-white flex-col min-h-screen">
      <Head>
        <title>Condy - Login</title>
        <meta
          name="description"
          content="Acesse sua conta Condy para gerenciar seus condomínios de forma simples e inteligente."
        />
      </Head>

      <div className="flex flex-grow w-full overflow-auto">
        <div className="w-full lg:w-1/2 bg-white flex flex-col px-4 py-8 sm:px-10 lg:px-20">
          <header className="flex justify-center mb-6 md:justify-start md:mb-0 md:pt-8">
            <img
              src="/horizontal_logo.svg"
              alt="Condy"
              className="h-8 md:h-10"
            />
          </header>

          <main className="flex flex-col items-center md:items-start justify-center flex-grow px-2 sm:px-8 py-6 md:py-10">
            <div className="w-full max-w-md">
              <div className="text-center md:text-start mb-6">
                <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
                  Bem-vindo à Condy, sua nova central de gestão de manutenção.
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Gerencie chamados, acompanhe serviços e facilite a rotina do
                  seu condomínio ou empresa.
                </p>
              </div>

              <LoginForm />

              <div className="mt-6 md:mt-8 p-4 bg-[#F5F7FF] rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <img
                      src="/svg/whatsapp_icon.svg"
                      alt="WhatsApp"
                      className="w-5 h-5 md:w-6 md:h-6 filter invert brightness-0 invert"
                    />
                  </div>
                  <div className="ml-3 md:ml-4 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-800">
                      Esqueceu sua senha ou email de cadastro?
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Fale com a gente pelo WhatsApp
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleWhatsAppClick}
                      className="text-green-600 hover:text-green-700 focus:outline-none"
                    >
                      <img
                        src="/svg/arrow_right.svg"
                        alt="Seta para direita"
                        className="w-6 h-6 md:w-7 md:h-7"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <div className="hidden lg:flex lg:w-1/2 relative">
          <img
            src="/imagem_fundo.png"
            alt="Ambiente moderno de condomínio"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <footer className="bg-blue-600 py-4 md:py-6 text-white text-center">
        <div className="flex flex-col md:flex-row md:justify-center md:items-center md:space-x-8 items-center space-y-3 md:space-y-0">
          <img 
            src="/horizontal_logo_white.svg" 
            alt="Condy" 
            className="h-6" 
          />
          
          <div className="flex items-center justify-center text-xs">
            <img 
              src="/svg/incubadora_logo.svg" 
              alt="Incubadora" 
              className="h-5 mx-2" 
            />
          </div>
          
          <div className="flex items-center justify-center text-xs">
            <img 
              src="/logo_aceleradora.png" 
              alt="Aceleradora" 
              className="h-5 mx-2" 
            />
          </div>
        </div>
        
        <div className="text-xs text-white/80 mt-3 md:mt-4">
          Condy Tecnologia LTDA © 2025 <br />Todos os direitos reservados · CNPJ 60.185.344/0001-44
        </div>
      </footer>
    </div>
  );
}
