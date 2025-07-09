"use server";

import { checkCpfCnpj, checkEmail, loginUser } from "@/lib/api";
import { createSession, destroySession } from "@/lib/session";
import { 
  emailSchema, 
  passwordSchema, 
  sanitizeInput, 
  sanitizeForLog, 
  loginRateLimiter,
  detectInjectionAttempt
} from "@/lib/security";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schemas de validação mais robustos
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

const registerSchema = z
  .object({
    name: z.string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos"),
    cpf_cnpj: z.string()
      .min(11, "CPF/CNPJ inválido")
      .max(18, "CPF/CNPJ inválido")
      .regex(/^[\d.\-/]+$/, "CPF/CNPJ deve conter apenas números, pontos, hífens e barras"),
    whatsapp: z.string()
      .min(10, "WhatsApp inválido")
      .max(20, "WhatsApp muito longo")
      .regex(/^[\d\s\(\)\-\+]+$/, "WhatsApp contém caracteres inválidos"),
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string(),
    user_type: z.enum([
      "SINDICO_RESIDENTE",
      "SINDICO_PROFISSIONAL",
      "EMPRESA",
      "PRESTADOR",
      "ADMIN_PLATAFORMA",
    ]),
    data_nascimento: z.string().optional(),
    email_pessoal: emailSchema.optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Senhas não coincidem",
    path: ["password_confirmation"],
  });

// Função simplificada para identificar tentativas
function getRequestIdentifier(): string {
  return `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Server Action para login com segurança aprimorada
export async function loginAction(formData: FormData) {
  const requestId = getRequestIdentifier();
  
  // Rate limiting por sessão
  if (!loginRateLimiter.isAllowed(requestId)) {
    const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(requestId) / 1000 / 60);
    return { 
      success: false, 
      error: `Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`,
      rateLimited: true
    };
  }

  await destroySession(); // Garantir que a sessão anterior seja destruída
  let redirectPath = "/dashboard"; // Default fallback

  try {
    const rawData = {
      email: sanitizeInput(formData.get("email") as string || ""),
      password: formData.get("password") as string || "",
    };

    // Verificar tentativas de injeção
    if (detectInjectionAttempt(rawData.email)) {
      console.warn("Tentativa de injeção detectada:", sanitizeForLog({ request: requestId, email: rawData.email }));
      return { 
        success: false, 
        error: "Dados inválidos detectados",
        securityViolation: true
      };
    }

    // Validar dados com schema robusto
    const validatedData = loginSchema.parse(rawData);

    try {
      // Try login with API
      const response = await loginUser(validatedData);

      if (!response || !response.data) {
        console.warn("Login falhou:", sanitizeForLog({ request: requestId, email: validatedData.email }));
        return { success: false, error: "Credenciais inválidas" };
      }

      // Validar estrutura da resposta
      if (!response.data.user || !response.data.token) {
        console.error("Resposta de login malformada:", sanitizeForLog(response));
        return { success: false, error: "Erro interno do servidor" };
      }

      // Login bem sucedido
      try {
        await createSession(response.data.token, response.data.user);
      } catch (sessionError) {
        console.error("Erro ao criar sessão:", sessionError);
        return { success: false, error: "Erro ao criar sessão" };
      }

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

      console.log("Login realizado com sucesso:", sanitizeForLog({ 
        request: requestId, 
        userType: response.data.user.userType,
        userId: response.data.user.id
      }));

      // Redirecionar apenas em caso de sucesso
      redirect(redirectPath);
    } catch (apiError: any) {
      console.warn("Erro na API de login:", sanitizeForLog({ 
        request: requestId, 
        error: apiError.message,
        email: validatedData.email
      }));
      
      // Handle API errors separately
      return {
        success: false,
        error: apiError.message || "Credenciais inválidas",
      };
    }
  } catch (error: any) {
    console.error("Erro geral no login:", sanitizeForLog({ 
      request: requestId, 
      error: error.message 
    }));

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

// Server Action melhorado para logout
export async function logoutAction() {
  try {
    await destroySession();
    console.log("Logout realizado:", sanitizeForLog({ 
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Erro no logout:", error);
  }
  redirect("/login");
}

// Server Action para verificar email com validação
export async function checkEmailAction(email: string) {
  try {
    const sanitizedEmail = sanitizeInput(email);
    
    // Verificar tentativas de injeção
    if (detectInjectionAttempt(sanitizedEmail)) {
      return { available: false, error: "Email inválido" };
    }

    // Validar formato do email
    const validatedEmail = emailSchema.parse(sanitizedEmail);
    
    const response = await checkEmail(validatedEmail);
    return response;
  } catch (error: any) {
    return { available: false, error: "Erro ao verificar email" };
  }
}

// Server Action para verificar CPF/CNPJ com validação
export async function checkCpfCnpjAction(cpf_cnpj: string) {
  try {
    const sanitizedCpfCnpj = sanitizeInput(cpf_cnpj);
    
    // Verificar tentativas de injeção
    if (detectInjectionAttempt(sanitizedCpfCnpj)) {
      return { available: false, error: "CPF/CNPJ inválido" };
    }

    // Validação básica de formato
    if (!/^[\d.\-/\s]+$/.test(sanitizedCpfCnpj)) {
      return { available: false, error: "CPF/CNPJ contém caracteres inválidos" };
    }
    
    const response = await checkCpfCnpj(sanitizedCpfCnpj);
    return response;
  } catch (error: any) {
    return { available: false, error: "Erro ao verificar CPF/CNPJ" };
  }
}
