"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { CATEGORIES, REACTIONS } from "./categories";
import { isAdmin } from "./auth";

const VALID_CATEGORIES: Set<string> = new Set(CATEGORIES.map((c) => c.id));
const VALID_REACTIONS: Set<string> = new Set(REACTIONS.map((r) => r.id));

export async function createIdea(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || null;
  const rawCategory = String(formData.get("category") ?? "other");
  const category = VALID_CATEGORIES.has(rawCategory) ? rawCategory : "other";
  const authorName = String(formData.get("authorName") ?? "").trim() || null;

  if (!title) return;

  const idea = await prisma.idea.create({
    data: { title, body, category, authorName },
  });
  revalidatePath("/");
  redirect(`/idea/${idea.id}`);
}

export async function addComment(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim() || null;
  if (!ideaId || !body) return;

  await prisma.comment.create({ data: { ideaId, body, authorName } });
  revalidatePath(`/idea/${ideaId}`);
}

export async function addReaction(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "");
  const type = String(formData.get("type") ?? "");
  if (!ideaId || !VALID_REACTIONS.has(type)) return;

  await prisma.reaction.create({ data: { ideaId, type } });
  revalidatePath(`/idea/${ideaId}`);
  revalidatePath("/");
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
