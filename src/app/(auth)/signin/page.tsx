import Link from "next/link";
import { signin } from "./actions";
import { SproutMark } from "@/components/Logo";

export const metadata = { title: "ログイン", robots: { index: false } };

export default async function SigninPage({
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
        <h1 className="font-serif text-2xl font-bold text-soil">おかえりなさい</h1>
        <p className="mt-2 font-hand text-sm text-soil-faint">
          あなたが蒔いた種が待っています
        </p>
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
          メールアドレスまたはパスワードが正しくありません
        </div>
      )}

      <form action={signin} className="paper-card-flat space-y-4 p-6">
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
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input-paper"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          ログイン
        </button>
      </form>
      <p className="mt-5 text-center font-hand text-sm text-soil-faint">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-sprout underline">
          新規登録
        </Link>
      </p>
    </main>
  );
}
