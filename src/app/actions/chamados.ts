'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { CreateChamadoRequest, AtivoManual } from '@/types';
import { createChamado, getChamadoById, getChamados } from '@/lib/api';

// Mock data para desenvolvimento (remover quando API estiver pronta)
const mockChamados = [
  {
    id: '1',
    numero_chamado: 'CH001',
    condominio_id: '1',
    condominio: {
      id: '1',
      nome_fantasia: 'Condomínio Residencial Teste',
      endereco: 'Rua de Teste, 999 - São Paulo/SP',
    },
    ativo_id: '1',
    ativo: {
      id: '1',
      asset_code: '00001',
      descricao_ativo: 'Portão Automático',
      marca: 'Portec',
      modelo: 'PT-2000',
      local_instalacao: 'Entrada Principal',
    },
    sindico_id: '1',
    sindico: {
      id: '1',
      name: 'João Silva',
      email: 'joao@teste.com',
    },
    descricao_ocorrido: 'Portão automático não está funcionando corretamente',
    arquivos_anexos: [],
    informacoes_adicionais: 'Problema identificado na manhã de hoje',
    prioridade: 'NORMAL',
    escopo: 'ORCAMENTO',
    status: 'ABERTO',
    valor: null,
    garantia: false,
    prestador_info: null,
    observacao_prestador: null,
    nf_recibo_url: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    numero_chamado: 'CH002',
    condominio_id: '1',
    condominio: {
      id: '1',
      nome_fantasia: 'Condomínio Residencial Teste',
      endereco: 'Rua de Teste, 999 - São Paulo/SP',
    },
    ativo_id: '2',
    ativo: {
      id: '2',
      asset_code: '00002',
      descricao_ativo: 'Sistema Hidráulico',
      marca: 'Tigre',
      modelo: 'Standard',
      local_instalacao: 'Piscina',
    },
    sindico_id: '1',
    sindico: {
      id: '1',
      name: 'João Silva',
      email: 'joao@teste.com',
    },
    descricao_ocorrido: 'Vazamento identificado na piscina',
    arquivos_anexos: [],
    informacoes_adicionais: '',
    prioridade: 'URGENCIA',
    escopo: 'SERVICO_IMEDIATO',
    status: 'EM_ANDAMENTO',
    valor: 850.00,
    garantia: true,
    prestador_info: {
      cnpj: '12345678000199',
      nome_fantasia: 'Hidráulica Silva',
      forma_pagamento: 'PIX',
    },
    observacao_prestador: 'Peça em falta, aguardando fornecedor',
    nf_recibo_url: null,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-15T09:15:00Z',
  },
];

// Schemas de validação
const ativoManualSchema = z.object({
  descricao_ativo: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  local_instalacao: z.string().min(1, 'Local de instalação é obrigatório'),
});

const createChamadoSchema = z.object({
  condominio_id: z.string().min(1, 'Condomínio é obrigatório'),
  ativo_id: z.string().optional(),
  ativo_manual: ativoManualSchema.optional(),
  descricao_ocorrido: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  informacoes_adicionais: z.string().optional(),
  prioridade: z.enum(['NORMAL', 'URGENCIA', 'EMERGENCIA']),
  escopo: z.enum(['ORCAMENTO', 'SERVICO_IMEDIATO']),
}).refine((data) => data.ativo_id || data.ativo_manual, {
  message: "É necessário informar um ativo existente ou criar um manualmente",
  path: ["ativo_id"],
});

const updateChamadoSchema = z.object({
  status: z.enum(['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO']).optional(),
  valor: z.number().positive().optional(),
  garantia: z.boolean().optional(),
  prestador_cnpj: z.string().optional(),
  prestador_nome: z.string().optional(),
  prestador_forma_pagamento: z.string().optional(),
  observacao_prestador: z.string().optional(),
  nf_recibo_url: z.string().url().optional(),
});

// Server Action para listar chamados
export async function getChamadosAction() {
  try {
    const response = await getChamados();
    return { success: true, data: response.data };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Erro ao buscar chamados' 
    };
  }
}

// Server Action para obter chamado por ID
export async function getChamadoByIdAction(id: string) {
  try {
    const response = await getChamadoById(id);
    
    const chamado = response.data;
    if (!chamado) {
      return { success: false, error: 'Chamado não encontrado' };
    }
    return { success: true, data: chamado };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Erro ao buscar chamado' 
    };
  }
}

