"use server";
import { SessionData } from "@/types";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { validateTokenFormat } from "./security";

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: "condy-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 4, // 4 horas por segurança
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  // Verificar se a sessão é válida
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  // Verificar se o token ainda é válido
  if (session.token && !validateTokenFormat(session.token)) {
    // Token inválido, limpar sessão
    session.isLoggedIn = false;
    session.token = undefined;
    session.user = undefined;
    await session.save();
  }

  return session;
}

export async function createSession(token: string, user: any) {
  // Validar dados antes de criar sessão
  if (!token || !user || !validateTokenFormat(token)) {
    throw new Error("Dados de sessão inválidos");
  }

  // Validar dados do usuário
  if (!user.id || !user.email || !user.userType) {
    throw new Error("Dados de usuário incompletos");
  }

  const session = await getSession();

  // Limpar sessão anterior por segurança
  session.destroy();

  // Criar nova sessão
  const newSession = await getSession();
  newSession.token = token;
  newSession.user = {
    id: user.id,
    name: user.name || "",
    email: user.email,
    cpfCnpj: user.cpfCnpj || "",
    whatsapp: user.whatsapp || "",
    userType: user.userType,
    dataNascimento: user.dataNascimento
  };
  newSession.isLoggedIn = true;

  await newSession.save();
  return newSession;
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

export async function refreshSession() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.token) {
    return false;
  }

  // Verificar se a sessão ainda é válida
  if (!validateTokenFormat(session.token)) {
    await destroySession();
    return false;
  }

  // Renovar timestamp da sessão
  await session.save();
  return true;
}

export async function validateSession(): Promise<boolean> {
  const session = await getSession();
  
  return !!(
    session.isLoggedIn &&
    session.token &&
    session.user &&
    validateTokenFormat(session.token)
  );
}
