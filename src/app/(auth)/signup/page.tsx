import Link from "next/link";
import { signup } from "./actions";
import { SproutMark } from "@/components/Logo";

export const metadata = { title: "新規登録", robots: { index: false } };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-12">
      <Link
        href="/"
        className="font-hand text-sm text-soil-faint hover:text-sprout transition-colors"
      >
        ← ホームに戻る
      </Link>
      <header className="mt-5 mb-8 text-center">
        <div className="mb-3 inline-flex text-sprout">
          <SproutMark size={48} />
        </div>
        <h1 className="font-serif text-2xl font-bold text-soil">はじめまして</h1>
        <p className="mt-2 font-hand text-sm text-soil-faint">
          あなたの最初の種を蒔きましょう
        </p>
      </header>

      {error && (
        <div
          className="mb-4 rounded-[10px_12px_10px_12px] border p-3 font-hand text-sm"
          style={{
            background: "color-mix(in srgb, var(--berry) 10%, var(--bg-raised))",
            borderColor: "color-mix(in srgb, var(--berry) 40%, var(--line))",
            color: "var(--berry)",
          }}
        >
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={signup} className="paper-card-flat space-y-4 p-6">
        <div>
          <label
            htmlFor="displayName"
            className="mb-2 block font-hand text-sm text-soil-mid"
          >
            表示名
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            maxLength={40}
            placeholder="あなたの名前"
            className="input-paper"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-hand text-sm text-soil-mid"
          >
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-paper"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block font-hand text-sm text-soil-mid"
          >
            パスワード（8文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input-paper"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          🌱 はじめる
        </button>
      </form>
      <p className="mt-5 text-center font-hand text-sm text-soil-faint">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/signin" className="text-sprout underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
