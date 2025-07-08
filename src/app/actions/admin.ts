"use server";

import { getChamados } from "@/lib/api";
import { ResponsePayload, Chamado, User } from "@/types";

// Action para admin obter todos os chamados (sem restrições)
export async function getAdminChamadosAction(): Promise<ResponsePayload<Chamado[]>> {
  try {
    // Para admin, busca todos os chamados sem filtros de usuário
    const response = await getChamados();
    return { success: true, data: response.data.items };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar chamados",
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
  }
): Promise<ResponsePayload<Chamado>> {
  try {
    // TODO: Implementar chamada API real para update admin
    // const response = await updateChamadoAdmin(id, data);
    
    // Mock response por enquanto
    return {
      success: true,
      data: {
        id,
        ...data,
      } as any,
      message: "Chamado atualizado com sucesso!",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar chamado",
    };
  }
}

// Action para admin obter todos os usuários
export async function getAdminUsersAction(): Promise<ResponsePayload<User[]>> {
  try {
    // TODO: Implementar chamada API real
    // const response = await getUsers();
    
    // Mock data por enquanto
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@condominio.com',
        cpfCnpj: '123.456.789-00',
        whatsapp: '(11) 99999-9999',
        userType: 'SINDICO_RESIDENTE',
        dataNascimento: '1985-05-15'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        cpfCnpj: '12.345.678/0001-90',
        whatsapp: '(11) 88888-8888',
        userType: 'EMPRESA'
      },
      {
        id: '3',
        name: 'Carlos Prestador',
        email: 'carlos@prestador.com',
        cpfCnpj: '987.654.321-00',
        whatsapp: '(11) 77777-7777',
        userType: 'PRESTADOR'
      }
    ];
    
    return { success: true, data: mockUsers };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar usuários",
    };
  }
}

// Action para admin atualizar usuário
export async function updateUserAdminAction(
  id: string,
  data: {
    name?: string;
    email?: string;
    cpfCnpj?: string;
    whatsapp?: string;
    userType?: string;
    isActive?: boolean;
  }
): Promise<ResponsePayload<User>> {
  try {
    // TODO: Implementar chamada API real
    // const response = await updateUserAdmin(id, data);
    
    // Mock response por enquanto
    return {
      success: true,
      data: {
        id,
        ...data,
      } as any,
      message: "Usuário atualizado com sucesso!",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar usuário",
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
      message: "Usuário criado com sucesso!",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao criar usuário",
    };
  }
}

// Action para admin alocar prestador em chamado
export async function alocarPrestadorAction(
  chamadoId: string,
  prestadorId: string
): Promise<ResponsePayload<Chamado>> {
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
      message: "Prestador alocado com sucesso!",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao alocar prestador",
    };
  }
}

// Action para admin obter estatísticas do sistema
export async function getSystemStatsAction(): Promise<ResponsePayload<{
  totalChamados: number;
  chamadosPendentes: number;
  totalUsuarios: number;
  usuariosAtivos: number;
  totalCondominios: number;
  prestadoresAtivos: number;
  mediaTempoResolucao: number;
  satisfacaoMedia: number;
}>> {
  try {
    // TODO: Implementar chamada API real
    // const response = await getSystemStats();
    
    // Mock data por enquanto
    return {
      success: true,
      data: {
        totalChamados: 247,
        chamadosPendentes: 42,
        totalUsuarios: 1394,
        usuariosAtivos: 1285,
        totalCondominios: 89,
        prestadoresAtivos: 156,
        mediaTempoResolucao: 4.2, // em horas
        satisfacaoMedia: 4.7 // de 1 a 5
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar estatísticas",
    };
  }
}

// Action para admin obter logs do sistema
export async function getSystemLogsAction(): Promise<ResponsePayload<{
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  userId?: string;
  action?: string;
}[]>> {
  try {
    // TODO: Implementar chamada API real
    // const response = await getSystemLogs();
    
    // Mock data por enquanto
    return {
      success: true,
      data: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Usuário fez login no sistema',
          userId: 'user123',
          action: 'LOGIN'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: 'warning',
          message: 'Tentativa de acesso negada - permissões insuficientes',
          userId: 'user456',
          action: 'ACCESS_DENIED'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          level: 'error',
          message: 'Erro na integração com WhatsApp API',
          action: 'WHATSAPP_ERROR'
        }
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar logs",
    };
  }
}