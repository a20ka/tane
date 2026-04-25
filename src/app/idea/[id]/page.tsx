import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findCategory, REACTIONS } from "@/lib/categories";
import { addComment, addReaction, deleteComment, deleteIdea } from "@/lib/actions";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "short",
  timeStyle: "short",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { title: true, body: true, category: true },
  });
  if (!idea) return { title: "見つかりません", robots: { index: false } };
  const cat = findCategory(idea.category);
  const desc = (idea.body ?? "").trim().slice(0, 160) || `${cat.label}カテゴリのアイデア`;
  return {
    title: idea.title,
    description: desc,
    openGraph: { title: idea.title, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: idea.title, description: desc },
    alternates: { canonical: `/idea/${id}` },
  };
}

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
      reactions: true,
    },
  });

  if (!idea) notFound();

  const cat = findCategory(idea.category);
  const reactionCounts: Record<string, number> = Object.fromEntries(
    REACTIONS.map((r) => [r.id, idea.reactions.filter((x) => x.type === r.id).length])
  );
  const admin = await isAdmin();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← タイムラインに戻る
      </Link>

      <article className="mt-4">
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
          <span>
            {cat.emoji} {cat.label}
          </span>
          <span>·</span>
          <span>{dateFmt.format(idea.createdAt)}</span>
          {idea.authorName && (
            <>
              <span>·</span>
              <span>{idea.authorName}</span>
            </>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold">{idea.title}</h1>
        {idea.body && (
          <p className="mt-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {idea.body}
          </p>
        )}

        {admin && (
          <form action={deleteIdea} className="mt-4">
            <input type="hidden" name="id" value={idea.id} />
            <button
              type="submit"
              className="rounded-md border border-rose-300 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              🗑 この投稿を削除
            </button>
          </form>
        )}
      </article>

      <section className="mt-8 flex flex-wrap gap-2">
        {REACTIONS.map((r) => (
          <form key={r.id} action={addReaction}>
            <input type="hidden" name="ideaId" value={idea.id} />
            <input type="hidden" name="type" value={r.id} />
            <button
              type="submit"
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {r.emoji} {r.label}{" "}
              <span className="text-zinc-500">{reactionCounts[r.id]}</span>
            </button>
          </form>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-semibold">育てる ({idea.comments.length})</h2>
        <ul className="mb-6 space-y-3">
          {idea.comments.map((c) => (
            <li
              key={c.id}
              className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900"
            >
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {c.authorName ?? "匿名"} · {dateFmt.format(c.createdAt)}
                </span>
                {admin && (
                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <button
                      type="submit"
                      className="text-rose-500 hover:underline"
                      aria-label="コメントを削除"
                    >
                      削除
                    </button>
                  </form>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm">{c.body}</p>
            </li>
          ))}
        </ul>

        <form action={addComment} className="space-y-2">
          <input type="hidden" name="ideaId" value={idea.id} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="アイデアに肉付けや派生を..."
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
          <div className="flex gap-2">
            <input
              name="authorName"
              maxLength={40}
              placeholder="名前（任意）"
              className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
            >
              育てる
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
