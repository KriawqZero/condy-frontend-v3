import { z } from "zod";

// Schemas de validação robustos
export const emailSchema = z.string()
  .email("Email inválido")
  .min(1, "Email é obrigatório")
  .max(254, "Email muito longo")
  .refine((email: string) => {
    // Verificação adicional contra emails maliciosos
    const suspiciousPatterns = [
      /script/i,
      /<.*>/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }, "Email contém caracteres inválidos");

export const passwordSchema = z.string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha muito longa")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
    "Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número");

export const nameSchema = z.string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome muito longo")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos");

export const cpfCnpjSchema = z.string()
  .min(11, "CPF/CNPJ inválido")
  .max(18, "CPF/CNPJ inválido")
  .regex(/^[\d.\-/]+$/, "CPF/CNPJ deve conter apenas números, pontos, hífens e barras");

// Função para sanitizar HTML e prevenir XSS
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
    '=': '&#61;'
  };
  
  return input.replace(/[&<>"'`=/]/g, (s) => map[s] || s);
}

// Função para sanitizar entrada de texto geral
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // Remove scripts, tags HTML e caracteres suspeitos
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Rate limiting simples no lado do cliente
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove tentativas antigas
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }

  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeLeft = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, timeLeft);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 tentativas em 15 minutos

// Função para gerar nonce para CSP
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Função para validar origem da requisição
export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

// Função para remover dados sensíveis dos logs
export function sanitizeForLog(obj: any): any {
  if (!obj) return obj;
  
  const sensitiveFields = ['password', 'token', 'senha', 'cpf', 'cnpj', 'email'];
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

// Função para detectar tentativas de injeção
export function detectInjectionAttempt(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /eval\(/i,
    /expression\(/i,
    /url\(/i,
    /import\(/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Função para validar tokens JWT de forma mais segura
export function validateTokenFormat(token: string): boolean {
  if (!token) return false;
  
  // JWT deve ter 3 partes separadas por pontos
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Cada parte deve ser base64 válido
  try {
    parts.forEach(part => {
      if (part.length === 0) throw new Error('Empty part');
      // Adiciona padding se necessário
      const padded = part + '='.repeat((4 - part.length % 4) % 4);
      atob(padded);
    });
    return true;
  } catch {
    return false;
  }
}

// Função para criar fingerprint do dispositivo
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Security fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Hash simples do fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(36);
}