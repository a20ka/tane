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
  const author = idea.author?.displayName ?? idea.authorName ?? "名もなき種人";
  const typeSlug = idea.type.id.replace(`${idea.type.genreId}-`, "");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <nav className="font-hand text-sm text-soil-faint">
        <Link href="/" className="hover:text-sprout transition-colors">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <Link
          href={`/g/${idea.type.genreId}`}
          className="hover:text-sprout transition-colors"
        >
          {idea.type.genre.emoji} {idea.type.genre.label}
        </Link>
        <span className="mx-2">›</span>
        <Link
          href={`/g/${idea.type.genreId}/${typeSlug}`}
          className="hover:text-sprout transition-colors"
        >
          {idea.type.label}
        </Link>
      </nav>

      <article className="mt-6 paper-card-flat p-7">
        <div className="flex flex-wrap items-center gap-x-2 font-hand text-xs text-soil-faint">
          <span>📅 {dateFmt.format(idea.createdAt)}</span>
          <span className="text-line">|</span>
          <span>🖋 {author}</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-snug text-soil">
          {idea.title}
        </h1>
        {idea.body && (
          <p className="mt-5 whitespace-pre-wrap font-serif text-base leading-relaxed text-soil">
            {idea.body}
          </p>
        )}

        {admin && (
          <form action={deleteIdea} className="mt-5">
            <input type="hidden" name="id" value={idea.id} />
            <button
              type="submit"
              className="font-hand text-xs text-berry hover:underline"
            >
              🗑 この種を削除
            </button>
          </form>
        )}
      </article>

      <section className="mt-8">
        <h2 className="section-title mb-3">この種に反応する</h2>
        <div className="flex flex-wrap gap-2">
          {REACTIONS.map((r) => (
            <form key={r.id} action={addReaction}>
              <input type="hidden" name="ideaId" value={idea.id} />
              <input type="hidden" name="type" value={r.id} />
              <button type="submit" className="btn-ghost font-hand">
                <span>{r.emoji}</span>
                <span>{r.label}</span>
                <span className="text-soil-faint">／{reactionCounts[r.id]}</span>
              </button>
            </form>
          ))}
        </div>
      </section>

      <section
        className="mt-10 rounded-[14px_16px_13px_17px] border p-5"
        style={{
          background: "color-mix(in srgb, var(--accent) 8%, var(--bg-raised))",
          borderColor: "color-mix(in srgb, var(--accent) 35%, var(--line))",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-soil">
            🤝 形にしたい人 ({idea.interests.length})
          </h2>
        </div>
        {idea.interests.length > 0 && (
          <ul className="mt-4 space-y-2">
            {idea.interests.map((s) => (
              <li key={s.id} className="text-sm">
                <span className="font-serif font-bold text-sprout">
                  {s.user.displayName}
                </span>
                {s.message && (
                  <span className="ml-2 text-soil-mid">— {s.message}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {user ? (
          <form action={toggleInterest} className="mt-4 space-y-3">
            <input type="hidden" name="ideaId" value={idea.id} />
            {!myInterest && (
              <input
                name="message"
                maxLength={140}
                placeholder="どう形にしたいか一言（任意）"
                className="input-paper text-sm"
              />
            )}
            <button
              type="submit"
              className={myInterest ? "btn-ghost" : "btn-primary"}
            >
              {myInterest ? "✓ 形にしたい (取り消す)" : "🤝 形にしたい"}
            </button>
          </form>
        ) : (
          <p className="mt-3 font-hand text-sm text-soil-mid">
            <Link href="/signin" className="text-sprout underline">
              ログイン
            </Link>{" "}
            すると「形にしたい」を表明できます。
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="section-title mb-4">🌿 肉付け ({augments.length})</h2>
        {augments.length === 0 && (
          <p className="mb-4 font-hand text-sm text-soil-faint">
            まだ肉付けされていません。具体化のアイデアを足してみませんか？
          </p>
        )}
        <ul className="mb-6 space-y-3">
          {augments.map((c) => {
            const aname = c.author?.displayName ?? c.authorName ?? "名もなき種人";
            return (
              <li
                key={c.id}
                className="rounded-[10px_12px_10px_12px] border-l-4 p-4"
                style={{
                  borderLeftColor: "var(--accent)",
                  background: "color-mix(in srgb, var(--accent) 6%, var(--bg-raised))",
                }}
              >
                <div className="mb-2 flex items-center justify-between font-hand text-xs text-soil-faint">
                  <span>
                    🌱 {aname} ・ {dateFmt.format(c.createdAt)}
                  </span>
                  {admin && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="ideaId" value={idea.id} />
                      <button
                        type="submit"
                        className="text-berry hover:underline"
                      >
                        削除
                      </button>
                    </form>
                  )}
                </div>
                <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-soil">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
        <form action={addComment} className="space-y-3 paper-card-flat p-5">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input type="hidden" name="kind" value="augment" />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="このアイデアを具体化する提案を..."
            className="input-paper resize-none"
          />
          {!user && (
            <input
              name="authorName"
              maxLength={40}
              placeholder="名前（任意）"
              className="input-paper text-sm"
            />
          )}
          <button type="submit" className="btn-primary">
            🌿 肉付けする
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="section-title mb-4">💬 コメント ({comments.length})</h2>
        <ul className="mb-6 space-y-3">
          {comments.map((c) => {
            const aname = c.author?.displayName ?? c.authorName ?? "名もなき種人";
            return (
              <li
                key={c.id}
                className="rounded-[10px_12px_10px_12px] p-4 paper-card-flat"
              >
                <div className="mb-2 flex items-center justify-between font-hand text-xs text-soil-faint">
                  <span>
                    {aname} ・ {dateFmt.format(c.createdAt)}
                  </span>
                  {admin && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="ideaId" value={idea.id} />
                      <button
                        type="submit"
                        className="text-berry hover:underline"
                      >
                        削除
                      </button>
                    </form>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-soil">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
        <form action={addComment} className="space-y-3 paper-card-flat p-5">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input type="hidden" name="kind" value="comment" />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="感想・雑談・ひらめき..."
            className="input-paper resize-none"
          />
          {!user && (
            <input
              name="authorName"
              maxLength={40}
              placeholder="名前（任意）"
              className="input-paper text-sm"
            />
          )}
          <button type="submit" className="btn-ghost font-serif">
            コメントする
          </button>
        </form>
      </section>
    </main>
  );
}
