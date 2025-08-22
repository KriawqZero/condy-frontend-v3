"use server";

import { ApiResponse } from "@/types";
import { getSession } from "@/lib/session";
import axios from "axios";

function getBaseUrl() {
  return process.env.PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
}

export async function apiGetPrestadorDashboard(): Promise<ApiResponse<any>> {
  const session = await getSession();
  try {
    const res = await axios.get(`${getBaseUrl()}/prestador/dashboard`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    return { success: true, data: res.data };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.message || e.message };
  }
}


