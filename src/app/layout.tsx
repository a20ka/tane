import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { isAdmin } from "@/lib/auth";
import { adminLogout } from "./admin/login/actions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Tane";
const SITE_TITLE = "Tane — 未完成のアイデアを蒔く";
const SITE_DESCRIPTION =
  "読み物・映画・面白い話・遊びの企画など、まだ完璧じゃないアイデアを共有して、みんなで育てる場所。半端な思いつきでも歓迎。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "アイデア",
    "アイデア共有",
    "ブレスト",
    "創作",
    "読み物",
    "映画",
    "企画",
    "雑談",
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
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await isAdmin();
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
        <footer className="mx-auto w-full max-w-2xl border-t border-zinc-200 px-6 py-6 text-xs text-zinc-500 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span>🌱 Tane</span>
            {admin ? (
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  管理者としてログイン中 · ログアウト
                </button>
              </form>
            ) : (
              <Link href="/admin/login" className="hover:underline">
                管理者ログイン
              </Link>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
