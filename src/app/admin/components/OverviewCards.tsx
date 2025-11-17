'use client';

import { Card } from '@/components/ui/Card';
import { NoteIcon } from '@/components/icons/NoteIcon';
import { StatisticsIcon } from '@/components/icons/StatisticsIcon';

interface OverviewCardsProps {
  stats: {
    totalChamados: number;
    chamadosPendentes: number;
    totalCondominios: number;
  };
  urgentTicketsCount: number;
}

const UrgentIcon = () => (
  <svg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='15' cy='15' r='11.25' stroke='#1F45FF' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M15 7.5V15L20 17.5' stroke='#1F45FF' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M22.5 7.5L25 5' stroke='#1F45FF' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M25 10L27.5 10' stroke='#1F45FF' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const UsersSummaryIcon = () => (
  <svg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M20 26.25V23.75C20 22.4239 19.4732 21.1521 18.5355 20.2145C17.5979 19.2768 16.3261 18.75 15 18.75H7.5C6.17392 18.75 4.90215 19.2768 3.96447 20.2145C3.02678 21.1521 2.5 22.4239 2.5 23.75V26.25'
      stroke='#1F45FF'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.25 13.75C13.8714 13.75 16 11.6214 16 9C16 6.37858 13.8714 4.25 11.25 4.25C8.62858 4.25 6.5 6.37858 6.5 9C6.5 11.6214 8.62858 13.75 11.25 13.75Z'
      stroke='#1F45FF'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M27.5 26.25V23.75C27.4996 22.7664 27.1751 21.8084 26.5743 21.0287C25.9735 20.2489 25.1307 19.6968 24.175 19.45'
      stroke='#1F45FF'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.825 4.45C19.7822 4.69558 20.6264 5.24739 21.2281 6.02731C21.8298 6.80723 22.1549 7.76592 22.1549 8.75C22.1549 9.73408 21.8298 10.6928 21.2281 11.4727C20.6264 12.2526 19.7822 12.8044 18.825 13.05'
      stroke='#1F45FF'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export function OverviewCards({ stats, urgentTicketsCount }: OverviewCardsProps) {
  return (
    <div className='container relative -mt-20 z-10'>
      <div className='relative'>
        <img
          src='/3d_illustration.png'
          alt='Ilustração 3D de prédio'
          className='w-[330px] h-[303px] opacity-100 absolute hidden md:block lg:block'
          style={{
            right: '0',
            top: '-280px',
            transform: 'rotate(0deg)',
          }}
        />
      </div>
      <div className='flex flex-wrap justify-start mb-8 sm:mb-10 md:mb-12 px-2 sm:pl-3'>
        <Card
          className='bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3'
          style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}
        >
          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center'>
              <StatisticsIcon />
            </div>
            <div>
              <p className='font-afacad text-sm font-bold text-[#7F98BC] mb-1'>Total Chamados</p>
              <div className='font-afacad text-2xl font-bold text-black'>{stats.totalChamados.toString()}</div>
            </div>
          </div>
        </Card>

        <Card
          className='bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3'
          style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}
        >
          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center'>
              <NoteIcon />
            </div>
            <div>
              <p className='font-afacad text-sm font-bold text-[#7F98BC] mb-1'>Pendentes</p>
              <div className='font-afacad text-2xl font-bold text-black'>{stats.chamadosPendentes.toString()}</div>
            </div>
          </div>
        </Card>

        <Card
          className='bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3'
          style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}
        >
          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center'>
              <UrgentIcon />
            </div>
            <div>
              <p className='font-afacad text-sm font-bold text-[#7F98BC] mb-1'>Urgentes</p>
              <div className='font-afacad text-2xl font-bold text-black'>{urgentTicketsCount.toString()}</div>
            </div>
          </div>
        </Card>

        <Card
          className='bg-white rounded-[20px] p-4 sm:p-6 shadow-xl border-0 hover:shadow-2xl transition-shadow w-[280px] sm:w-[300px] md:w-[320px] h-[90px] sm:h-[96px] opacity-100 mr-3 mb-3'
          style={{ transform: 'rotate(0deg)', borderRadius: '20px' }}
        >
          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#F5F7FF] flex items-center justify-center'>
              <UsersSummaryIcon />
            </div>
            <div>
              <p className='font-afacad text-sm font-bold text-[#7F98BC] mb-1'>Total condomínios</p>
              <div className='font-afacad text-2xl font-bold text-black'>{stats.totalCondominios.toString()}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
