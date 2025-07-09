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
import { sanitizeForLog, validateTokenFormat } from "./security";

const API_BASE_URL = process.env.PRIVATE_API_URL || "http://localhost:3000/api";

// Constantes para localStorage (apenas dados não sensíveis)
const ANEXOS_PENDENTES_KEY = "anexos_pendentes_chamado";

// Funções para gerenciar anexos pendentes no localStorage (dados não sensíveis)
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
    console.error("❌ Erro ao salvar anexo pendente:", sanitizeForLog(error));
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
    console.error("❌ Erro ao obter anexos pendentes:", sanitizeForLog(error));
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
    console.error("❌ Erro ao limpar anexos pendentes:", sanitizeForLog(error));
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
    console.error("Erro ao remover anexo pendente:", sanitizeForLog(error));
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
    console.error("❌ Erro no debug de anexos pendentes:", sanitizeForLog(error));
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
    console.error("Erro na associação manual de anexos:", sanitizeForLog(error));
    throw error;
  }
}

// Cliente API seguro
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentado para 15 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição mais seguro
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      // Apenas no servidor, usar sessão iron-session
      if (typeof window === "undefined") {
        const session = await getSession();
        if (session.token && validateTokenFormat(session.token)) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      }
      
      // Adicionar header de segurança
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      
      // Log da requisição (sem dados sensíveis)
      console.log("📤 API Request:", sanitizeForLog({
        method: config.method,
        url: config.url,
        headers: { ...config.headers, Authorization: config.headers.Authorization ? '***REDACTED***' : undefined }
      }));
      
    } catch (error) {
      console.error("Erro no interceptor de requisição:", sanitizeForLog(error));
    }
    return config;
  },
  (error: any) => {
    console.error("Erro na configuração da requisição:", sanitizeForLog(error));
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratamento de erros
apiClient.interceptors.response.use(
  (response: any) => {
    // Log da resposta bem-sucedida (sem dados sensíveis)
    console.log("📥 API Response:", sanitizeForLog({
      status: response.status,
      url: response.config.url,
      method: response.config.method
    }));
    return response;
  },
  (error: any) => {
    // Log de erro da API
    console.error("❌ API Error:", sanitizeForLog({
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    }));
    
    // Tratar erros específicos
    if (error.response?.status === 401) {
      console.warn("Token expirado ou inválido");
      // Redirecionar para login se necessário
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API com validações de segurança
export async function loginUser(
  credentials: LoginRequest
): Promise<AuthResponse> {
  try {
    // Validar entrada antes de enviar
    if (!credentials.email || !credentials.password) {
      throw new Error("Credenciais incompletas");
    }

    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/login",
      credentials
    );

    // Validar resposta
    if (!response.data || !response.data.data || !response.data.data.token) {
      throw new Error("Resposta de login inválida");
    }

    return response.data;
  } catch (error: any) {
    console.error("Erro no login:", sanitizeForLog({
      email: credentials.email,
      error: error.message
    }));
    throw new Error(error.response?.data?.message || "Erro no login");
  }
}

export async function registerUser(
  userData: RegisterRequest
): Promise<AuthResponse> {
  try {
    // Validar dados básicos
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error("Dados de registro incompletos");
    }

    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/register",
      userData
    );

    return response.data;
  } catch (error: any) {
    console.error("Erro no registro:", sanitizeForLog({
      email: userData.email,
      error: error.message
    }));
    throw new Error(error.response?.data?.message || "Erro no registro");
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter usuário atual:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro ao obter usuário");
  }
}

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  try {
    if (!email || email.length > 254) {
      throw new Error("Email inválido");
    }

    const response = await apiClient.get("/auth/check-email", {
      params: { query: email },
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao verificar email:", sanitizeForLog({ email, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao verificar email");
  }
}

export async function checkCpfCnpj(
  cpfCnpj: string
): Promise<{ exists: boolean }> {
  try {
    if (!cpfCnpj || cpfCnpj.length > 18) {
      throw new Error("CPF/CNPJ inválido");
    }

    const response = await apiClient.get("/auth/check-cpf-cnpj", {
      params: { query: cpfCnpj },
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao verificar CPF/CNPJ:", sanitizeForLog({ 
      cpfCnpj: cpfCnpj.replace(/\d/g, '*'), 
      error: error.message 
    }));
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
    console.error("Erro ao obter imóveis:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro ao obter imóveis");
  }
}

