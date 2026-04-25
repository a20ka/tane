import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "tane_admin";

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

export function makeAdminToken(): string {
  const value = `1.${Date.now()}`;
  return `${value}.${sign(value)}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [a, b, sig] = parts;
  const expected = sign(`${a}.${b}`);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyAdminToken(c.get(ADMIN_COOKIE)?.value);
}
