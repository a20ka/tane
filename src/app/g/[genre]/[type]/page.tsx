import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";

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

  const siteUrl = getSiteUrl();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: t.genre.label,
        item: `${siteUrl}/g/${genre}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t.label,
        item: `${siteUrl}/g/${genre}/${type}`,
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <JsonLd data={breadcrumb} />
      <nav className="font-hand text-sm text-soil-faint">
        <Link href="/" className="hover:text-sprout transition-colors">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/g/${genre}`} className="hover:text-sprout transition-colors">
          {t.genre.emoji} {t.genre.label}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-soil-mid">{t.label}</span>
      </nav>

      <header className="mt-5 mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-soil">{t.label}</h1>
          <p className="mt-2 font-hand text-sm text-soil-faint">
            {ideas.length}つの種
          </p>
        </div>
        <Link href={`/new?type=${tid}`} className="btn-primary">
          <span>🌱</span>
          <span>種を蒔く</span>
        </Link>
      </header>

      {ideas.length === 0 ? (
        <div className="empty-paper">
          <p className="text-base">このタイプにはまだ種がありません</p>
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
    </main>
  );
}