export async function getImovelById(id: string) {
  try {
    if (!id) throw new Error("ID do imóvel é obrigatório");
    
    const response = await apiClient.get(`/imoveis/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter imóvel:", sanitizeForLog({ id, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao obter imóvel");
  }
}

export async function createImovel(imovelData: any) {
  try {
    if (!imovelData || !imovelData.nome) {
      throw new Error("Dados do imóvel são obrigatórios");
    }

    const response = await apiClient.post("/imoveis", imovelData);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar imóvel:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro ao criar imóvel");
  }
}

export async function updateImovel(id: string, imovelData: any) {
  try {
    if (!id || !imovelData) {
      throw new Error("ID e dados do imóvel são obrigatórios");
    }

    const response = await apiClient.patch(`/imoveis/${id}`, imovelData);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar imóvel:", sanitizeForLog({ id, error: error.message }));
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar imóvel"
    );
  }
}

export async function deleteImovel(id: string) {
  try {
    if (!id) throw new Error("ID do imóvel é obrigatório");
    
    const response = await apiClient.delete(`/imoveis/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao deletar imóvel:", sanitizeForLog({ id, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao deletar imóvel");
  }
}

// Ativos API
export async function getAtivos(imovelId: string) {
  try {
    if (!imovelId) throw new Error("ID do imóvel é obrigatório");
    
    const response = await apiClient.get(`/imoveis/${imovelId}/ativos`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter ativos:", sanitizeForLog({ imovelId, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao obter ativos");
  }
}

export async function getAtivoById(imovelId: string, ativoId: string) {
  try {
    if (!imovelId || !ativoId) {
      throw new Error("IDs do imóvel e ativo são obrigatórios");
    }
    
    const response = await apiClient.get(
      `/imoveis/${imovelId}/ativos/${ativoId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter ativo:", sanitizeForLog({ 
      imovelId, 
      ativoId, 
      error: error.message 
    }));
    throw new Error(error.response?.data?.message || "Erro ao obter ativo");
  }
}

export async function createAtivo(imovelId: string, ativoData: any) {
  try {
    if (!imovelId || !ativoData) {
      throw new Error("ID do imóvel e dados do ativo são obrigatórios");
    }
    
    const response = await apiClient.post(
      `/imoveis/${imovelId}/ativos`,
      ativoData
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar ativo:", sanitizeForLog({ imovelId, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao criar ativo");
  }
}

export async function updateAtivo(
  imovelId: string,
  ativoId: string,
  ativoData: any
) {
  try {
    if (!imovelId || !ativoId || !ativoData) {
      throw new Error("IDs e dados do ativo são obrigatórios");
    }
    
    const response = await apiClient.patch(
      `/imoveis/${imovelId}/ativos/${ativoId}`,
      ativoData
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar ativo:", sanitizeForLog({ 
      imovelId, 
      ativoId, 
      error: error.message 
    }));
    throw new Error(error.response?.data?.message || "Erro ao atualizar ativo");
  }
}

export async function deleteAtivo(imovelId: string, ativoId: string) {
  try {
    if (!imovelId || !ativoId) {
      throw new Error("IDs do imóvel e ativo são obrigatórios");
    }
    
    const response = await apiClient.delete(
      `/imoveis/${imovelId}/ativos/${ativoId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao deletar ativo:", sanitizeForLog({ 
      imovelId, 
      ativoId, 
      error: error.message 
    }));
    throw new Error(error.response?.data?.message || "Erro ao deletar ativo");
  }
}

// Chamados API
export async function getChamados() {
  try {
    const response = await apiClient.get("/chamado");
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter chamados:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro ao obter chamados");
  }
}

export async function getChamadoById(id: string) {
  try {
    if (!id) throw new Error("ID do chamado é obrigatório");
    
    const response = await apiClient.get(`/chamado/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter chamado:", sanitizeForLog({ id, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao obter chamado");
  }
}

export async function createChamado(chamadoData: any) {
  try {
    if (!chamadoData) {
      throw new Error("Dados do chamado são obrigatórios");
    }
    
    const response = await apiClient.post("/chamado", chamadoData);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar chamado:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro ao criar chamado");
  }
}

export async function updateAnexoChamadoId(anexoId: number, chamadoId: number) {
  try {
    if (!anexoId || !chamadoId) {
      throw new Error("IDs do anexo e chamado são obrigatórios");
    }
    
    const response = await apiClient.patch(`/anexo/${anexoId}`, { chamadoId });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar anexo:", sanitizeForLog({ 
      anexoId, 
      chamadoId, 
      error: error.message 
    }));
    throw new Error(error.response?.data?.message || "Erro ao atualizar anexo");
  }
}

export async function getImoveisWithPagination(
  page: number = 1,
  limit: number = 5
) {
  try {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new Error("Parâmetros de paginação inválidos");
    }
    
    const response = await apiClient.get(`/imovel?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter imóveis paginados:", sanitizeForLog({ 
      page, 
      limit, 
      error: error.message 
    }));
    throw new Error(error.response?.data?.message || "Erro ao obter imóveis");
  }
}

