'use server';
import { SessionData } from '@/types';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: 'condy-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  return session;
}

export async function createSession(token: string, user: any) {
  const session = await getSession();

  session.token = token;
  session.user = user;
  session.isLoggedIn = true;

  await session.save();
}

export async function destroySession() {
  const session = await getSession();

  session.destroy();
}
