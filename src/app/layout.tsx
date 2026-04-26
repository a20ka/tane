import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Serif_JP, Noto_Sans_JP, Klee_One } from "next/font/google";
import "./globals.css";
import { isAdmin, getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site";
import { adminLogout } from "./admin/login/actions";
import { signout } from "./(auth)/signin/actions";
import { Logo } from "@/components/Logo";

const serif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});
const sans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});
const hand = Klee_One({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-klee",
  display: "swap",
});

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
    <html
      lang="ja"
      className={`h-full antialiased ${serif.variable} ${sans.variable} ${hand.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <header className="mx-auto w-full max-w-3xl px-6 pt-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-soil hover:text-sprout transition-colors">
              <Logo size={28} />
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <span className="font-hand text-soil-mid">
                    {user.displayName} さん
                  </span>
                  <form action={signout}>
                    <button type="submit" className="text-soil-faint hover:text-sprout transition-colors">
                      ログアウト
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-soil-mid hover:text-sprout transition-colors">
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary"
                    style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
                  >
                    はじめる
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="mx-auto w-full max-w-3xl px-6 pb-8 pt-12">
          <hr className="ruled-divider" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-hand text-soil-faint">
              🌱 種を蒔いて、みんなで育てる場所
            </span>
            {admin ? (
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="font-hand text-soil-faint hover:text-sprout transition-colors"
                >
                  管理者 · ログアウト
                </button>
              </form>
            ) : (
              <Link
                href="/admin/login"
                className="font-hand text-soil-faint hover:text-sprout transition-colors"
              >
                管理者
              </Link>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
