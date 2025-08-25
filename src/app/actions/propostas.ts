"use server";

import { ApiResponse } from "@/types";
import { getSession } from "@/lib/session";
import axios from "axios";

function baseUrl() {
  return process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
}

export async function apiPrestadorListPropostas(): Promise<ApiResponse<any[]>> {
  const session = await getSession();
  try {
    const res = await axios.get(`${baseUrl()}/prestador/propostas`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const raw = res.data;
    const data = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}

export async function apiPrestadorAceitarProposta(id: number): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.post(`${baseUrl()}/prestador/propostas/${id}/aceitar`, {}, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const raw = res.data;
    return { success: true, data: raw?.data ?? raw };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}

export async function apiPrestadorRecusarProposta(id: number, justificativa: string): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.post(`${baseUrl()}/prestador/propostas/${id}/recusar`, { justificativa }, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const raw = res.data;
    return { success: true, data: raw?.data ?? raw };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}

export async function apiPrestadorContraproposta(
  id: number,
  body: { precoMin?: string; precoMax?: string; prazo?: number; justificativa: string },
): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.post(`${baseUrl()}/prestador/propostas/${id}/contraproposta`, body, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const raw = res.data;
    return { success: true, data: raw?.data ?? raw };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}


