'use server';

import { getChamados, getImoveis, updateChamado } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import { destroySession } from '@/lib/session';
import { ResponsePayload, Chamado, User, UserStatus } from '@/types';
import { redirect } from 'next/navigation';

async function forceLogout(reason: string) {
  await destroySession();
  const cookieStore = await import('next/headers').then(m => m.cookies());
  cookieStore.delete('auth_token');
  const noticeParam = encodeURIComponent(reason);
  redirect(`/login?logoutNotice=${noticeParam}`);
}

async function handleAuthError(error: any) {
  const status = error?.status;
  const rawMessage = typeof error?.message === 'string' ? error.message : '';
  const message = rawMessage.toLowerCase();

  const requiresLogout =
    status === 401 ||
    status === 403 ||
    message.includes('email mismatch') ||
    message.includes('invalid token') ||
    message.includes('user type mismatch');

  if (!requiresLogout) {
    return;
  }

  let reason = 'Sua sessão foi encerrada. Faça login novamente.';

  if (message.includes('email mismatch')) {
    reason = 'Seu e-mail foi atualizado e a sessão anterior não é mais válida. Faça login novamente.';
  } else if (message.includes('user type mismatch')) {
    reason = 'Seu perfil de acesso foi alterado. Faça login novamente para continuar.';
  } else if (message.includes('invalid token')) {
    reason = 'Seu token de acesso expirou. Faça login novamente.';
  } else if (status === 401) {
    reason = 'Sua sessão expirou. Faça login novamente.';
  } else if (status === 403) {
    reason = 'Você não tem mais permissão para continuar logado. Faça login novamente.';
  }

  await forceLogout(reason);
}

// Action para admin obter todos os chamados (sem restrições)
export async function getAdminChamadosAction(): Promise<ResponsePayload<Chamado[]>> {
  try {
    // Para admin, busca todos os chamados sem filtros de usuário
    const response = await getChamados();
    return { success: true, data: response.data.items };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar chamados',
    };
  }
}

// Action para admin atualizar chamado
export async function updateChamadoAdminAction(
  id: string,
  data: {
    status?: string;
    prioridade?: string;
    prestadorId?: string;
    valorEstimado?: number;
    observacoesInternas?: string;
  },
): Promise<ResponsePayload<Chamado>> {
  try {
    const response = await updateChamado(id, data);
    return { success: true, data: response.data } as any;
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar chamado',
    };
  }
}

// Admin: listar prestadores
export async function adminListPrestadoresAction(query?: string) {
  try {
    const data = await apiClient.get<User[]>('/user/prestadores', {
      params: { q: query },
    });
    return { success: true, data };
  } catch (error: any) {
    await handleAuthError(error);
    return { success: false, error: error.message || 'Erro ao listar prestadores' };
  }
}

// Admin: atribuir prestador ao chamado
export async function adminAssignPrestadorAction(chamadoId: string, prestadorId: string) {
  try {
    const data = await apiClient.patch(`/chamado/${chamadoId}/assign-prestador/${prestadorId}`, {});
    return { success: true, data };
  } catch (error: any) {
    await handleAuthError(error);
    return { success: false, error: error.message || 'Erro ao atribuir prestador' };
  }
}

// Admin: enviar propostas a prestadores
export async function adminEnviarPropostasAction(data: {
  chamadoId: number;
  prestadores: string[];
  precoMin?: string;
  precoMax?: string;
  prazo?: number;
  mensagem?: string;
}) {
  try {
    const result = await apiClient.post('/admin/propostas/enviar', data);
    return { success: true, data: result };
  } catch (error: any) {
    await handleAuthError(error);
    return { success: false, error: error.message || 'Erro ao enviar propostas' };
  }
}

// Admin: listar propostas por chamado
export async function adminListPropostasPorChamadoAction(chamadoId: number) {
  try {
    const data = await apiClient.get(`/admin/propostas/por-chamado/${chamadoId}`);
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (error: any) {
    await handleAuthError(error);
    return { success: false, error: error.message || 'Erro ao listar propostas' };
  }
}

// Admin: decidir contraproposta
export async function adminDecidirContrapropostaAction(
  propostaId: number,
  acao: 'aprovar' | 'recusar',
  body?: { valorAcordado?: string },
) {
  try {
    const endpoint =
      acao === 'aprovar'
        ? `/admin/propostas/${propostaId}/aprovar-contraproposta`
        : `/admin/propostas/${propostaId}/recusar-contraproposta`;

    const data = await apiClient.post(endpoint, body || {});
    return { success: true, data };
  } catch (error: any) {
    await handleAuthError(error);
    return { success: false, error: error.message || 'Erro ao decidir contraproposta' };
  }
}

// Action para admin obter todos os usuários
export async function getAdminUsersAction(): Promise<ResponsePayload<User[]>> {
  try {
    const response = await apiClient.get<Promise<User[]>>('/auth');

    return { success: true, data: response };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar usuários',
    };
  }
}

