"use server";

import { getChamados, getImoveis, updateChamado } from "@/lib/api";
import axios from "axios";
import { getSession } from "@/lib/session";
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
    const response = await updateChamado(id, data);
    return { success: true, data: response.data } as any;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar chamado",
    };
  }
}

// Admin: listar prestadores
export async function adminListPrestadoresAction(query?: string) {
  const session = await getSession();
  const base = process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await axios.get(`${base}/user/prestadores`, {
    headers: { Authorization: `Bearer ${session.token}` },
    params: { q: query },
  });
  const raw = res.data;
  const data = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  return { success: true, data } as any;
}

// Admin: atribuir prestador ao chamado
export async function adminAssignPrestadorAction(chamadoId: string, prestadorId: string) {
  const session = await getSession();
  const base = process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await axios.patch(`${base}/chamado/${chamadoId}/assign-prestador/${prestadorId}`, {}, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  return { success: true, data: res.data };
}

// Admin: enviar propostas a prestadores
export async function adminEnviarPropostasAction(data: { chamadoId: number; prestadores: string[]; precoMin?: string; precoMax?: string; prazo?: number; mensagem?: string; }) {
  const session = await getSession();
  const base = process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await axios.post(`${base}/admin/propostas/enviar`, data, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  const raw = res.data;
  return { success: true, data: raw?.data ?? raw } as any;
}

// Admin: listar propostas por chamado
export async function adminListPropostasPorChamadoAction(chamadoId: number) {
  const session = await getSession();
  const base = process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await axios.get(`${base}/admin/propostas/por-chamado/${chamadoId}`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  const raw = res.data;
  const data = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  return { success: true, data } as any;
}

// Admin: decidir contraproposta
export async function adminDecidirContrapropostaAction(propostaId: number, acao: 'aprovar'|'recusar') {
  const session = await getSession();
  const base = process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const url = acao === 'aprovar' ? `${base}/admin/propostas/${propostaId}/aprovar-contraproposta` : `${base}/admin/propostas/${propostaId}/recusar-contraproposta`;
  const res = await axios.post(url, {}, { headers: { Authorization: `Bearer ${session.token}` } });
  const raw = res.data;
  return { success: true, data: raw?.data ?? raw } as any;
}

// Action para admin obter todos os usuários
export async function getAdminUsersAction(): Promise<ResponsePayload<User[]>> {
  try {
    // TODO: Implementar chamada API real - Futura implementação
    // const response = await getUsers();
    
    // Mock data por enquanto - será implementado futuramente
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

// Action para admin obter estatísticas do sistema - USANDO DADOS REAIS
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
    // Buscar dados reais da API
    const [chamadosResponse, imoveisResponse] = await Promise.all([
      getChamados(),
      getImoveis()
    ]);

    const chamados = chamadosResponse.data.items || [];
    const imoveis = imoveisResponse.data.items || [];

    // Calcular estatísticas reais
    const totalChamados = chamados.length;
    const chamadosPendentes = chamados.filter(
      (c: Chamado) => c.status !== 'CONCLUIDO'
    ).length;
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
      mediaTempoResolucao = tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length;
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
        satisfacaoMedia: 0 // Será implementado quando tivermos sistema de avaliação
      }
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
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
          action: 'SYSTEM_INFO'
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