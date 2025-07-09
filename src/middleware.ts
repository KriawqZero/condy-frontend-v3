import { SessionData } from "@/types";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: "condy-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 4, // Reduzido para 4 horas por segurança
  },
};

// Rotas que requerem autenticação
const protectedRoutes = [
  "/sindico",
  "/admin",
  "/empresa",
  "/prestador",
];

// Rotas de admin que requerem permissão específica
const adminRoutes = ["/admin"];

// Rotas por tipo de usuário
const routesByUserType = {
  SINDICO_RESIDENTE: ["/sindico"],
  SINDICO_PROFISSIONAL: ["/sindico"],
  EMPRESA: ["/empresa"],
  PRESTADOR: ["/prestador"],
  ADMIN_PLATAFORMA: ["/admin"],
};

// Rate limiting simples por IP
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por janela

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Pode ser mais restritivo conforme necessário
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.whatsapp.com https://wa.me",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // HSTS sempre ativo por segurança
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  
  return response;
}

function validateRequest(request: NextRequest): boolean {
  // Verificar se a requisição vem de uma origem válida
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  
  // Bloquear requisições sem User-Agent (possível bot malicioso)
  if (!userAgent) {
    return false;
  }
  
  // Verificar se contém padrões suspeitos
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /spider/i,
    /crawler/i
  ];
  
  // Permitir bots legítimos mas bloquear ferramentas de linha de comando
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !isAllowedBot) {
    return false;
  }
  
  return true;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";

  // Aplicar rate limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { 
      status: 429,
      headers: {
        "Retry-After": "900" // 15 minutos
      }
    });
  }

  // Validar requisição
  if (!validateRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Permitir acesso a rotas públicas
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/consulta" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  try {
    // Obter sessão
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );

    // Verificar se é uma rota protegida
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      // Verificar se usuário está logado
      if (!session.isLoggedIn || !session.user) {
        const loginResponse = NextResponse.redirect(new URL("/login", request.url));
        return addSecurityHeaders(loginResponse);
      }

      // Verificar se o token ainda é válido (verificação adicional de segurança)
      if (!session.token || session.token.length < 10) {
        const loginResponse = NextResponse.redirect(new URL("/login", request.url));
        return addSecurityHeaders(loginResponse);
      }

      // Verificar permissões por tipo de usuário
      const userType = session.user.userType;
      const allowedRoutes = routesByUserType[userType];

      if (!allowedRoutes) {
        const loginResponse = NextResponse.redirect(new URL("/login", request.url));
        return addSecurityHeaders(loginResponse);
      }

      // Verificar se o usuário tem acesso a esta rota específica
      const hasAccess = allowedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!hasAccess) {
        // Para admins, sempre redirecionar para /admin se não tiver acesso à rota atual
        if (userType === 'ADMIN_PLATAFORMA') {
          const adminResponse = NextResponse.redirect(new URL("/admin", request.url));
          return addSecurityHeaders(adminResponse);
        }
        
        // Para outros usuários, redirecionar para a rota padrão do tipo
        const defaultRoute = allowedRoutes[0];
        const defaultResponse = NextResponse.redirect(new URL(defaultRoute, request.url));
        return addSecurityHeaders(defaultResponse);
      }
    }

    return addSecurityHeaders(response);
  } catch (error) {
    console.error("Middleware security error:", error);
    const errorResponse = NextResponse.redirect(new URL("/login", request.url));
    return addSecurityHeaders(errorResponse);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) 
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
