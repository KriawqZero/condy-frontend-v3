import {
  AnexoUploadResponse,
  AuthResponse,
  LoginRequest,
  NovoChamadoData,
  NovoImovelData,
  RegisterRequest,
} from "@/types";
import axios, { AxiosResponse } from "axios";
import { getSession } from "./session";

const API_BASE_URL = process.env.PRIVATE_API_URL || "http://localhost:4000/api";

// Constantes para localStorage
const ANEXOS_PENDENTES_KEY = "anexos_pendentes_chamado";

// Funções para gerenciar anexos pendentes no localStorage
export function salvarAnexoPendente(anexoId: number): void {
  if (typeof window === "undefined") {
    console.warn("⚠️ salvarAnexoPendente chamado no servidor - ignorando");
    return;
  }
  
  try {
    const anexosPendentes = getAnexosPendentes();
    if (!anexosPendentes.includes(anexoId)) {
      anexosPendentes.push(anexoId);
      localStorage.setItem(ANEXOS_PENDENTES_KEY, JSON.stringify(anexosPendentes));
      console.log("✅ ANEXO SALVO COMO PENDENTE:", anexoId, "| Lista atual:", anexosPendentes);
    } else {
      console.log("⚠️ Anexo já existe na lista de pendentes:", anexoId);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar anexo pendente:", error);
  }
}

export function getAnexosPendentes(): number[] {
  if (typeof window === "undefined") {
    console.warn("⚠️ getAnexosPendentes chamado no servidor - retornando array vazio");
    return [];
  }
  
  try {
    const stored = localStorage.getItem(ANEXOS_PENDENTES_KEY);
    const anexos = stored ? JSON.parse(stored) : [];
    console.log("📋 ANEXOS PENDENTES OBTIDOS:", anexos.length > 0 ? anexos : "Nenhum anexo encontrado");
    return anexos;
  } catch (error) {
    console.error("❌ Erro ao obter anexos pendentes:", error);
    return [];
  }
}

export function limparAnexosPendentes(): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(ANEXOS_PENDENTES_KEY);
    const anexosAntes = stored ? JSON.parse(stored) : [];
    localStorage.removeItem(ANEXOS_PENDENTES_KEY);
    console.log("🧹 Anexos pendentes limpos do localStorage. Eram:", anexosAntes);
  } catch (error) {
    console.error("❌ Erro ao limpar anexos pendentes:", error);
  }
}

export function removerAnexoPendente(anexoId: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const anexosPendentes = getAnexosPendentes();
    const novosAnexos = anexosPendentes.filter(id => id !== anexoId);
    localStorage.setItem(ANEXOS_PENDENTES_KEY, JSON.stringify(novosAnexos));
    console.log("Anexo removido dos pendentes:", anexoId);
  } catch (error) {
    console.error("Erro ao remover anexo pendente:", error);
  }
}

export function hasAnexosPendentes(): boolean {
  return getAnexosPendentes().length > 0;
}

// Função para debug - verificar estado atual do localStorage
export function debugAnexosPendentes(): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(ANEXOS_PENDENTES_KEY);
    console.log("🔍 DEBUG localStorage anexos pendentes:", {
      raw: stored,
      parsed: stored ? JSON.parse(stored) : null,
      length: stored ? JSON.parse(stored).length : 0
    });
  } catch (error) {
    console.error("❌ Erro no debug de anexos pendentes:", error);
  }
}

// Função para forçar associação de anexos pendentes a um chamado específico
export async function associarAnexosPendentesAoChamado(chamadoId: number): Promise<void> {
  const anexosPendentes = getAnexosPendentes();
  
  if (anexosPendentes.length === 0) {
    console.log("Nenhum anexo pendente para associar");
    return;
  }
  
  console.log(`Associando ${anexosPendentes.length} anexos pendentes ao chamado ${chamadoId}`);
  
  try {
    const resultados = await Promise.allSettled(
      anexosPendentes.map(anexoId => 
        updateAnexoChamadoIdClient(anexoId, chamadoId)
      )
    );
    
    const sucessos = resultados.filter(result => result.status === 'fulfilled').length;
    const erros = resultados.filter(result => result.status === 'rejected').length;
    
    console.log(`Associação concluída: ${sucessos} sucessos, ${erros} erros`);
    
    if (sucessos > 0) {
      limparAnexosPendentes();
      console.log("Anexos pendentes removidos após associação manual");
    }
    
  } catch (error) {
    console.error("Erro na associação manual de anexos:", error);
    throw error;
  }
}

