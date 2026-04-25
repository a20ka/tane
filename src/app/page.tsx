import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { findCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function Home() {
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true, reactions: true } } },
    take: 50,
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">🌱 Tane</h1>
          <p className="mt-1 text-sm text-zinc-500">
            未完成のアイデアを蒔いて、みんなで育てる場所
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          + 種を蒔く
        </Link>
      </header>

      {ideas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          まだ種が蒔かれていません。
          <br />
          最初の一粒を蒔いてみませんか？
        </div>
      ) : (
        <ul className="space-y-3">
          {ideas.map((idea) => {
            const cat = findCategory(idea.category);
            return (
              <li key={idea.id}>
                <Link
                  href={`/idea/${idea.id}`}
                  className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
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
                  <h2 className="font-semibold">{idea.title}</h2>
                  {idea.body && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {idea.body}
                    </p>
                  )}
                  <div className="mt-2 flex gap-3 text-xs text-zinc-500">
                    <span>💬 {idea._count.comments}</span>
                    <span>🌱 {idea._count.reactions}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
