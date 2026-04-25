import Link from "next/link";
import { createIdea } from "@/lib/actions";
import { CATEGORIES } from "@/lib/categories";

export default function NewIdea() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 戻る
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">🌱 種を蒔く</h1>

      <form action={createIdea} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">カテゴリ</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-sm has-[:checked]:bg-zinc-900 has-[:checked]:text-white dark:border-zinc-700 dark:has-[:checked]:bg-zinc-100 dark:has-[:checked]:text-zinc-900"
              >
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  defaultChecked={c.id === "other"}
                  className="sr-only"
                />
                <span>
                  {c.emoji} {c.label}
                </span>
              </label>
            ))}
          </div>
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
        </div>

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
