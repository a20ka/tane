import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ja-JP", { dateStyle: "short" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}): Promise<Metadata> {
  const { genre: genreId } = await params;
  const genre = await prisma.genre.findUnique({ where: { id: genreId } });
  if (!genre) return { title: "見つかりません" };
  return {
    title: `${genre.emoji} ${genre.label}`,
    description: `Tane の ${genre.label} ジャンルのアイデアの種`,
    alternates: { canonical: `/g/${genreId}` },
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre: genreId } = await params;
  const genre = await prisma.genre.findUnique({
    where: { id: genreId },
    include: {
      types: {
        orderBy: { order: "asc" },
        include: { _count: { select: { ideas: true } } },
      },
    },
  });
  if (!genre) notFound();

  const ideas = await prisma.idea.findMany({
    where: { type: { genreId } },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { displayName: true } },
      type: { select: { id: true, label: true, genreId: true } },
      _count: { select: { comments: true, reactions: true, interests: true } },
    },
    take: 30,
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← ホーム
      </Link>

      <header className="mt-3 mb-8">
        <div className="text-4xl">{genre.emoji}</div>
        <h1 className="mt-2 text-2xl font-bold">{genre.label}</h1>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">タイプから探す</h2>
        <div className="flex flex-wrap gap-2">
          {genre.types.map((t) => {
            const typeSlug = t.id.replace(`${genre.id}-`, "");
            return (
              <Link
                key={t.id}
                href={`/g/${genre.id}/${typeSlug}`}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                {t.label}{" "}
                <span className="text-zinc-500">{t._count.ideas}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">
          {genre.label}の種（最新{ideas.length}件）
        </h2>
        {ideas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
            このジャンルにはまだ種がありません。
          </div>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => {
              const author = idea.author?.displayName ?? idea.authorName ?? "匿名";
              return (
                <li key={idea.id}>
                  <Link
                    href={`/idea/${idea.id}`}
                    className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
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
