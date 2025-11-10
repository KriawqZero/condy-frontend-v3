import { getSession } from "./session";
import axios, { AxiosRequestConfig, Method } from "axios";

// Types
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config?: ApiClientConfig) {
    const isServer = typeof window === "undefined";
    this.baseURL = config?.baseURL || (
      isServer
        ? (process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api")
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api")
    );
    this.timeout = config?.timeout || 30000;
    this.defaultHeaders = config?.headers || {};
  }

  /**
   * Método genérico para fazer requisições
   */
  private async request<T>(
    method: Method,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    try {
      // Obter token de autenticação
      const session = await getSession();
      
      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseURL}${endpoint}`,
        timeout: this.timeout,
        headers: {
          ...this.defaultHeaders,
          ...(session?.token && { Authorization: `Bearer ${session.token}` }),
          ...options?.headers,
        },
        params: options?.params,
      };

      // Adicionar dados no corpo da requisição se não for GET
      if (data && method !== 'GET') {
        config.data = data;
      }

      const response = await axios(config);
      
      // Extrai dados da resposta
      const responseData = response.data;
      
      // Se a resposta tem o formato padrão com data wrapper
      if (responseData?.data !== undefined) {
        return responseData.data;
      }
      
      return responseData;
    } catch (error: any) {
      // Tratamento de erro padronizado
      if (error.response) {
        // Erro de resposta do servidor
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.message || 
                           'Erro na requisição';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Erro de rede
        throw new Error('Erro de conexão com o servidor');
      } else {
        // Erro na configuração da requisição
        throw new Error(error.message || 'Erro desconhecido');
      }
    }
  }

  /**
   * Métodos HTTP
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, null, options);
  }
}

// Instância padrão do cliente API
export const apiClient = new ApiClient();