// Server Action para criar chamado
export async function createChamadoAction(formData: FormData) {
  try {
    const rawData = {
      condominio_id: formData.get('condominio_id') as string,
      ativo_id: formData.get('ativo_id') as string || undefined,
      descricao_ocorrido: formData.get('descricao_ocorrido') as string,
      informacoes_adicionais: formData.get('informacoes_adicionais') as string || undefined,
      prioridade: formData.get('prioridade') as any,
      escopo: formData.get('escopo') as any,
    };

    // Ativo manual se fornecido
    const ativoManualDescricao = formData.get('ativo_manual_descricao') as string;
    if (ativoManualDescricao) {
      rawData.ativo_manual = {
        descricao_ativo: ativoManualDescricao,
        marca: formData.get('ativo_manual_marca') as string,
        modelo: formData.get('ativo_manual_modelo') as string,
        local_instalacao: formData.get('ativo_manual_local') as string,
      };
    }

    const validatedData = createChamadoSchema.parse(rawData);
    
    const response = await createChamado(validatedData);
    
    // Mock: Gerar número do chamado
    const numeroChamado = `CH${String(mockChamados.length + 1).padStart(3, '0')}`;
    
    const novoChamado = {
      id: String(mockChamados.length + 1),
      numero_chamado: numeroChamado,
      ...validatedData,
      arquivos_anexos: [], // TODO: Implementar upload de arquivos
      status: 'ABERTO',
      valor: null,
      garantia: false,
      prestador_info: null,
      observacao_prestador: null,
      nf_recibo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockChamados.push(novoChamado);
    
    return { 
      success: true, 
      data: novoChamado,
      message: `Chamado ${numeroChamado} criado com sucesso! Aguarde o contato por WhatsApp.`
    };
    
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { 
        success: false, 
        error: 'Dados inválidos',
        fieldErrors: error.errors 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    };
  }
}

// Server Action para atualizar chamado (Admin)
export async function updateChamadoAction(id: string, formData: FormData) {
  try {
    const rawData = {
      status: formData.get('status') as any || undefined,
      valor: formData.get('valor') ? parseFloat(formData.get('valor') as string) : undefined,
      garantia: formData.get('garantia') === 'true' || undefined,
      prestador_cnpj: formData.get('prestador_cnpj') as string || undefined,
      prestador_nome: formData.get('prestador_nome') as string || undefined,
      prestador_forma_pagamento: formData.get('prestador_forma_pagamento') as string || undefined,
      observacao_prestador: formData.get('observacao_prestador') as string || undefined,
      nf_recibo_url: formData.get('nf_recibo_url') as string || undefined,
    };

    // Remove campos undefined
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([_, v]) => v !== undefined)
    );

    const validatedData = updateChamadoSchema.parse(cleanData);
    
    // TODO: Substituir por chamada real à API quando disponível
    // const response = await updateChamado(id, validatedData);
    
    // Mock: Atualizar chamado
    const chamadoIndex = mockChamados.findIndex(c => c.id === id);
    if (chamadoIndex === -1) {
      return { success: false, error: 'Chamado não encontrado' };
    }
    
    // Atualizar prestador_info se fornecido
    if (validatedData.prestador_cnpj || validatedData.prestador_nome) {
      mockChamados[chamadoIndex].prestador_info = {
        cnpj: validatedData.prestador_cnpj || mockChamados[chamadoIndex].prestador_info?.cnpj || '',
        nome_fantasia: validatedData.prestador_nome || mockChamados[chamadoIndex].prestador_info?.nome_fantasia || '',
        forma_pagamento: validatedData.prestador_forma_pagamento || mockChamados[chamadoIndex].prestador_info?.forma_pagamento || '',
      };
    }
    
    // Atualizar outros campos
    Object.assign(mockChamados[chamadoIndex], {
      ...validatedData,
      updated_at: new Date().toISOString(),
    });
    
    return { 
      success: true, 
      data: mockChamados[chamadoIndex],
      message: 'Chamado atualizado com sucesso!'
    };
    
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { 
        success: false, 
        error: 'Dados inválidos',
        fieldErrors: error.errors 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    };
  }
}

// Server Action para buscar chamados por status
export async function getChamadosByStatusAction(status: string) {
  try {
    // TODO: Substituir por chamada real à API quando disponível
    // const response = await getChamadosByStatus(status);
    const chamados = mockChamados.filter(c => c.status === status);
    return { success: true, data: chamados };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Erro ao buscar chamados' 
    };
  }
} 