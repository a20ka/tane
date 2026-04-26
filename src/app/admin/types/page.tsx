import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { createType } from "@/lib/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "タイプ管理", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  missing: "ジャンル・スラッグ・ラベルをすべて入力してください",
  slug: "スラッグは半角英数字とハイフンのみ使えます",
  genre: "選択されたジャンルが存在しません",
  duplicate: "同じスラッグのタイプがすでにあります",
};

export default async function AdminTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const [genres, sp] = await Promise.all([
    prisma.genre.findMany({
      orderBy: { order: "asc" },
      include: { types: { orderBy: { order: "asc" } } },
    }),
    searchParams,
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 戻る
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">🛠 タイプ管理</h1>

      {sp.ok && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          タイプを追加しました
        </div>
      )}
      {sp.error && ERRORS[sp.error] && (
        <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {ERRORS[sp.error]}
        </div>
      )}

      <section className="mb-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 text-base font-semibold">タイプを追加</h2>
        <form action={createType} className="space-y-4">
          <div>
            <label htmlFor="genreId" className="mb-1 block text-sm font-medium">
              ジャンル <span className="text-rose-500">*</span>
            </label>
            <select
              id="genreId"
              name="genreId"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">選択してください</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="label" className="mb-1 block text-sm font-medium">
              ラベル <span className="text-rose-500">*</span>
            </label>
            <input
              id="label"
              name="label"
              required
              maxLength={40}
              placeholder="例：王様ゲーム"
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              スラッグ（URL用） <span className="text-rose-500">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              maxLength={40}
              placeholder="例：king-game"
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
            <p className="mt-1 text-xs text-zinc-500">半角英小文字・数字・ハイフンのみ。ジャンルIDと組み合わせて Type ID になります。</p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 py-2.5 font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            追加
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">現在のタクソノミー</h2>
        <div className="space-y-4">
          {genres.map((g) => (
            <div key={g.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="mb-2 font-medium">
                {g.emoji} {g.label}
                <span className="ml-2 text-xs text-zinc-500">{g.id}</span>
              </h3>
              {g.types.length === 0 ? (
                <p className="text-sm text-zinc-500">タイプなし</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {g.types.map((t) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <span>{t.label}</span>
                      <span className="text-xs text-zinc-500">{t.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
