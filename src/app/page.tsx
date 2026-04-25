import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ja-JP", { dateStyle: "short" });

export default async function Home() {
  const [genres, ideaCountsByType, ideas] = await Promise.all([
    prisma.genre.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { types: true } } },
    }),
    prisma.idea.groupBy({
      by: ["typeId"],
      _count: { _all: true },
    }),
    prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { displayName: true } },
        type: { select: { id: true, label: true, genreId: true, genre: { select: { emoji: true, label: true } } } },
        _count: { select: { comments: true, reactions: true, interests: true } },
      },
      take: 10,
    }),
  ]);

  const ideaCountByGenre = new Map<string, number>();
  for (const row of ideaCountsByType) {
    const genreId = row.typeId.split("-")[0];
    ideaCountByGenre.set(genreId, (ideaCountByGenre.get(genreId) ?? 0) + row._count._all);
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">🌱 Tane</h1>
        <p className="mt-2 text-sm text-zinc-500">
          世界のアイデアの脳みそ。種を蒔いて、みんなで育てる。
        </p>
        <Link
          href="/new"
          className="mt-5 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          + 種を蒔く
        </Link>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">ジャンルから探す</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/g/${g.id}`}
              className="rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <div className="text-2xl">{g.emoji}</div>
              <div className="mt-1 font-semibold">{g.label}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {g._count.types}タイプ · {ideaCountByGenre.get(g.id) ?? 0}アイデア
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">最近の種</h2>
        {ideas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
            まだ種が蒔かれていません。
            <br />
            最初の一粒を蒔いてみませんか？
          </div>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => {
              const typeSlug = idea.type.id.replace(`${idea.type.genreId}-`, "");
              const author = idea.author?.displayName ?? idea.authorName ?? "匿名";
              return (
                <li key={idea.id}>
                  <Link
                    href={`/idea/${idea.id}`}
                    className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
                      <span>
                        {idea.type.genre.emoji} {idea.type.genre.label}
                      </span>
                      <span>›</span>
                      <span>{idea.type.label}</span>
                      <span>·</span>
                      <span>{dateFmt.format(idea.createdAt)}</span>
                      <span>·</span>
                      <span>{author}</span>
                    </div>
                    <h3 className="font-semibold">{idea.title}</h3>
                    {idea.body && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {idea.body}
                      </p>
                    )}
                    <div className="mt-2 flex gap-3 text-xs text-zinc-500">
                      <span>💬 {idea._count.comments}</span>
                      <span>🌱 {idea._count.reactions}</span>
                      <span>🤝 {idea._count.interests}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
