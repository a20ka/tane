import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SproutMark } from "@/components/Logo";
import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";

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

  const siteUrl = getSiteUrl();
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Tane",
        alternateName: "種",
        description:
          "未完成のアイデアを蒔いて、みんなで育てて形にする場所。物語・映画・ゲーム・体験・夢など、あらゆるジャンルのクリエイティブな種を共有できます。",
        inLanguage: "ja-JP",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        url: siteUrl,
        name: "Tane",
        description: "アイデアの種を蒔いて、みんなで育てて形にするプラットフォーム",
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: "Tane — 世界のアイデアの脳みそ",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        inLanguage: "ja-JP",
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <JsonLd data={websiteSchema} />
      <header className="mb-14 text-center">
        <div className="mb-4 inline-flex text-sprout">
          <SproutMark size={64} />
        </div>
        <h1 className="font-serif text-4xl font-bold tracking-wide sm:text-5xl">
          Tane
        </h1>
        <p className="mt-4 font-hand text-base text-soil-mid">
          世界のアイデアの脳みそ。
        </p>
        <p className="mt-1 font-serif text-sm text-soil-faint">
          まだ形になっていない種を蒔いて、みんなで育てる。
        </p>
        <Link href="/new" className="btn-primary mt-7">
          <span>🌱</span>
          <span>種を蒔く</span>
        </Link>
      </header>

      <section className="mb-14">
        <h2 className="section-title mb-5">ジャンルから探す</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/g/${g.id}`}
              className="paper-card group block p-5"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{g.emoji}</div>
                <div className="flex-1">
                  <div className="font-serif text-lg font-bold text-soil group-hover:text-sprout transition-colors">
                    {g.label}
                  </div>
                  <div className="mt-1 font-hand text-xs text-soil-faint">
                    {g._count.types}タイプ ・ {ideaCountByGenre.get(g.id) ?? 0}つの種
                  </div>
                </div>
                <div className="font-serif text-soil-faint group-hover:text-sprout transition-colors">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-5">最近蒔かれた種</h2>
        {ideas.length === 0 ? (
          <div className="empty-paper">
            <p className="text-base">まだ何も蒔かれていません</p>
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
                      <span className="text-sprout">
                        {idea.type.genre.emoji} {idea.type.genre.label}
                      </span>
                      <span>›</span>
                      <span>{idea.type.label}</span>
                      <span className="text-line">|</span>
                      <span>{dateFmt.format(idea.createdAt)}</span>
                      <span className="text-line">|</span>
                      <span>{author}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-soil group-hover:text-sprout transition-colors">
                      {idea.title}
                    </h3>
                    {idea.body && (
                      <p className="mt-2 line-clamp-2 text-sm text-soil-mid">
                        {idea.body}
                      </p>
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
