"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, makeAdminToken } from "@/lib/auth";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    redirect("/admin/login?error=missing-password-config");
  }
  if (!password || password !== expected) {
    redirect("/admin/login?error=invalid");
  }

  const c = await cookies();
  c.set(ADMIN_COOKIE, makeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function adminLogout() {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
  redirect("/");
}
