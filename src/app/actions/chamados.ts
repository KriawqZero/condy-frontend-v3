"use server";

import { createChamadoClient, getChamadoById, getChamados } from "@/lib/api";
import { Chamado, ResponsePayload } from "@/types";
import { z } from "zod";

/* Schemas de validação
const ativoManualSchema = z.object({
  descricao_ativo: z
    .string()
    .min(2, "Descrição deve ter pelo menos 2 caracteres"),
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  local_instalacao: z.string().min(1, "Local de instalação é obrigatório"),
});*/

const createChamadoSchema = z
  .object({
    descricaoOcorrido: z.string().optional(),
    informacoesAdicionais: z.string().optional(),
    prioridade: z.enum(["BAIXA", "MEDIA", "ALTA"]),
    imovelId: z.number().min(1, "ID do imóvel é obrigatório"),
    escopo: z.enum(["ORCAMENTO", "SERVICO_IMEDIATO"]),
  })
  .refine((data) => data.imovelId || data.imovelId, {
    message:
      "É necessário informar um imóvel existente ou criar um manualmente",
    path: ["imovelId"],
  });

/*const updateChamadoSchema = z.object({
  status: z.enum(["ABERTO", "EM_ANDAMENTO", "CONCLUIDO"]).optional(),
  valor: z.number().positive().optional(),
  garantia: z.boolean().optional(),
  prestador_cnpj: z.string().optional(),
  prestador_nome: z.string().optional(),
  prestador_forma_pagamento: z.string().optional(),
  observacao_prestador: z.string().optional(),
  nf_recibo_url: z.string().url().optional(),
});*/
// Server Action para criar chamado
export async function createChamadoAction(data: {
  descricaoOcorrido: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  imovelId: number;
  escopo: "SERVICO_IMEDIATO" | "ORCAMENTO";
  informacoesAdicionais?: string;
}): Promise<ResponsePayload<Chamado>> {
  try {
    console.log("Validando dados do chamado:", data);
    const validatedData = createChamadoSchema.parse(data);
    console.log("Dados validados:", validatedData);

    // Chama a API real
    const response = await createChamadoClient(validatedData);

    console.log("Resposta completa da API:", response);
    console.log("Dados do chamado (response.data):", response.data);
    
    // Extrair apenas os dados do chamado da resposta da API
    // A resposta já vem com a estrutura correta: { status: 'success', data: { id, ... } }
    const chamadoData = response.data;
    
    return {
      success: true,
      data: chamadoData,
      message: `Chamado ${
        chamadoData?.numeroChamado ||
        chamadoData?.numero_chamado ||
        "criado"
      } com sucesso! Aguarde o contato por WhatsApp.`,
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      console.error("Erro de validação Zod:", error.errors);
      return {
        success: false,
        error:
          "Dados inválidos: " +
          error.errors.map((e: any) => e.message).join(", "),
      };
    }
    console.error("Erro completo ao criar chamado:", error);
    return {
      success: false,
      error: error.message || "Erro interno do servidor",
    };
  }
}

// Server Action para listar chamados
export async function getChamadosAction(): Promise<ResponsePayload<Chamado[]>> {
  try {
    const response = await getChamados();
    return { success: true, data: response.data.items };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar chamados",
    };
  }
}

// Server Action para obter chamado por ID
export async function getChamadoByIdAction(id: string) {
  try {
    const response = await getChamadoById(id);

    const chamado = response.data;
    if (!chamado) {
      return { success: false, error: "Chamado não encontrado" };
    }
    return { success: true, data: chamado };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar chamado",
    };
  }
}

// Server Action para criar chamado
/*export async function createChamadoAction(formData: FormData) {
  try {
    const rawData = {
      condominio_id: formData.get("condominio_id") as string,
      ativo_id: (formData.get("ativo_id") as string) || undefined,
      descricao_ocorrido: formData.get("descricao_ocorrido") as string,
      informacoes_adicionais:
        (formData.get("informacoes_adicionais") as string) || undefined,
      prioridade: formData.get("prioridade") as any,
      escopo: formData.get("escopo") as any,
    };

    // Ativo manual se fornecido
    const ativoManualDescricao = formData.get(
      "ativo_manual_descricao"
    ) as string;
    if (ativoManualDescricao) {
      rawData.ativo_manual = {
        descricao_ativo: ativoManualDescricao,
        marca: formData.get("ativo_manual_marca") as string,
        modelo: formData.get("ativo_manual_modelo") as string,
        local_instalacao: formData.get("ativo_manual_local") as string,
      };
    }

    const validatedData = createChamadoSchema.parse(rawData);

    const response = await createChamado(validatedData);

    // Mock: Gerar número do chamado
    const numeroChamado = `CH${String(mockChamados.length + 1).padStart(
      3,
      "0"
    )}`;

    const novoChamado = {
      id: String(mockChamados.length + 1),
      numero_chamado: numeroChamado,
      ...validatedData,
      arquivos_anexos: [], // TODO: Implementar upload de arquivos
      status: "ABERTO",
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
      message: `Chamado ${numeroChamado} criado com sucesso! Aguarde o contato por WhatsApp.`,
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.errors,
      };
    }

    return {
      success: false,
      error: error.message || "Erro interno do servidor",
    };
  }
}

// Server Action para atualizar chamado (Admin)
export async function updateChamadoAction(id: string, formData: FormData) {
  try {
    const rawData = {
      status: (formData.get("status") as any) || undefined,
      valor: formData.get("valor")
        ? parseFloat(formData.get("valor") as string)
        : undefined,
      garantia: formData.get("garantia") === "true" || undefined,
      prestador_cnpj: (formData.get("prestador_cnpj") as string) || undefined,
      prestador_nome: (formData.get("prestador_nome") as string) || undefined,
      prestador_forma_pagamento:
        (formData.get("prestador_forma_pagamento") as string) || undefined,
      observacao_prestador:
        (formData.get("observacao_prestador") as string) || undefined,
      nf_recibo_url: (formData.get("nf_recibo_url") as string) || undefined,
    };

    // Remove campos undefined
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([_, v]) => v !== undefined)
    );

    const validatedData = updateChamadoSchema.parse(cleanData);

    // TODO: Substituir por chamada real à API quando disponível
    // const response = await updateChamado(id, validatedData);

    // Mock: Atualizar chamado
    const chamadoIndex = mockChamados.findIndex((c) => c.id === id);
    if (chamadoIndex === -1) {
      return { success: false, error: "Chamado não encontrado" };
    }

    // Atualizar prestador_info se fornecido
    if (validatedData.prestador_cnpj || validatedData.prestador_nome) {
      mockChamados[chamadoIndex].prestador_info = {
        cnpj:
          validatedData.prestador_cnpj ||
          mockChamados[chamadoIndex].prestador_info?.cnpj ||
          "",
        nome_fantasia:
          validatedData.prestador_nome ||
          mockChamados[chamadoIndex].prestador_info?.nome_fantasia ||
          "",
        forma_pagamento:
          validatedData.prestador_forma_pagamento ||
          mockChamados[chamadoIndex].prestador_info?.forma_pagamento ||
          "",
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
      message: "Chamado atualizado com sucesso!",
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.errors,
      };
    }

    return {
      success: false,
      error: error.message || "Erro interno do servidor",
    };
  }
}

// Server Action para buscar chamados por status
export async function getChamadosByStatusAction(status: string) {
  try {
    // TODO: Substituir por chamada real à API quando disponível
    // const response = await getChamadosByStatus(status);
    const chamados = mockChamados.filter((c) => c.status === status);
    return { success: true, data: chamados };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar chamados",
    };
  }
}
*/