export async function createImovelSimples(imovelData: NovoImovelData) {
  try {
    if (!imovelData || !imovelData.nome) {
      throw new Error("Dados do imóvel são obrigatórios");
    }
    
    const response = await apiClient.post("/imovel", imovelData);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar imóvel simples:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro ao criar imóvel");
  }
}

export async function updateChamado(id: string, chamadoData: any) {
  try {
    if (!id || !chamadoData) {
      throw new Error("ID e dados do chamado são obrigatórios");
    }
    
    const response = await apiClient.patch(`/chamado/${id}`, chamadoData);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar chamado:", sanitizeForLog({ id, error: error.message }));
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar chamado"
    );
  }
}

export async function deleteChamado(id: string) {
  try {
    if (!id) throw new Error("ID do chamado é obrigatório");
    
    const response = await apiClient.delete(`/chamado/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao deletar chamado:", sanitizeForLog({ id, error: error.message }));
    throw new Error(error.response?.data?.message || "Erro ao deletar chamado");
  }
}

export async function getChamadosByStatus(status: string) {
  try {
    if (!status) throw new Error("Status é obrigatório");
    
    const response = await apiClient.get(`/chamado?status=${status}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao obter chamados por status:", sanitizeForLog({ 
      status, 
      error: error.message 
    }));
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
    console.error("Erro no health check:", sanitizeForLog(error));
    throw new Error(error.response?.data?.message || "Erro no health check");
  }
}

export async function uploadAnexoClient(
  file: File,
  title?: string
): Promise<AnexoUploadResponse> {
  try {
    if (!file) {
      throw new Error("Arquivo é obrigatório");
    }

    // Validar tamanho do arquivo (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("Arquivo muito grande. Tamanho máximo: 10MB");
    }

    // Validar tipo do arquivo
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido");
    }

    console.log("Enviando anexo para API:", sanitizeForLog({ 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type,
      title 
    }));

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

    console.log("Resposta da API (anexo):", sanitizeForLog(response.data));
    
    // Se o upload foi bem-sucedido, salvar o ID do anexo como pendente
    if (response.data?.status === 'success' && response.data?.data?.id) {
      salvarAnexoPendente(response.data.data.id);
      console.log("Anexo salvo como pendente para associação futura:", response.data.data.id);
    } else {
      console.warn("Anexo não foi salvo como pendente. Estrutura da resposta:", sanitizeForLog(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Erro detalhado ao fazer upload:", sanitizeForLog({
      fileName: file?.name,
      fileSize: file?.size,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    }));
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      `Erro ao fazer upload: ${error.response?.status || error.message}`
    );
  }
}

export async function getImoveisClient(page: number = 1, limit: number = 5) {
  try {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new Error("Parâmetros de paginação inválidos");
    }
    
    const response = await apiClient.get(
      `/imovel?page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar imóveis:", sanitizeForLog({ 
      page, 
      limit, 
      error: error.message 
    }));
    throw new Error("Erro ao buscar imóveis: " + error.message);
  }
}

export async function createImovelClient(imovelData: NovoImovelData) {
  try {
    if (!imovelData || !imovelData.nome) {
      throw new Error("Dados do imóvel são obrigatórios");
    }
    
    const response = await apiClient.post("/imovel", imovelData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar imóvel:", sanitizeForLog(error));
    throw new Error("Erro ao criar imóvel: " + error.message);
  }
}

export async function createChamadoClient(chamadoData: NovoChamadoData) {
  try {
    if (!chamadoData) {
      throw new Error("Dados do chamado são obrigatórios");
    }
    
    const response = await apiClient.post("/chamado", chamadoData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar chamado:", sanitizeForLog(error));
    throw new Error("Erro ao criar chamado: " + error.message);
  }
}

export async function updateAnexoChamadoIdClient(
  anexoId: number,
  chamadoId: number
) {
  try {
    if (!anexoId || !chamadoId) {
      throw new Error("IDs do anexo e chamado são obrigatórios");
    }
    
    const response = await apiClient.patch(
      `/anexo/${anexoId}`,
      { chamadoId },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar anexo:", sanitizeForLog({ 
      anexoId, 
      chamadoId, 
      error: error.message 
    }));
    throw new Error("Erro ao atualizar anexo: " + error.message);
  }
}
