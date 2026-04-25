"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { USER_COOKIE, makeUserToken } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  const errors: string[] = [];
  if (!EMAIL_RE.test(email)) errors.push("正しいメールアドレスを入力してください");
  if (password.length < 8) errors.push("パスワードは8文字以上にしてください");
  if (!displayName || displayName.length > 40)
    errors.push("表示名は1〜40文字で入力してください");

  if (errors.length) {
    redirect(`/signup?error=${encodeURIComponent(errors.join("／"))}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/signup?error=${encodeURIComponent("このメールアドレスは既に登録されています")}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
    select: { id: true },
  });

  const c = await cookies();
  c.set(USER_COOKIE, makeUserToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}
