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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link href="/" className="font-hand text-sm text-soil-faint hover:text-sprout transition-colors">
        ← ホームに戻る
      </Link>

      <header className="mt-4 mb-10">
        <div className="text-5xl">{genre.emoji}</div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-soil">{genre.label}</h1>
        <p className="mt-2 font-hand text-sm text-soil-faint">
          {ideas.length}つの種が蒔かれています
        </p>
      </header>

      <section className="mb-12">
        <h2 className="section-title mb-4">タイプから探す</h2>
        <div className="flex flex-wrap gap-2">
          {genre.types.map((t) => {
            const typeSlug = t.id.replace(`${genre.id}-`, "");
            return (
              <Link
                key={t.id}
                href={`/g/${genre.id}/${typeSlug}`}
                className="btn-ghost font-hand"
              >
                {t.label}
                <span className="text-soil-faint">／{t._count.ideas}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">{genre.label}の種</h2>
        {ideas.length === 0 ? (
          <div className="empty-paper">
            <p className="text-base">このジャンルにはまだ種がありません</p>
            <p className="mt-2 text-sm">最初の一粒をあなたから</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {ideas.map((idea) => {
              const author = idea.author?.displayName ?? idea.authorName ?? "名もなき種人";
              return (
                <li key={idea.id}>
                  <Link href={`/idea/${idea.id}`} className="paper-card group block p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 font-hand text-xs text-soil-faint">
                      <span className="text-sprout">{idea.type.label}</span>
                      <span className="text-line">|</span>
                      <span>{dateFmt.format(idea.createdAt)}</span>
                      <span className="text-line">|</span>
                      <span>{author}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-soil group-hover:text-sprout transition-colors">
                      {idea.title}
                    </h3>
                    {idea.body && (
                      <p className="mt-2 line-clamp-2 text-sm text-soil-mid">{idea.body}</p>
                    )}
                    <div className="mt-3 flex gap-4 font-hand text-xs text-soil-faint">
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