// Cliente API que só executa no servidor para máxima segurança
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use(async (config) => {
  // Funciona tanto no servidor quanto no cliente
  try {
    // No servidor, usa getSession()
    if (typeof window === "undefined") {
      const session = await getSession();
      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } else {
      // No cliente, tenta obter o token do localStorage ou cookies
      const token = localStorage.getItem('auth_token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error("Erro ao obter token da sessão:", error);
  }
  return config;
});

// Auth API
export async function loginUser(
  credentials: LoginRequest
): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/login",
      credentials
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro no login");
  }
}

export async function registerUser(
  userData: RegisterRequest
): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/register",
      userData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro no registro");
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter usuário");
  }
}

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  try {
    const response = await apiClient.get("/auth/check-email", {
      params: { query: email },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao verificar email");
  }
}

export async function checkCpfCnpj(
  cpfCnpj: string
): Promise<{ exists: boolean }> {
  try {
    const response = await apiClient.get("/auth/check-cpf-cnpj", {
      params: { query: cpfCnpj },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao verificar CPF/CNPJ"
    );
  }
}

// Imóveis API
export async function getImoveis() {
  try {
    const response = await apiClient.get("/imovel");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter imóveis");
  }
}

export async function getImovelById(id: string) {
  try {
    const response = await apiClient.get(`/imoveis/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter imóvel");
  }
}

export async function createImovel(imovelData: any) {
  try {
    const response = await apiClient.post("/imoveis", imovelData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao criar imóvel");
  }
}

export async function updateImovel(id: string, imovelData: any) {
  try {
    const response = await apiClient.patch(`/imoveis/${id}`, imovelData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar imóvel"
    );
  }
}

export async function deleteImovel(id: string) {
  try {
    const response = await apiClient.delete(`/imoveis/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao deletar imóvel");
  }
}

// Ativos API
export async function getAtivos(imovelId: string) {
  try {
    const response = await apiClient.get(`/imoveis/${imovelId}/ativos`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter ativos");
  }
}

export async function getAtivoById(imovelId: string, ativoId: string) {
  try {
    const response = await apiClient.get(
      `/imoveis/${imovelId}/ativos/${ativoId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter ativo");
  }
}

export async function createAtivo(imovelId: string, ativoData: any) {
  try {
    const response = await apiClient.post(
      `/imoveis/${imovelId}/ativos`,
      ativoData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao criar ativo");
  }
}

export async function updateAtivo(
  imovelId: string,
  ativoId: string,
  ativoData: any
) {
  try {
    const response = await apiClient.patch(
      `/imoveis/${imovelId}/ativos/${ativoId}`,
      ativoData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao atualizar ativo");
  }
}

export async function deleteAtivo(imovelId: string, ativoId: string) {
  try {
    const response = await apiClient.delete(
      `/imoveis/${imovelId}/ativos/${ativoId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao deletar ativo");
  }
}

// Chamados API
export async function getChamados() {
  try {
    const response = await apiClient.get("/chamado");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter chamados");
  }
}

export async function getChamadoById(id: string) {
  try {
    const response = await apiClient.get(`/chamado/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter chamado");
  }
}

export async function createChamado(chamadoData: any) {
  try {
    const response = await apiClient.post("/chamado", chamadoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao criar chamado");
  }
}

export async function updateAnexoChamadoId(anexoId: number, chamadoId: number) {
  try {
    const response = await apiClient.patch(`/anexo/${anexoId}`, { chamadoId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao atualizar anexo");
  }
}

export async function getImoveisWithPagination(
  page: number = 1,
  limit: number = 5
) {
  try {
    const response = await apiClient.get(`/imovel?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao obter imóveis");
  }
}

export async function createImovelSimples(imovelData: NovoImovelData) {
  try {
    const response = await apiClient.post("/imovel", imovelData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao criar imóvel");
  }
}

export async function updateChamado(id: string, chamadoData: any) {
  try {
    const response = await apiClient.patch(`/chamado/${id}`, chamadoData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar chamado"
    );
  }
}

export async function deleteChamado(id: string) {
  try {
    const response = await apiClient.delete(`/chamado/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao deletar chamado");
  }
}

export async function getChamadosByStatus(status: string) {
  try {
    const response = await apiClient.get(`/chamado?status=${status}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao obter chamados por status"
    );
  }
}

export async function healthCheck() {
  try {
    const response = await apiClient.get("/up");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro no health check");
  }
}

export async function uploadAnexoClient(
  file: File,
  title?: string
): Promise<AnexoUploadResponse> {
  try {
    console.log("Enviando anexo para API:", { fileName: file.name, title });
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }

    const response = await apiClient.post("/anexo/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    console.log("Resposta da API (anexo):", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Erro detalhado ao fazer upload:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      `Erro ao fazer upload: ${error.response?.status || error.message}`
    );
  }
}

export async function getImoveisClient(page: number = 1, limit: number = 5) {
  try {
    const response = await apiClient.get(
      `/imovel?page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Erro ao buscar imóveis: " + error.message);
  }
}

export async function createImovelClient(imovelData: NovoImovelData) {
  try {
    const response = await apiClient.post("/imovel", imovelData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (_error: any) {
    throw new Error("Erro ao criar imóvel");
  }
}

export async function createChamadoClient(chamadoData: NovoChamadoData) {
  try {
    console.log("Enviando chamado para API:", chamadoData);
    
    let chamadoResponse;
    
    // Primeira tentativa: usando o apiClient padrão
    try {
      chamadoResponse = await apiClient.post("/chamado", chamadoData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("Resposta da API (tentativa 1):", chamadoResponse.data);
    } catch (firstError: any) {
      console.warn("Primeira tentativa falhou:", firstError.response?.status);
      
      // Segunda tentativa: cliente axios direto com token manual
      const token = localStorage.getItem('auth_token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (token) {
        const directClient = axios.create({
          baseURL: API_BASE_URL,
          timeout: 10000,
        });
        
        chamadoResponse = await directClient.post("/chamado", chamadoData, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log("Resposta da API (tentativa 2):", chamadoResponse.data);
      } else {
        throw firstError;
      }
    }

    // Nota: A associação de anexos agora é feita no cliente após a criação do chamado
    console.log("📋 Chamado criado, retornando dados:", chamadoResponse.data);
    
    return chamadoResponse.data;
    
  } catch (_error: any) {
    console.error("Erro detalhado ao criar chamado:", {
      message: _error.message,
      status: _error.response?.status,
      statusText: _error.response?.statusText,
      data: _error.response?.data,
      headers: _error.response?.headers,
      config: _error.config
    });
    throw new Error(
      _error.response?.data?.message || 
      _error.response?.data?.error || 
      `Erro ao criar chamado: ${_error.response?.status || _error.message}`
    );
  }
}

export async function updateAnexoChamadoIdClient(
  anexoId: number,
  chamadoId: number
) {
  try {
    console.log(`🔗 Associando anexo ${anexoId} ao chamado ${chamadoId}`);
    
    const response = await apiClient.patch(
      `/anexo/${anexoId}`,
      { chamadoId },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    
    console.log(`✅ Anexo ${anexoId} associado com sucesso:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Erro ao associar anexo ${anexoId}: ${error}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Erro ao atualizar anexo ${anexoId}: ${error.response?.data?.message || error.message}`);
  }
}
