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
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Lidar com CORS para rotas de API
  if (pathname.startsWith('/api/')) {
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to API responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return response;
  }

  // Permitir acesso a rotas públicas
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/consulta"
  ) {
    return NextResponse.next();
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
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Verificar permissões por tipo de usuário
      const userType = session.user.userType;
      const allowedRoutes = routesByUserType[userType];

      if (!allowedRoutes) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Verificar se o usuário tem acesso a esta rota específica
      const hasAccess = allowedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!hasAccess) {
        // Para admins, sempre redirecionar para /admin se não tiver acesso à rota atual
        if (userType === 'ADMIN_PLATAFORMA') {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        
        // Para outros usuários, redirecionar para a rota padrão do tipo
        const defaultRoute = allowedRoutes[0];
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
