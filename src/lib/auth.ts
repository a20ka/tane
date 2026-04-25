import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";

export const ADMIN_COOKIE = "tane_admin";
export const USER_COOKIE = "tane_user";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET is missing or too short. Set it in .env (32+ chars).");
  }
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [a, b, sig] = parts;
  const expected = sign(`${a}.${b}`);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }
  return a;
}

// --- Admin session ---

export function makeAdminToken(): string {
  const value = `1.${Date.now()}`;
  return `${value}.${sign(value)}`;
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyToken(c.get(ADMIN_COOKIE)?.value) === "1";
}

// --- User session ---

export function makeUserToken(userId: string): string {
  const value = `${userId}.${Date.now()}`;
  return `${value}.${sign(value)}`;
}

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const userId = verifyToken(c.get(USER_COOKIE)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, bio: true },
  });
  return user;
}
