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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 戻る
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">🌱 種を蒔く</h1>

      <form action={createIdea} className="space-y-5">
        <div>
          <label htmlFor="typeId" className="mb-1 block text-sm font-medium">
            ジャンル / タイプ <span className="text-rose-500">*</span>
          </label>
          <select
            id="typeId"
            name="typeId"
            required
            defaultValue={preselectedType}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
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
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            タイトル <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={140}
            placeholder="一言でアイデアの種を"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1 block text-sm font-medium">
            中身（任意）
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            placeholder="ぼんやりした思いつきでOK。完成度は低くてかまいません。"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>

        {user ? (
          <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            投稿者：<span className="font-medium">{user.displayName}</span>
          </div>
        ) : (
          <div>
            <label htmlFor="authorName" className="mb-1 block text-sm font-medium">
              名前（任意）
            </label>
            <input
              id="authorName"
              name="authorName"
              maxLength={40}
              placeholder="未入力なら匿名"
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
            <p className="mt-1 text-xs text-zinc-500">
              <Link href="/signup" className="underline">
                登録
              </Link>{" "}
              すると名前にプロフィールが付き、他のユーザーから「形にしたい」と声がかかる可能性が増えます。
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-zinc-900 py-2.5 font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          蒔く
        </button>
      </form>
    </main>
  );
}
