import axios, { AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { getSession } from './session';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Cliente API que só executa no servidor para máxima segurança
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use(async (config) => {
  // Só funciona no servidor
  if (typeof window === 'undefined') {
    try {
      const session = await getSession();
      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (error) {
      console.error('Erro ao obter token da sessão:', error);
    }
  }
  return config;
});

// Auth API
export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro no login');
  }
}

export async function registerUser(userData: RegisterRequest): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro no registro');
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter usuário');
  }
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
  try {
    const response = await apiClient.post('/auth/check-email', { email });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao verificar email');
  }
}

export async function checkCpfCnpj(cpf_cnpj: string): Promise<{ available: boolean }> {
  try {
    const response = await apiClient.post('/auth/check-cpf-cnpj', { cpf_cnpj });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao verificar CPF/CNPJ');
  }
}

// Imóveis API
export async function getImoveis() {
  try {
    const response = await apiClient.get('/imoveis');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter imóveis');
  }
}

export async function getImovelById(id: string) {
  try {
    const response = await apiClient.get(`/imoveis/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter imóvel');
  }
}

export async function createImovel(imovelData: any) {
  try {
    const response = await apiClient.post('/imoveis', imovelData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar imóvel');
  }
}

export async function updateImovel(id: string, imovelData: any) {
  try {
    const response = await apiClient.patch(`/imoveis/${id}`, imovelData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar imóvel');
  }
}

export async function deleteImovel(id: string) {
  try {
    const response = await apiClient.delete(`/imoveis/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar imóvel');
  }
}

// Ativos API
export async function getAtivos(imovelId: string) {
  try {
    const response = await apiClient.get(`/imoveis/${imovelId}/ativos`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter ativos');
  }
}

export async function getAtivoById(imovelId: string, ativoId: string) {
  try {
    const response = await apiClient.get(`/imoveis/${imovelId}/ativos/${ativoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter ativo');
  }
}

export async function createAtivo(imovelId: string, ativoData: any) {
  try {
    const response = await apiClient.post(`/imoveis/${imovelId}/ativos`, ativoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar ativo');
  }
}

export async function updateAtivo(imovelId: string, ativoId: string, ativoData: any) {
  try {
    const response = await apiClient.patch(`/imoveis/${imovelId}/ativos/${ativoId}`, ativoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar ativo');
  }
}

export async function deleteAtivo(imovelId: string, ativoId: string) {
  try {
    const response = await apiClient.delete(`/imoveis/${imovelId}/ativos/${ativoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar ativo');
  }
}

// Chamados API
export async function getChamados() {
  try {
    const response = await apiClient.get('/chamados');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter chamados');
  }
}

export async function getChamadoById(id: string) {
  try {
    const response = await apiClient.get(`/chamados/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter chamado');
  }
}

export async function createChamado(chamadoData: any) {
  try {
    const response = await apiClient.post('/chamados', chamadoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar chamado');
  }
}

export async function updateChamado(id: string, chamadoData: any) {
  try {
    const response = await apiClient.patch(`/chamados/${id}`, chamadoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar chamado');
  }
}

export async function deleteChamado(id: string) {
  try {
    const response = await apiClient.delete(`/chamados/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar chamado');
  }
}

export async function getChamadosByStatus(status: string) {
  try {
    const response = await apiClient.get(`/chamados?status=${status}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter chamados por status');
  }
}

// Sistema API
export async function healthCheck() {
  try {
    const response = await apiClient.get('/up');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro no health check');
  }
} 