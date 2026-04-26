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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link
        href="/"
        className="font-hand text-sm text-soil-faint hover:text-sprout transition-colors"
      >
        ← ホームに戻る
      </Link>
      <header className="mt-5 mb-8">
        <div className="text-3xl">🛠</div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-soil">タイプ管理</h1>
        <p className="mt-2 font-hand text-sm text-soil-faint">
          新しいタイプを追加できます
        </p>
      </header>

      {sp.ok && (
        <div
          className="mb-5 rounded-[10px_12px_10px_12px] border p-3 font-hand text-sm"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, var(--bg-raised))",
            borderColor: "color-mix(in srgb, var(--accent) 40%, var(--line))",
            color: "var(--accent)",
          }}
        >
          🌱 タイプを追加しました
        </div>
      )}
      {sp.error && ERRORS[sp.error] && (
        <div
          className="mb-5 rounded-[10px_12px_10px_12px] border p-3 font-hand text-sm"
          style={{
            background: "color-mix(in srgb, var(--berry) 10%, var(--bg-raised))",
            borderColor: "color-mix(in srgb, var(--berry) 40%, var(--line))",
            color: "var(--berry)",
          }}
        >
          {ERRORS[sp.error]}
        </div>
      )}

      <section className="paper-card-flat mb-10 p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-soil">タイプを追加</h2>
        <form action={createType} className="space-y-4">
          <div>
            <label
              htmlFor="genreId"
              className="mb-2 block font-hand text-sm text-soil-mid"
            >
              ジャンル <span className="text-berry">*</span>
            </label>
            <select id="genreId" name="genreId" required className="input-paper">
              <option value="">選択してください</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="label"
              className="mb-2 block font-hand text-sm text-soil-mid"
            >
              ラベル <span className="text-berry">*</span>
            </label>
            <input
              id="label"
              name="label"
              required
              maxLength={40}
              placeholder="例：王様ゲーム"
              className="input-paper"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block font-hand text-sm text-soil-mid"
            >
              スラッグ（URL用） <span className="text-berry">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              maxLength={40}
              placeholder="例：king-game"
              className="input-paper"
            />
            <p className="mt-2 font-hand text-xs text-soil-faint">
              半角英小文字・数字・ハイフンのみ
            </p>
          </div>

          <button type="submit" className="btn-primary w-full">
            🌱 追加
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-title mb-4">現在のタクソノミー</h2>
        <div className="space-y-4">
          {genres.map((g) => (
            <div key={g.id} className="paper-card-flat p-5">
              <h3 className="mb-3 flex items-center justify-between font-serif text-base font-bold text-soil">
                <span>
                  {g.emoji} {g.label}
                </span>
                <span className="font-hand text-xs text-soil-faint">{g.id}</span>
              </h3>
              {g.types.length === 0 ? (
                <p className="font-hand text-sm text-soil-faint">タイプなし</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {g.types.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between border-b border-line-soft pb-1.5 last:border-0 last:pb-0"
                    >
                      <span className="text-soil">{t.label}</span>
                      <span className="font-hand text-xs text-soil-faint">{t.id}</span>
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
