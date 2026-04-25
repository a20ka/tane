import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { REACTIONS } from "@/lib/reactions";
import {
  addComment,
  addReaction,
  deleteComment,
  deleteIdea,
  toggleInterest,
} from "@/lib/actions";
import { getCurrentUser, isAdmin } from "@/lib/auth";

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
    select: {
      title: true,
      body: true,
      type: { select: { label: true, genre: { select: { label: true } } } },
    },
  });
  if (!idea) return { title: "見つかりません", robots: { index: false } };
  const desc = (idea.body ?? "").trim().slice(0, 160) || `${idea.type.genre.label}・${idea.type.label}`;
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
      author: { select: { id: true, displayName: true } },
      type: { select: { id: true, label: true, genreId: true, genre: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { displayName: true } } },
      },
      reactions: true,
      interests: {
        include: { user: { select: { displayName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!idea) notFound();

  const [user, admin] = await Promise.all([getCurrentUser(), isAdmin()]);
  const reactionCounts: Record<string, number> = Object.fromEntries(
    REACTIONS.map((r) => [r.id, idea.reactions.filter((x) => x.type === r.id).length])
  );
  const augments = idea.comments.filter((c) => c.isAugment);
  const comments = idea.comments.filter((c) => !c.isAugment);
  const myInterest = user
    ? idea.interests.find((i) => i.user.displayName === user.displayName)
    : null;
  const author = idea.author?.displayName ?? idea.authorName ?? "匿名";
  const typeSlug = idea.type.id.replace(`${idea.type.genreId}-`, "");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <div className="text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>{" "}
        ›{" "}
        <Link href={`/g/${idea.type.genreId}`} className="hover:underline">
          {idea.type.genre.emoji} {idea.type.genre.label}
        </Link>{" "}
        ›{" "}
        <Link href={`/g/${idea.type.genreId}/${typeSlug}`} className="hover:underline">
          {idea.type.label}
        </Link>
      </div>

      <article className="mt-4">
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
          <span>{dateFmt.format(idea.createdAt)}</span>
          <span>·</span>
          <span>{author}</span>
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

      <section className="mt-10 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            🤝 形にしたい人 ({idea.interests.length})
          </h2>
        </div>
        {idea.interests.length > 0 && (
          <ul className="mt-3 space-y-2">
            {idea.interests.map((s) => (
              <li key={s.id} className="text-sm">
                <span className="font-medium">{s.user.displayName}</span>
                {s.message && (
                  <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                    — {s.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {user ? (
          <form action={toggleInterest} className="mt-3 space-y-2">
            <input type="hidden" name="ideaId" value={idea.id} />
            {!myInterest && (
              <input
                name="message"
                maxLength={140}
                placeholder="どう形にしたいか一言（任意）"
                className="w-full rounded-md border border-emerald-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-emerald-800"
              />
            )}
            <button
              type="submit"
              className={
                myInterest
                  ? "rounded-full border border-emerald-400 px-4 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                  : "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              }
            >
              {myInterest ? "✓ 形にしたい (取り消す)" : "🤝 形にしたい"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/signin" className="underline">
              ログイン
            </Link>{" "}
            すると「形にしたい」を表明できます。
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-semibold">🌿 肉付け ({augments.length})</h2>
        {augments.length === 0 && (
          <p className="mb-3 text-sm text-zinc-500">
            まだ肉付けされていません。具体化のアイデアを足してみませんか？
          </p>
        )}
        <ul className="mb-4 space-y-3">
          {augments.map((c) => {
            const aname = c.author?.displayName ?? c.authorName ?? "匿名";
            return (
              <li
                key={c.id}
                className="rounded-md border-l-4 border-emerald-400 bg-emerald-50/40 p-3 dark:bg-emerald-950/10"
              >
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {aname} · {dateFmt.format(c.createdAt)}
                  </span>
                  {admin && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="ideaId" value={idea.id} />
                      <button type="submit" className="text-rose-500 hover:underline">
                        削除
                      </button>
                    </form>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              </li>
            );
          })}
        </ul>
        <form action={addComment} className="space-y-2">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input type="hidden" name="kind" value="augment" />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="このアイデアを具体化する提案を..."
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
          {!user && (
            <input
              name="authorName"
              maxLength={40}
              placeholder="名前（任意）"
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
          )}
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            肉付けする
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-semibold">💬 コメント ({comments.length})</h2>
        <ul className="mb-4 space-y-3">
          {comments.map((c) => {
            const aname = c.author?.displayName ?? c.authorName ?? "匿名";
            return (
              <li key={c.id} className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {aname} · {dateFmt.format(c.createdAt)}
                  </span>
                  {admin && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="ideaId" value={idea.id} />
                      <button type="submit" className="text-rose-500 hover:underline">
                        削除
                      </button>
                    </form>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              </li>
            );
          })}
        </ul>
        <form action={addComment} className="space-y-2">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input type="hidden" name="kind" value="comment" />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="感想・雑談・ひらめき..."
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
          {!user && (
            <input
              name="authorName"
              maxLength={40}
              placeholder="名前（任意）"
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
          )}
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            コメントする
          </button>
        </form>
      </section>
    </main>
  );
}
