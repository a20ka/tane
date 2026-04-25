import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ja-JP", { dateStyle: "short" });

function typeId(genre: string, type: string) {
  return `${genre}-${type}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string; type: string }>;
}): Promise<Metadata> {
  const { genre, type } = await params;
  const t = await prisma.type.findUnique({
    where: { id: typeId(genre, type) },
    include: { genre: true },
  });
  if (!t) return { title: "見つかりません" };
  return {
    title: `${t.label}（${t.genre.label}）`,
    description: `Tane の ${t.genre.label} > ${t.label} のアイデア`,
    alternates: { canonical: `/g/${genre}/${type}` },
  };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ genre: string; type: string }>;
}) {
  const { genre, type } = await params;
  const tid = typeId(genre, type);

  const t = await prisma.type.findUnique({
    where: { id: tid },
    include: { genre: true },
  });
  if (!t) notFound();

  const ideas = await prisma.idea.findMany({
    where: { typeId: tid },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { displayName: true } },
      _count: { select: { comments: true, reactions: true, interests: true } },
    },
    take: 50,
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <div className="text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>{" "}
        ›{" "}
        <Link href={`/g/${genre}`} className="hover:underline">
          {t.genre.emoji} {t.genre.label}
        </Link>{" "}
        › <span>{t.label}</span>
      </div>

      <header className="mt-3 mb-6 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{t.label}</h1>
        <Link
          href={`/new?type=${tid}`}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          + 種を蒔く
        </Link>
      </header>

      {ideas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          このタイプにはまだ種がありません。
          <br />
          最初の一粒を蒔いてみませんか？
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
    </main>
  );
}
