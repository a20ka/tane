import Link from "next/link";
import { signup } from "./actions";

export const metadata = { title: "新規登録", robots: { index: false } };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 戻る
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">🌱 新規登録</h1>

      {error && (
        <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={signup} className="space-y-3">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            表示名
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            maxLength={40}
            placeholder="あなたの名前"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            パスワード（8文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-zinc-900 py-2.5 font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          登録
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-500">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/signin" className="text-zinc-900 hover:underline dark:text-zinc-100">
          ログイン
        </Link>
      </p>
    </main>
  );
}
