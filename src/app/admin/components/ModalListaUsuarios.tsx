'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { getAdminUsersAction, updateUserAdminAction } from '@/app/actions/admin';
import { User, UserType, UserStatus } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  FileWarning,
  Loader2,
  PauseCircle,
  RefreshCcw,
  Search,
  ShieldBan,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

const STATUS_DETAILS: Record<UserStatus, { label: string; bgClass: string; textClass: string; Icon: LucideIcon }> = {
  ATIVO: { label: 'Ativo', bgClass: 'bg-green-50', textClass: 'text-green-700', Icon: ShieldCheck },
  INATIVO: { label: 'Inativo', bgClass: 'bg-gray-100', textClass: 'text-gray-600', Icon: PauseCircle },
  BLOQUEADO: { label: 'Bloqueado', bgClass: 'bg-red-50', textClass: 'text-red-600', Icon: ShieldBan },
  PENDENTE: { label: 'Pendente', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', Icon: Clock },
  FALTA_DOCUMENTOS: {
    label: 'Documentação pendente',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    Icon: FileWarning,
  },
};

const STATUS_ORDER: UserStatus[] = ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE', 'FALTA_DOCUMENTOS'];

const statusOptions = STATUS_ORDER.map(value => ({
  value,
  label: STATUS_DETAILS[value].label,
}));

type AdminUserData = User & {
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
};

interface ModalListaUsuariosProps {
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

export function ModalListaUsuarios({ onClose, onSuccess }: ModalListaUsuariosProps) {
  const [usuarios, setUsuarios] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState<AdminUserData | null>(null);
  const [formEdicao, setFormEdicao] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpfCnpj: '',
    userType: 'SINDICO_RESIDENTE' as UserType,
  });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [mudandoStatus, setMudandoStatus] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsersAction();
      if (response.success && response.data) {
        setUsuarios(response.data);
      } else {
        setError(response.error || 'Não foi possível obter os usuários.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    if (!busca.trim()) return usuarios;
    const termo = busca.toLowerCase();
    return usuarios.filter(usuario => {
      return (
        usuario.name?.toLowerCase().includes(termo) ||
        usuario.email?.toLowerCase().includes(termo) ||
        usuario.cpfCnpj?.toLowerCase().includes(termo) ||
        usuario.whatsapp?.toLowerCase().includes(termo)
      );
    });
  }, [busca, usuarios]);

  const selecionarUsuario = (usuario: AdminUserData) => {
    setUsuarioEditando(usuario);
    setFormEdicao({
      name: usuario.name || '',
      email: usuario.email || '',
      whatsapp: usuario.whatsapp || '',
      cpfCnpj: usuario.cpfCnpj || '',
      userType: usuario.userType || 'SINDICO_RESIDENTE',
    });
  };

  const cancelarEdicao = () => {
    setUsuarioEditando(null);
    setFormEdicao({
      name: '',
      email: '',
      whatsapp: '',
      cpfCnpj: '',
      userType: 'SINDICO_RESIDENTE',
    });
  };

  const handleChangeEdicao =
    (campo: keyof typeof formEdicao) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setFormEdicao(prev => ({ ...prev, [campo]: value }));
    };

  const salvarEdicao = async () => {
    if (!usuarioEditando) return;
    setSalvandoEdicao(true);
    setError(null);
    try {
      const response = await updateUserAdminAction(usuarioEditando.id, {
        name: formEdicao.name,
        email: formEdicao.email,
        whatsapp: formEdicao.whatsapp,
        cpfCnpj: formEdicao.cpfCnpj,
        userType: formEdicao.userType,
      });

      if (response.success && response.data) {
        const usuarioAtualizado: AdminUserData = {
          ...usuarioEditando,
          ...response.data,
        };

        setUsuarios(prev => prev.map(usuario => (usuario.id === usuarioEditando.id ? usuarioAtualizado : usuario)));
        cancelarEdicao();
        onSuccess();
      } else {
        setError(response.error || 'Não foi possível salvar as alterações.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao salvar alterações.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const alterarStatus = async (usuario: AdminUserData, novoStatus: UserStatus) => {
    if (!usuario || usuario.status === novoStatus) {
      return;
    }

    setMudandoStatus(usuario.id);
    setError(null);

    try {
      const response = await updateUserAdminAction(usuario.id, {
        status: novoStatus,
      });

      if (response.success && response.data) {
        const statusAtualizado = (response.data.status as UserStatus | undefined) ?? novoStatus;
        const usuarioAtualizado: AdminUserData = {
          ...usuario,
          ...response.data,
          status: statusAtualizado,
        };

        setUsuarios(prev => prev.map(item => (item.id === usuario.id ? usuarioAtualizado : item)));
        onSuccess();
      } else {
        setError(response.error || 'Não foi possível atualizar o status do usuário.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao atualizar status.');
    } finally {
      setMudandoStatus(null);
    }
  };

  const recarregar = async () => {
    setGlobalLoading(true);
    await carregarUsuarios();
    setGlobalLoading(false);
  };

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4'>
      <div className='bg-white w-full max-w-6xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-[#1F45FF]/10 flex items-center justify-center'>
              <Users size={20} className='text-[#1F45FF]' />
            </div>
            <div>
              <h3 className='text-lg font-bold font-afacad text-black'>Gerenciar usuários</h3>
              <p className='text-sm text-gray-600'>Visualize, edite ou altere o status dos usuários da plataforma.</p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={recarregar}
              className='flex items-center gap-2 rounded-xl border border-[#1F45FF]/30 px-3 py-2 text-sm font-semibold text-[#1F45FF] hover:bg-[#1F45FF]/10 transition-colors'
              disabled={globalLoading}
              type='button'
            >
              {globalLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <RefreshCcw className='h-4 w-4' />}
              Atualizar
            </button>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors' type='button'>
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</div>
        )}

        <div className='mb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar por nome, e-mail, CPF/CNPJ ou WhatsApp'
              value={busca}
              onChange={event => setBusca(event.target.value)}
              className='w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 font-afacad text-sm focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/50'
            />
          </div>
          <p className='mt-2 text-xs text-gray-500 font-afacad'>{usuariosFiltrados.length} usuário(s) encontrado(s)</p>
        </div>

        <div className='flex-1 overflow-hidden'>
          <div className='h-full overflow-auto rounded-2xl border border-gray-100'>
            {loading ? (
              <div className='flex h-full items-center justify-center py-12 text-gray-500 font-afacad'>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Carregando usuários...
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center gap-2 py-12 text-gray-500 font-afacad'>
                <Users className='h-8 w-8 text-gray-400' />
                Nenhum usuário encontrado para o termo informado.
              </div>
            ) : (
              <table className='min-w-full divide-y divide-gray-100'>
                <thead className='bg-gray-50'>
                  <tr className='text-left text-xs font-bold text-gray-500 uppercase tracking-wider font-afacad'>
                    <th className='px-4 py-3'>Nome</th>
                    <th className='px-4 py-3'>E-mail</th>
                    <th className='px-4 py-3'>WhatsApp</th>
                    <th className='px-4 py-3'>CPF/CNPJ</th>
                    <th className='px-4 py-3'>Tipo</th>
                    <th className='px-4 py-3 text-center'>Status</th>
                    <th className='px-4 py-3 text-right'>Ações</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 text-sm font-afacad'>
                  {usuariosFiltrados.map(usuario => {
                    const statusAtual = (usuario.status ?? 'PENDENTE') as UserStatus;
                    const statusConfig = STATUS_DETAILS[statusAtual];
                    const StatusIcon = statusConfig.Icon;
                    const atualizandoStatus = mudandoStatus === usuario.id;

                    return (
                      <tr key={usuario.id} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-4 py-3 font-semibold text-gray-900'>{usuario.name}</td>
                        <td className='px-4 py-3 text-gray-600'>{usuario.email}</td>
                        <td className='px-4 py-3 text-gray-600'>{usuario.whatsapp || '-'}</td>
                        <td className='px-4 py-3 text-gray-600'>{usuario.cpfCnpj || '-'}</td>
                        <td className='px-4 py-3'>
                          <span className='inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1F45FF]'>
                            {usuario.userType.split('_').join(' ').toLowerCase()}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}
                          >
                            <StatusIcon className='h-3 w-3' />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex flex-wrap items-center justify-end gap-2'>
                            <div className='relative min-w-[190px]'>
                              <select
                                value={statusAtual}
                                onChange={event => alterarStatus(usuario, event.target.value as UserStatus)}
                                className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/40 ${
                                  atualizandoStatus ? 'cursor-not-allowed opacity-60' : ''
                                }`}
                                disabled={atualizandoStatus}
                              >
                                {statusOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {atualizandoStatus && (
                                <Loader2 className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#1F45FF]' />
                              )}
                            </div>
                            <button
                              type='button'
                              onClick={() => selecionarUsuario(usuario)}
                              className='rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors'
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {usuarioEditando && (
          <div className='mt-6 rounded-2xl border border-[#1F45FF]/20 bg-[#F8FAFF] p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h4 className='text-base font-bold font-afacad text-black'>Editar usuário</h4>
                <p className='text-sm text-gray-600'>Atualize os dados do usuário selecionado e salve as alterações.</p>
              </div>
              <button
                type='button'
                onClick={cancelarEdicao}
                className='text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors'
              >
                Cancelar edição
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>Nome completo</label>
                <input
                  type='text'
                  value={formEdicao.name}
                  onChange={handleChangeEdicao('name')}
                  className='w-full rounded-xl border border-[#1F45FF]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/40'
                />
              </div>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>E-mail</label>
                <input
                  type='email'
                  value={formEdicao.email}
                  onChange={handleChangeEdicao('email')}
                  className='w-full rounded-xl border border-[#1F45FF]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/40'
                />
              </div>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>WhatsApp</label>
                <input
                  type='text'
                  value={formEdicao.whatsapp}
                  onChange={handleChangeEdicao('whatsapp')}
                  className='w-full rounded-xl border border-[#1F45FF]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/40'
                />
              </div>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>CPF/CNPJ</label>
                <input
                  type='text'
                  value={formEdicao.cpfCnpj}
                  onChange={handleChangeEdicao('cpfCnpj')}
                  className='w-full rounded-xl border border-[#1F45FF]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/40'
                />
              </div>
              <div>
                <label className='block text-sm font-afacad text-[#1F45FF] mb-1'>Tipo de usuário</label>
                <select
                  value={formEdicao.userType}
                  onChange={handleChangeEdicao('userType')}
                  className='w-full rounded-xl border border-[#1F45FF]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F45FF]/40 bg-white'
                >
                  {userTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={cancelarEdicao}
                className='rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors'
                disabled={salvandoEdicao}
              >
                Descartar
              </button>
              <button
                type='button'
                onClick={salvarEdicao}
                className='rounded-xl bg-[#1F45FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a3de6] transition-colors disabled:opacity-50'
                disabled={salvandoEdicao}
              >
                {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
