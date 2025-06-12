'use server';

import { checkCpfCnpj, checkEmail, loginUser } from '@/lib/api';
import { createSession, destroySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string(),
  user_type: z.enum(['SINDICO_RESIDENTE', 'SINDICO_PROFISSIONAL', 'ADMIN_IMOVEIS', 'PRESTADOR', 'ADMIN_PLATAFORMA']),
  data_nascimento: z.string().optional(),
  email_pessoal: z.string().email().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Senhas não coincidem",
  path: ["password_confirmation"],
});

// Server Action para login
export async function loginAction(formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = loginSchema.parse(rawData);
    
    const response = await loginUser(validatedData);
    console.log('Login response:', response);
    
    if (response) {
      await createSession(response.token, response.user);
      console.log('Usuário logado:', response.user);
      // Redirecionar baseado no tipo de usuário
      switch (response.user.userType) {
        case 'ADMIN_PLATAFORMA':
          redirect('/admin');
        case 'SINDICO_RESIDENTE':
        case 'SINDICO_PROFISSIONAL':
          redirect('/sindico');
        case 'EMPRESA':
          redirect('/empresa');
        case 'PRESTADOR':
          redirect('/prestador');
        default:
          redirect('/dashboard');
      }
    }
    
    return { success: false, error: 'Credenciais inválidas' };
    
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
  redirect('/login');
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