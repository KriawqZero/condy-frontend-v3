"use client";

import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";
import Head from "next/head";
import { useState } from "react";

export default function LoginPageContent() {
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLoginError, setHasLoginError] = useState(false);

  const handleShowError = (error: {
    errorTitle: string;
    errorMessage: string;
  }) => {
    setShowError(true);
    setErrorTitle(error.errorTitle);
    setErrorMessage(error.errorMessage);
    setHasLoginError(true);
  };

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
        <div className="w-full lg:w-1/2 bg-white flex flex-col m-20">
          <header className="flex justify-start pt-8 sm:pt-10 px-6 sm:px-8">
            <img
              src="/horizontal_logo.svg"
              alt="Condy"
              className="h-8 md:h-10"
            />
          </header>

          <main className="flex flex-col items-start justify-center flex-grow px-6 sm:px-8 py-10">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  Bem-vindo à Condy, sua nova central de gestão condominial.
                </h1>
                <p className="text-gray-600">
                  Gerencie chamados, acompanhe serviços e facilite a rotina do
                  seu condomínio.
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

      {/* Modal de erro }
      {showError && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="text-center">
              <img
                src="/horizontal_logo.svg"
                alt="Condy"
                className="h-8 mx-auto mb-6"
              />

              <div className="mb-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-red-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {errorTitle}
              </h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowError(false)}
                  className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Fechar
                </button>
                <button
                  onClick={() => setShowError(false)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )*/}
    </div>
  );
}
