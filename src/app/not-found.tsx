'use client';

import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-white flex flex-col items-center justify-center px-4 py-6 sm:py-8'>
      {/* Logo */}
      <div className='mb-4 sm:mb-6 md:mb-8'>
        <Image src='/horizontal_logo.svg' alt='Condy' width={200} height={60} className='h-8 sm:h-10 md:h-12 w-auto' />
      </div>

      {/* 404 Illustration */}
      <div className='mb-4 sm:mb-6 md:mb-8 flex justify-center'>
        <Image
          src='/error_404.gif'
          alt='Erro 404 - Página não encontrada'
          width={400}
          height={300}
          className='w-full max-w-[280px] sm:max-w-xs md:max-w-md h-auto'
          priority
        />
      </div>

      {/* Error Message */}
      <div className='text-center max-w-xs sm:max-w-sm md:max-w-md mb-6 sm:mb-8 px-2'>
        <h1 className='font-afacad text-xl sm:text-2xl md:text-4xl font-bold text-black mb-2 sm:mb-3 md:mb-4'>
          Erro 404 - Página não encontrada
        </h1>
        <p className='font-afacad text-sm sm:text-base md:text-lg text-gray-600 mb-1 sm:mb-2'>
          Ops! Parece que você se perdeu no jogo.
        </p>
        <p className='font-afacad text-xs sm:text-sm md:text-base text-gray-500'>
          A página que você procura não existe ou foi movida.
        </p>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-center w-full max-w-xs sm:max-w-sm'>
        <Link href='/' className='w-full'>
          <Button className='w-full bg-[#1F45FF] hover:bg-[#1F45FF]/90 text-white font-afacad font-bold text-sm sm:text-base px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-lg transition-colors'>
            Voltar para o início
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className='mt-6 sm:mt-8 md:mt-12 text-center px-4'>
        <p className='font-afacad text-xs sm:text-sm text-gray-400 max-w-xs sm:max-w-sm mx-auto'>
          Se você acredita que isso é um erro, entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
}
