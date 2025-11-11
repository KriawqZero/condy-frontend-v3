"use server";

import { checkCpfCnpj, checkEmail, loginUser } from "@/lib/api";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Nota: registerSchema removido por não ser utilizado atualmente

// Server Action para login
export async function loginAction(formData: FormData) {
  await destroySession(); // Garantir que a sessão anterior seja destruída
  let redirectPath = "/dashboard"; // Default fallback

  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = loginSchema.parse(rawData);

    try {
      // Try login with API
      const response = await loginUser(validatedData);

      if (!response || !response.data) {
        return { success: false, error: "Credenciais inválidas" };
      }

      // Login bem sucedido
      await createSession(response.data.token, response.data.user);

      // Disponibilizar o token para o cliente (axios no browser)
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      cookieStore.set("auth_token", response.data.token, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      // Determinar rota de redirecionamento
      switch (response.data.user.userType) {
        case "ADMIN_PLATAFORMA":
          redirectPath = "/admin";
          break;
        case "SINDICO_RESIDENTE":
        case "SINDICO_PROFISSIONAL":
          redirectPath = "/sindico";
          break;
        case "EMPRESA":
          redirectPath = "/empresa";
          break;
        case "PRESTADOR":
          redirectPath = "/prestador";
          break;
        default:
          redirectPath = "/dashboard";
          break;
      }

      // Redirecionar apenas em caso de sucesso
      redirect(redirectPath);
    } catch (apiError: any) {
      // Handle API errors separately
      return {
        success: false,
        status: apiError.status,
        error: apiError.message || "Credenciais inválidas",
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);

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

  // This line won't be reached due to redirect, but helps TypeScript
  return { success: true };
}

// Server Action para registro
/*
export async function registerAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      cpf_cnpj: formData.get('cpf_cnpj') as string,
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      password_confirmation: formData.get('password_confirmation') as string,
      user_type: formData.get('user_type') as any,
      data_nascimento: formData.get('data_nascimento') as string || undefined,
      email_pessoal: formData.get('email_pessoal') as string || undefined,
    };

    const validatedData = registerSchema.parse(rawData);
    
    const response = await registerUser(validatedData);
    
    if (response) {
      await createSession(response.token, response.user);
      redirect('/dashboard');
    }
    
    return { success: false, error: 'Falha no registro' };
    
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
  */

// Server Action para logout
export async function logoutAction() {
  await destroySession();
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  cookieStore.delete("auth_token");
  redirect("/login");
}

// Server Action para verificar email
export async function checkEmailAction(email: string) {
  try {
    const response = await checkEmail(email);
    return response;
  } catch (error: any) {
    return { available: false, error: error.message };
  }
}

// Server Action para verificar CPF/CNPJ
export async function checkCpfCnpjAction(cpf_cnpj: string) {
  try {
    const response = await checkCpfCnpj(cpf_cnpj);
    return response;
  } catch (error: any) {
    return { available: false, error: error.message };
  }
}
