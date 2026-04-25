import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const ideas = await prisma.idea.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/new`, changeFrequency: "monthly", priority: 0.5 },
    ...ideas.map((i) => ({
      url: `${base}/idea/${i.id}`,
      lastModified: i.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
