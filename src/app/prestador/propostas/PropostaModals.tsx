'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  apiPrestadorAceitarProposta,
  apiPrestadorRecusarProposta,
  apiPrestadorContraproposta,
} from '../../actions/propostas';

function formatarValor(valor: any) {
  const numero = Number(valor);
  if (isNaN(numero)) return '-';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function ModalDetalhesProposta({ proposta, onClose, onSuccess }: any) {
  const [recusarOpen, setRecusarOpen] = useState(false);
  const [contraOpen, setContraOpen] = useState(false);

  async function aceitar() {
    const r = await apiPrestadorAceitarProposta(proposta.id);
    if (r.success) {
      onClose();
      onSuccess();
    }
  }

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl'>
          <h2 className='text-2xl font-bold mb-6'>Detalhes da proposta</h2>

          <div className='space-y-4 mb-6'>
            <div>
              <h3 className='font-semibold mb-1'>Informações do cliente</h3>
              <p className='text-sm text-gray-600'>{proposta.chamado?.solicitante?.name || '-'}</p>
              <p className='text-sm text-gray-600'>{proposta.chamado?.imovel?.endereco || '-'}</p>
            </div>
            <div>
              <h3 className='font-semibold mb-1'>Informações da proposta</h3>
              <p className='text-sm text-gray-600'>Chamado {proposta.chamado?.numeroChamado || '-'}</p>
              <p className='text-sm text-gray-600'>
                Valor: {formatarValor(proposta.precoMin)} a {formatarValor(proposta.precoMax)}
              </p>
            </div>
          </div>

          <div className='flex flex-col-reverse sm:flex-row gap-2 justify-end'>
            <Button variant='destructive' onClick={() => setRecusarOpen(true)} className='sm:min-w-[150px]'>
              Recusar proposta
            </Button>
            <Button variant='secondary' onClick={() => setContraOpen(true)} className='sm:min-w-[150px]'>
              Fazer contraproposta
            </Button>
            <Button onClick={aceitar} className='bg-green-600 hover:bg-green-700 text-white sm:min-w-[150px]'>
              Aceitar proposta
            </Button>
          </div>
        </div>
      </div>

      {recusarOpen && (
        <ModalRecusarProposta
          propostaId={proposta.id}
          onClose={() => setRecusarOpen(false)}
          onSuccess={() => {
            setRecusarOpen(false);
            onClose();
            onSuccess();
          }}
        />
      )}
      {contraOpen && (
        <ModalContraproposta
          propostaId={proposta.id}
          onClose={() => setContraOpen(false)}
          onSuccess={() => {
            setContraOpen(false);
            onClose();
            onSuccess();
          }}
        />
      )}
    </>
  );
}

export function ModalRecusarProposta({ propostaId, onClose, onSuccess }: any) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviar() {
    setLoading(true);
    const r = await apiPrestadorRecusarProposta(propostaId, motivo);
    setLoading(false);
    if (r.success) {
      onSuccess();
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-xl'>
        <h2 className='text-xl font-bold mb-4'>Motivo da recusa</h2>
        <textarea
          className='w-full border rounded-md p-2 mb-4 min-h-[100px]'
          placeholder='Descreva o motivo'
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
        />
        <div className='flex flex-col-reverse sm:flex-row gap-2 justify-end'>
          <Button variant='secondary' onClick={onClose} className='sm:min-w-[120px]'>
            Cancelar
          </Button>
          <Button
            onClick={enviar}
            disabled={loading}
            className='bg-red-600 hover:bg-red-700 text-white sm:min-w-[150px]'
          >
            {loading ? 'Enviando...' : 'Recusar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ModalContraproposta({ propostaId, onClose, onSuccess }: any) {
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [prazo, setPrazo] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviar() {
    setLoading(true);
    const r = await apiPrestadorContraproposta(propostaId, {
      precoMin: precoMin || undefined,
      precoMax: precoMax || undefined,
      prazo: prazo ? Number(prazo) : undefined,
      justificativa,
    });
    setLoading(false);
    if (r.success) {
      onSuccess();
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-xl'>
        <h2 className='text-2xl font-bold mb-6'>Fazer contraproposta</h2>
        <div className='space-y-4'>
          <Input label='Valor mínimo' value={precoMin} onChange={e => setPrecoMin(e.target.value)} placeholder='R$' />
          <Input label='Valor máximo' value={precoMax} onChange={e => setPrecoMax(e.target.value)} placeholder='R$' />
          <Input
            label='Prazo em dias'
            value={prazo}
            onChange={e => setPrazo(e.target.value)}
            type='number'
            placeholder='Ex: 5'
          />
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Justificativa</label>
            <textarea
              className='w-full border rounded-md p-2 min-h-[80px]'
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
            />
          </div>
        </div>
        <div className='flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6'>
          <Button variant='secondary' onClick={onClose} className='sm:min-w-[120px]'>
            Voltar
          </Button>
          <Button
            onClick={enviar}
            disabled={loading}
            className='bg-indigo-600 hover:bg-indigo-700 text-white sm:min-w-[150px]'
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
