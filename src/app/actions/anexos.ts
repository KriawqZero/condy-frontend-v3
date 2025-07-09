"use server";

import { updateAnexoChamadoIdClient, uploadAnexoClient } from "@/lib/api";

// Server Action para enviar um novo anexo
export async function sendAnexoAction(
  anexo: File,
  title?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Enviando anexo via action
    const response = await uploadAnexoClient(anexo, title);

    if (!response.status || response.status !== "success" || !response.data) {
      throw new Error(response.error || "Erro ao enviar anexo");
    }

    // Anexo enviado com sucesso
    return { success: true, data: response.data };
  } catch (error: any) {
    // Erro na action de envio de anexo
    return { success: false, error: error.message || "Erro ao enviar anexo" };
  }
}

// Server Action para atualizar o ID do anexo no chamado
export async function updateAnexoChamadoIdAction(
  anexoId: number,
  chamadoId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateAnexoChamadoIdClient(anexoId, chamadoId);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar anexo",
    };
  }
}
