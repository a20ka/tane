"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { REACTIONS } from "./reactions";
import { getCurrentUser, isAdmin } from "./auth";

const VALID_REACTIONS: Set<string> = new Set(REACTIONS.map((r) => r.id));

export async function createIdea(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || null;
  const typeId = String(formData.get("typeId") ?? "");
  const anonName = String(formData.get("authorName") ?? "").trim() || null;

  if (!title || !typeId) return;

  const typeRow = await prisma.type.findUnique({
    where: { id: typeId },
    select: { id: true, genreId: true },
  });
  if (!typeRow) return;

  const user = await getCurrentUser();

  const idea = await prisma.idea.create({
    data: {
      title,
      body,
      typeId,
      authorId: user?.id ?? null,
      authorName: user ? null : anonName,
    },
  });

  revalidatePath("/");
  revalidatePath(`/g/${typeRow.genreId}`);
  revalidatePath(`/g/${typeRow.genreId}/${typeId.replace(`${typeRow.genreId}-`, "")}`);
  redirect(`/idea/${idea.id}`);
}

export async function addComment(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const isAugment = String(formData.get("kind") ?? "comment") === "augment";
  const anonName = String(formData.get("authorName") ?? "").trim() || null;
  if (!ideaId || !body) return;

  const user = await getCurrentUser();

  await prisma.comment.create({
    data: {
      ideaId,
      body,
      isAugment,
      authorId: user?.id ?? null,
      authorName: user ? null : anonName,
    },
  });
  revalidatePath(`/idea/${ideaId}`);
}

export async function addReaction(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "");
  const type = String(formData.get("type") ?? "");
  if (!ideaId || !VALID_REACTIONS.has(type)) return;

  const user = await getCurrentUser();
  await prisma.reaction.create({
    data: { ideaId, type, authorId: user?.id ?? null },
  });
  revalidatePath(`/idea/${ideaId}`);
  revalidatePath("/");
}

export async function toggleInterest(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin");
  }
  const ideaId = String(formData.get("ideaId") ?? "");
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!ideaId) return;

  const existing = await prisma.interestSignal.findUnique({
    where: { ideaId_userId: { ideaId, userId: user.id } },
  });

  if (existing) {
    await prisma.interestSignal.delete({ where: { id: existing.id } });
  } else {
    await prisma.interestSignal.create({
      data: { ideaId, userId: user.id, message },
    });
  }
  revalidatePath(`/idea/${ideaId}`);
}

export async function deleteIdea(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.idea.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}

export async function deleteComment(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const ideaId = String(formData.get("ideaId") ?? "");
  if (!id) return;
  await prisma.comment.delete({ where: { id } });
  if (ideaId) revalidatePath(`/idea/${ideaId}`);
}
