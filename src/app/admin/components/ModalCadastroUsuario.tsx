'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createUserAdminAction } from '@/app/actions/admin';
import { UserType } from '@/types';
import { UserPlus, X } from 'lucide-react';

interface ModalCadastroUsuarioProps {
  onClose: () => void;
  onSuccess: () => void;
}

const userTypeOptions: { value: UserType; label: string }[] = [
  { value: 'SINDICO_RESIDENTE', label: 'Síndico residente' },
  { value: 'SINDICO_PROFISSIONAL', label: 'Síndico profissional' },
  { value: 'EMPRESA', label: 'Empresa' },
  { value: 'PRESTADOR', label: 'Prestador' },
  { value: 'ADMIN_PLATAFORMA', label: 'Admin da plataforma' },
];

export function ModalCadastroUsuario({ onClose, onSuccess }: ModalCadastroUsuarioProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    whatsapp: '',
    userType: 'SINDICO_RESIDENTE' as UserType,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof formState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setFormState(prev => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formState.name || !formState.email || !formState.cpfCnpj || !formState.whatsapp || !formState.password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const response = await createUserAdminAction({
        name: formState.name,
        email: formState.email,
        cpfCnpj: formState.cpfCnpj,
        whatsapp: formState.whatsapp,
        userType: formState.userType,
        password: formState.password,
      });

      if (response.success) {
        setFormState({
          name: '',
          email: '',
          cpfCnpj: '',
          whatsapp: '',
          userType: 'SINDICO_RESIDENTE',
          password: '',
        });
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Não foi possível criar o usuário.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro inesperado ao criar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4'>
      <div className='bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-[#1F45FF]/10 flex items-center justify-center'>
              <UserPlus size={20} className='text-[#1F45FF]' />
            </div>
            <div>
              <h3 className='text-lg font-bold font-afacad text-black'>Cadastrar novo usuário</h3>
              <p className='text-sm text-gray-600'>Informe os dados básicos para cadastro manual</p>
            </div>
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors' type='button'>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            <div>
              <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>Nome completo *</label>
              <input
                type='text'
                value={formState.name}
                onChange={handleChange('name')}
                required
                className='w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100'
                placeholder='Ex: João da Silva'
              />
            </div>

            <div>
              <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>E-mail *</label>
              <input
                type='email'
                value={formState.email}
                onChange={handleChange('email')}
                required
                className='w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100'
                placeholder='email@exemplo.com'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>CPF/CNPJ *</label>
                <input
                  type='text'
                  value={formState.cpfCnpj}
                  onChange={handleChange('cpfCnpj')}
                  required
                  className='w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100'
                  placeholder='000.000.000-00'
                />
              </div>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>WhatsApp *</label>
                <input
                  type='text'
                  value={formState.whatsapp}
                  onChange={handleChange('whatsapp')}
                  required
                  className='w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100'
                  placeholder='(11) 99999-9999'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>Tipo de usuário *</label>
                <select
                  value={formState.userType}
                  onChange={handleChange('userType')}
                  className='w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white'
                >
                  {userTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>Senha temporária *</label>
                <input
                  type='password'
                  value={formState.password}
                  onChange={handleChange('password')}
                  required
                  className='w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100'
                  placeholder='Defina uma senha'
                />
              </div>
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors'
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='flex-1 bg-[#1F45FF] text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50'
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
