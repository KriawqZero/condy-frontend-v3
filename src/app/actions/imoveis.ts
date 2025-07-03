"use server";

import { createImovelClient, getImoveisClient } from "@/lib/api";
import { Imovel, ResponsePayload } from "@/types";

// Server Action para listar imóveis
export async function getImoveisAction(): Promise<ResponsePayload<Imovel[]>> {
  try {
    const response = await getImoveisClient();
    return { success: true, data: response.data.items };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao buscar imóveis",
    };
  }
}

export async function createImovelAction(
  formData: FormData
): Promise<ResponsePayload<Imovel>> {
  try {
    const rawData = {
      nome: formData.get("nome") as string,
      cep: formData.get("cep") as string,
      endereco: formData.get("endereco") as string,
      cidade: formData.get("cidade") as string,
      bairro: formData.get("bairro") as string,
      numero: formData.get("numero") as string,
      uf: formData.get("uf") as string,
      quantidade_moradias: parseInt(
        formData.get("quantidade_moradias") as string,
        10
      ),
      complemento: (formData.get("complemento") as string) || undefined,
    };

    // Aqui você deve chamar a função de criação de imóvel no backend
    const response = await createImovelClient(rawData);

    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao criar imóvel",
    };
  }
}
