import Link from "next/link";
import { adminLogin } from "./actions";

export const metadata = { title: "管理者ログイン", robots: { index: false, follow: false } };

export default async function AdminLoginPage({
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
      <h1 className="mt-3 mb-6 text-2xl font-bold">🔐 管理者ログイン</h1>

      {error === "invalid" && (
        <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          パスワードが違います
        </div>
      )}
      {error === "missing-password-config" && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          サーバーに ADMIN_PASSWORD が設定されていません
        </div>
      )}

      <form action={adminLogin} className="space-y-3">
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="パスワード"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-zinc-900 py-2.5 font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          ログイン
        </button>
      </form>
    </main>
  );
}
