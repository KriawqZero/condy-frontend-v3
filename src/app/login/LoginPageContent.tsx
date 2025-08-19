"use client";

import Footer from "@/components/Footer";
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
        <div className="w-full lg:w-1/2 bg-white flex flex-col px-6 py-12 sm:px-10 lg:px-20">
          <header className="flex justify-start pt-8 sm:pt-10 px-6 sm:px-8">
            <img
              src="/horizontal_logo.svg"
              alt="Condy"
              className="h-8 md:h-10"
            />
          </header>

          <main className="flex flex-col items-start justify-center flex-grow px-6 sm:px-8 py-10">
            <div className="w-full max-w-md">
              <div className="text-start mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  Bem-vindo à Condy, sua nova central de gestão de manutenção.
                </h1>
                <p className="text-gray-600">
                  Gerencie chamados, acompanhe serviços e facilite a rotina do
                  seu condomínio ou empresa.
                </p>
              </div>

              <LoginForm />

              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <img
                      src="/svg/whatsapp_icon.svg"
                      alt="WhatsApp"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      Esqueceu sua senha ou email de cadastro?
                    </p>
                    <p className="text-sm text-gray-600">
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
                        className="w-7 h-7"
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

      <Footer />
    </div>
  );
}
