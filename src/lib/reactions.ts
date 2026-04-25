export const REACTIONS = [
  { id: "spark", label: "ひらめいた", emoji: "💡" },
  { id: "grow", label: "育てたい", emoji: "🌱" },
  { id: "complete", label: "完成させたい", emoji: "✨" },
] as const;

export type ReactionId = (typeof REACTIONS)[number]["id"];
