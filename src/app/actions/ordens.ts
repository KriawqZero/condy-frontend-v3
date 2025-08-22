"use server";

import { ApiResponse } from "@/types";
import { getSession } from "@/lib/session";
import axios from "axios";

function baseUrl() {
  return process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
}

export async function apiPrestadorListOrdens(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.get(`${baseUrl()}/prestador/ordens`, {
      headers: { Authorization: `Bearer ${session.token}` },
      params: { page, limit },
    });
    return { success: true, data: res.data };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}

export async function apiPrestadorGetOrdem(id: number): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.get(`${baseUrl()}/prestador/ordens/${id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    return { success: true, data: res.data };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}

export async function apiPrestadorAlterarStatus(id: number, status: "EM_ANDAMENTO"|"CONCLUIDO"|"CANCELADO"): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.post(`${baseUrl()}/prestador/ordens/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    return { success: true, data: res.data };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}


