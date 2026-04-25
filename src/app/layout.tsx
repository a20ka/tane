import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { isAdmin, getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site";
import { adminLogout } from "./admin/login/actions";
import { signout } from "./(auth)/signin/actions";

const SITE_URL = getSiteUrl();
const SITE_NAME = "Tane";
const SITE_TITLE = "Tane — 世界のアイデアの脳みそ";
const SITE_DESCRIPTION =
  "物語・映画・ゲーム・体験・夢など、まだ完璧じゃないアイデアの種を蒔いて、みんなで育てて形にする場所。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "アイデア",
    "アイデア共有",
    "ブレスト",
    "創作",
    "物語",
    "映画",
    "ゲーム",
    "夢",
    "Tane",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "zESACKIFzUPixrZwZH7ckO3tUMakEpWWcDMThd5Y7KA",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [admin, user] = await Promise.all([isAdmin(), getCurrentUser()]);
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="mx-auto w-full max-w-3xl px-6 pt-4">
          <nav className="flex items-center justify-between text-sm">
            <Link href="/" className="font-bold text-base">
              🌱 Tane
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {user.displayName} さん
                  </span>
                  <form action={signout}>
                    <button type="submit" className="text-zinc-500 hover:underline">
                      ログアウト
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-zinc-600 hover:underline dark:text-zinc-400">
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        {children}
        <footer className="mx-auto w-full max-w-3xl border-t border-zinc-200 px-6 py-6 text-xs text-zinc-500 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span>🌱 Tane — アイデアの種を育てる場所</span>
            {admin ? (
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  管理者ログイン中 · ログアウト
                </button>
              </form>
            ) : (
              <Link href="/admin/login" className="hover:underline">
                管理者
              </Link>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
