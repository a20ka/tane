export const CATEGORIES = [
  { id: "reading", label: "読み物", emoji: "📖" },
  { id: "movie", label: "映画", emoji: "🎬" },
  { id: "story", label: "面白い話", emoji: "💭" },
  { id: "play", label: "遊び企画", emoji: "🎲" },
  { id: "other", label: "その他", emoji: "✨" },
] as const;

export const REACTIONS = [
  { id: "spark", label: "ひらめいた", emoji: "💡" },
  { id: "grow", label: "育てたい", emoji: "🌱" },
  { id: "complete", label: "完成させたい", emoji: "✨" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type ReactionId = (typeof REACTIONS)[number]["id"];

export function findCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
