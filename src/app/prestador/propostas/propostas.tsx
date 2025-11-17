'use client';

import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { apiPrestadorListPropostas } from '../../actions/propostas';
import { ModalDetalhesProposta } from './PropostaModals';

function formatarValor(valor: any) {
  const numero = Number(valor);
  if (isNaN(numero)) return '-';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export default function PropostasPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiPrestadorListPropostas();
    if (res.success) setItems(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className='relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8'>
      <div className='container relative z-10'>
        <div className='font-afacad text-2xl font-bold mb-4'>Propostas de serviços Condy</div>
        <div className='bg-white rounded-2xl shadow-sm w-full p-4 overflow-x-auto'>
          {loading ? (
            <div className='flex items-center justify-center min-h-[180px]'>
              <img src='/loading.gif' alt='Carregando...' className='w-12 h-12' />
            </div>
          ) : items.length === 0 ? (
            <div className='text-center text-[#7F98BC]'>Nenhuma proposta.</div>
          ) : (
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500'>
                  <th className='px-3 py-2'>Chamado</th>
                  <th className='px-3 py-2'>Cliente</th>
                  <th className='px-3 py-2'>Endereço</th>
                  <th className='px-3 py-2'>Valor</th>
                  <th className='px-3 py-2'></th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {items.map(p => (
                  <tr key={p.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 font-medium'>{p.chamado?.numeroChamado}</td>
                    <td className='px-3 py-2'>{p.chamado?.solicitante?.name || '-'}</td>
                    <td className='px-3 py-2'>{p.chamado?.imovel?.endereco || '-'}</td>
                    <td className='px-3 py-2'>
                      {formatarValor(p.precoMin)} a {formatarValor(p.precoMax)}
                    </td>
                    <td className='px-3 py-2'>
                      <Button size='sm' onClick={() => setSelected(p)}>
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <ModalDetalhesProposta proposta={selected} onClose={() => setSelected(null)} onSuccess={load} />}
    </div>
  );
}
