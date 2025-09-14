"use client";

import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function Error500Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Image
          src="/horizontal_logo.svg"
          alt="Condy"
          width={200}
          height={60}
          className="h-10 sm:h-12 w-auto"
        />
      </div>

      {/* Error Illustration */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <Image
          src="/error_500.gif"
          alt="Erro 500 - Erro interno do servidor"
          width={400}
          height={300}
          className="w-full max-w-xs sm:max-w-md h-auto"
          priority
        />
      </div>

      {/* Error Message */}
      <div className="text-center max-w-sm sm:max-w-md mb-6 sm:mb-8 px-2">
        <h1 className="font-afacad text-2xl sm:text-4xl font-bold text-black mb-3 sm:mb-4">
          Erro 500 - Algo deu errado
        </h1>
        <p className="font-afacad text-base sm:text-lg text-gray-600 mb-2">
          Opa! Nossa plataforma deu um drible inesperado.
        </p>
        <p className="font-afacad text-sm sm:text-base text-gray-500">
          Estamos trabalhando para resolver isso o mais rápido possível.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none items-center">
        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-lg transition-colors">
            Tentar novamente
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-[#1F45FF] text-[#1F45FF] hover:bg-[#1F45FF] hover:text-white font-afacad font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-lg transition-colors"
          >
            Voltar ao início
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-8 sm:mt-12 text-center px-4">
        <p className="font-afacad text-xs sm:text-sm text-gray-400">
          Se o problema persistir, entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
}