import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createIdea } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "種を蒔く" };

export default async function NewIdea({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [genres, user, sp] = await Promise.all([
    prisma.genre.findMany({
      orderBy: { order: "asc" },
      include: { types: { orderBy: { order: "asc" } } },
    }),
    getCurrentUser(),
    searchParams,
  ]);

  const preselectedType = sp.type ?? "";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link
        href="/"
        className="font-hand text-sm text-soil-faint hover:text-sprout transition-colors"
      >
        ← ホームに戻る
      </Link>
      <header className="mt-4 mb-8">
        <div className="text-4xl">🌱</div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-soil">種を蒔く</h1>
        <p className="mt-2 font-hand text-sm text-soil-faint">
          ぼんやりした思いつきで大丈夫。誰かが育ててくれます。
        </p>
      </header>

      <form action={createIdea} className="paper-card-flat space-y-5 p-6">
        <div>
          <label
            htmlFor="typeId"
            className="mb-2 block font-hand text-sm text-soil-mid"
          >
            ジャンル / タイプ <span className="text-berry">*</span>
          </label>
          <select
            id="typeId"
            name="typeId"
            required
            defaultValue={preselectedType}
            className="input-paper"
          >
            <option value="">選択してください</option>
            {genres.map((g) => (
              <optgroup key={g.id} label={`${g.emoji} ${g.label}`}>
                {g.types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="title"
            className="mb-2 block font-hand text-sm text-soil-mid"
          >
            タイトル <span className="text-berry">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={140}
            placeholder="一言でアイデアの種を"
            className="input-paper font-serif text-base"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="mb-2 block font-hand text-sm text-soil-mid"
          >
            中身（任意）
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            placeholder="ぼんやりした思いつきでOK。完成度は低くてかまいません。"
            className="input-paper resize-none font-serif"
          />
        </div>

        {user ? (
          <div className="rounded-[10px_12px_10px_12px] border border-line-soft bg-paper p-3 font-hand text-sm text-soil-mid">
            投稿者：<span className="text-soil font-bold">{user.displayName}</span>
          </div>
        ) : (
          <div>
            <label
              htmlFor="authorName"
              className="mb-2 block font-hand text-sm text-soil-mid"
            >
              名前（任意）
            </label>
            <input
              id="authorName"
              name="authorName"
              maxLength={40}
              placeholder="未入力なら匿名"
              className="input-paper"
            />
            <p className="mt-2 font-hand text-xs text-soil-faint">
              <Link href="/signup" className="text-sprout underline">
                登録
              </Link>{" "}
              すると、「形にしたい」と声をかけてもらえる可能性が増えます。
            </p>
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          🌱 蒔く
        </button>
      </form>
    </main>
  );
}
