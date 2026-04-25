import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [genres, types, ideas] = await Promise.all([
    prisma.genre.findMany({ select: { id: true } }),
    prisma.type.findMany({ select: { id: true, genreId: true } }),
    prisma.idea.findMany({
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/new`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.3 },
    ...genres.map((g) => ({
      url: `${base}/g/${g.id}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...types.map((t) => ({
      url: `${base}/g/${t.genreId}/${t.id.replace(`${t.genreId}-`, "")}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...ideas.map((i) => ({
      url: `${base}/idea/${i.id}`,
      lastModified: i.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
