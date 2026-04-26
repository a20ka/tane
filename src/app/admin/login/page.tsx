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
      <Link
        href="/"
        className="font-hand text-sm text-soil-faint hover:text-sprout transition-colors"
      >
        ← ホームに戻る
      </Link>
      <header className="mt-5 mb-8 text-center">
        <div className="text-3xl">🔐</div>
        <h1 className="mt-3 font-serif text-2xl font-bold text-soil">管理者ログイン</h1>
      </header>

      {error === "invalid" && (
        <div
          className="mb-4 rounded-[10px_12px_10px_12px] border p-3 font-hand text-sm"
          style={{
            background: "color-mix(in srgb, var(--berry) 10%, var(--bg-raised))",
            borderColor: "color-mix(in srgb, var(--berry) 40%, var(--line))",
            color: "var(--berry)",
          }}
        >
          パスワードが違います
        </div>
      )}
      {error === "missing-password-config" && (
        <div
          className="mb-4 rounded-[10px_12px_10px_12px] border p-3 font-hand text-sm"
          style={{
            background: "color-mix(in srgb, var(--sun) 15%, var(--bg-raised))",
            borderColor: "color-mix(in srgb, var(--sun) 50%, var(--line))",
            color: "var(--fg-muted)",
          }}
        >
          サーバーに ADMIN_PASSWORD が設定されていません
        </div>
      )}

      <form action={adminLogin} className="paper-card-flat space-y-4 p-6">
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="パスワード"
          className="input-paper"
        />
        <button type="submit" className="btn-primary w-full">
          ログイン
        </button>
      </form>
    </main>
  );
}