// Action para admin atualizar usuário
type UpdateUserAdminPayload = Partial<Omit<User, 'id'>> & {
  password?: string;
  status?: UserStatus;
  [key: string]: unknown;
};

export async function updateUserAdminAction(id: string, data: UpdateUserAdminPayload): Promise<ResponsePayload<User>> {
  try {
    return {
      success: true,
      data: await apiClient.patch<User>(`/auth/${id}`, data),
      message: 'Usuário atualizado com sucesso!',
    };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar usuário',
    };
  }
}

export async function deleteUserAdminAction(id: string): Promise<ResponsePayload<null>> {
  try {
    await apiClient.delete(`/auth/${id}`);
    return {
      success: true,
      message: 'Usuário excluído com sucesso!',
    };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao excluir usuário',
    };
  }
}

// Action para admin criar usuário manualmente
export async function createUserAdminAction(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  whatsapp: string;
  userType: string;
  password: string;
}): Promise<ResponsePayload<User>> {
  try {
    // TODO: Implementar chamada API real
    // const response = await createUserAdmin(data);

    // Mock response por enquanto
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        ...data,
      } as any,
      message: 'Usuário criado com sucesso!',
    };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao criar usuário',
    };
  }
}

// Action para admin alocar prestador em chamado
export async function alocarPrestadorAction(chamadoId: string, prestadorId: string): Promise<ResponsePayload<Chamado>> {
  try {
    // TODO: Implementar chamada API real
    // const response = await alocarPrestador(chamadoId, prestadorId);

    // Mock response por enquanto
    return {
      success: true,
      data: {
        id: chamadoId,
        prestadorId,
      } as any,
      message: 'Prestador alocado com sucesso!',
    };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao alocar prestador',
    };
  }
}

// Action para admin obter estatísticas do sistema - USANDO DADOS REAIS
export async function getSystemStatsAction(): Promise<
  ResponsePayload<{
    totalChamados: number;
    chamadosPendentes: number;
    totalUsuarios: number;
    usuariosAtivos: number;
    totalCondominios: number;
    prestadoresAtivos: number;
    mediaTempoResolucao: number;
    satisfacaoMedia: number;
  }>
> {
  try {
    // Buscar dados reais da API
    const [chamadosResponse, imoveisResponse] = await Promise.all([getChamados(), getImoveis()]);

    const chamados = chamadosResponse.data.items || [];
    const imoveis = imoveisResponse.data.items || [];

    // Calcular estatísticas reais
    const totalChamados = chamados.length;
    const chamadosPendentes = chamados.filter((c: Chamado) => c.status !== 'CONCLUIDO').length;
    const totalCondominios = imoveis.length;

    // Calcular média de tempo de resolução (apenas para chamados concluídos)
    const chamadosConcluidos = chamados.filter((c: Chamado) => c.status === 'CONCLUIDO');
    let mediaTempoResolucao = 0;
    if (chamadosConcluidos.length > 0) {
      const tempos = chamadosConcluidos.map((c: Chamado) => {
        const created = new Date(c.createdAt);
        const updated = new Date(c.updatedAt);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // em horas
      });
      mediaTempoResolucao = tempos.reduce((acc: number, tempo: number) => acc + tempo, 0) / tempos.length;
    }

    return {
      success: true,
      data: {
        totalChamados,
        chamadosPendentes,
        totalUsuarios: 0, // Será implementado quando tivermos endpoint de usuários
        usuariosAtivos: 0, // Será implementado quando tivermos endpoint de usuários
        totalCondominios,
        prestadoresAtivos: 0, // Será implementado quando tivermos dados de prestadores
        mediaTempoResolucao: Math.round(mediaTempoResolucao * 10) / 10, // Arredondar para 1 casa decimal
        satisfacaoMedia: 0, // Será implementado quando tivermos sistema de avaliação
      },
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar estatísticas',
    };
  }
}

// Action para admin obter logs do sistema
export async function getSystemLogsAction(): Promise<
  ResponsePayload<
    {
      id: string;
      timestamp: string;
      level: 'info' | 'warning' | 'error';
      message: string;
      userId?: string;
      action?: string;
    }[]
  >
> {
  try {
    // TODO: Implementar chamada API real para logs do sistema
    // const response = await getSystemLogs();

    // Mock data por enquanto - funcionalidade futura
    return {
      success: true,
      data: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Sistema de logs será implementado futuramente',
          action: 'SYSTEM_INFO',
        },
      ],
    };
  } catch (error: any) {
    await handleAuthError(error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar logs',
    };
  }
}
