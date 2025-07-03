// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  whatsapp: string;
  userType: UserType;
  dataNascimento?: string;
}

export type ResponsePayload<T> = {
  success: boolean | undefined;
  data?: T;
  error?: string | undefined;
  message?: string | undefined;
};

export type UserType =
  | "SINDICO_RESIDENTE"
  | "SINDICO_PROFISSIONAL"
  | "EMPRESA"
  | "PRESTADOR"
  | "ADMIN_PLATAFORMA";

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  cpf_cnpj: string;
  whatsapp: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type: UserType;
  data_nascimento?: string;
  email_pessoal?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// Tipos antigos removidos - usar apenas a definição atualizada de Imovel abaixo

// Ativo Types
export interface Ativo {
  id: string;
  asset_code: string;
  descricao_ativo: string;
  local_instalacao: string;
  marca: string;
  modelo: string;
  data_instalacao: string;
  valor_compra: number;
  garantia: boolean;
  garantia_validade?: string;
  garantia_fornecedor_info?: FornecedorInfo;
  contrato_manutencao: boolean;
  contrato_validade?: string;
  contrato_fornecedor_info?: ContratoInfo;
  relatorio_fotografico_urls: string[];
  imovel_id: string;
  created_at: string;
  updated_at: string;
}

export interface FornecedorInfo {
  nome: string;
  cnpj: string;
  contato: string;
}

export interface ContratoInfo {
  empresa: string;
  valor_mensal: number;
}

export interface CreateAtivoRequest {
  descricao_ativo: string;
  local_instalacao: string;
  marca: string;
  modelo: string;
  data_instalacao: string;
  valor_compra: number;
  garantia: boolean;
  garantia_validade?: string;
  garantia_fornecedor_info?: FornecedorInfo;
  contrato_manutencao: boolean;
  contrato_validade?: string;
  contrato_fornecedor_info?: ContratoInfo;
  relatorio_fotografico_urls: string[];
}

export interface Imovel {
  id: number;
  nome: string;
  gestorId: string;
  cep: string;
  endereco: string;
  cidade: string;
  bairro: string;
  numero: string;
  uf: string;
  complemento?: string;
  quantidadeMoradias: number;
  createdAt: string;
  updatedAt: string;
}

// Chamado Types (baseado nos requisitos)
export interface Chamado {
  id: string;
  numeroChamado: string;
  descricaoOcorrido: string;
  informacoesAdicionais?: string;

  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  escopo: "ORCAMENTO" | "SERVICO_IMEDIATO";
  status: "NOVO" | "A_CAMINHO" | "EM_ATENDIMENTO" | "CONCLUIDO";
  valorEstimado?: number;

  imovelId: number;
  imovel?: Imovel;
  solicitanteId: string;
  ativoId?: number;
  prestadorId?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Tipos específicos para criação de chamado manual
export interface AtivoManual {
  descricao_ativo: string;
  marca: string;
  modelo: string;
  local_instalacao: string;
}

export type Prioridade = "NORMAL" | "URGENCIA" | "EMERGENCIA";
export type Escopo = "ORCAMENTO" | "SERVICO_IMEDIATO";
export type StatusChamado = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO";

export interface PrestadorChamado {
  cnpj: string;
  nome_fantasia: string;
  forma_pagamento: string;
}

export interface CreateChamadoRequest {
  condominio_id: string;
  ativo_id?: string; // Opcional quando usar ativo manual
  ativo_manual?: AtivoManual; // Para inserção manual
  descricao_ocorrido: string;
  arquivos_anexos: string[];
  informacoes_adicionais?: string;
  prioridade: Prioridade;
  escopo: Escopo;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Session Types
export interface SessionData {
  user?: User;
  token?: string;
  isLoggedIn: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends RegisterRequest {}

// Anexo Types
export interface Anexo {
  id: number;
  url: string;
  awsKey: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  chamadoId: number | null;
}

export interface AnexoUploadResponse {
  status: string;
  data: Anexo;
  error?: string;
  message?: string;
}

// Novo Chamado Types
export interface NovoImovelData {
  nome: string;
  cep: string;
  endereco: string;
  cidade: string;
  bairro: string;
  numero: string;
  uf: string;
  quantidade_moradias: number;
  complemento?: string;
}

export interface NovoChamadoData {
  descricaoOcorrido: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  imovelId: number;
  escopo: "SERVICO_IMEDIATO" | "ORCAMENTO";
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
