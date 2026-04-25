import { Client } from "pg";
import { readFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const TAXONOMY = [
  { id: "stories", emoji: "📖", label: "物語", types: [
    { id: "short", label: "短編" },
    { id: "long", label: "長編・小説" },
    { id: "poem", label: "詩・短歌" },
    { id: "fable", label: "寓話・童話" },
    { id: "ss", label: "ショートショート" },
  ]},
  { id: "screen", emoji: "🎬", label: "映像", types: [
    { id: "movie", label: "映画" },
    { id: "drama", label: "ドラマ" },
    { id: "short-video", label: "短編動画" },
    { id: "anime", label: "アニメ" },
  ]},
  { id: "games", emoji: "🎮", label: "ゲーム", types: [
    { id: "board", label: "ボード・テーブル" },
    { id: "card", label: "カード" },
    { id: "experience", label: "体験型" },
    { id: "digital", label: "デジタル" },
  ]},
  { id: "experience", emoji: "🎉", label: "体験・遊び", types: [
    { id: "event", label: "イベント企画" },
    { id: "street", label: "街なか遊び" },
    { id: "party", label: "パーティー" },
  ]},
  { id: "comedy", emoji: "😂", label: "笑い・雑談", types: [
    { id: "ogiri", label: "大喜利" },
    { id: "episode", label: "エピソード" },
    { id: "mystery", label: "不思議な話" },
  ]},
  { id: "creative", emoji: "🎨", label: "創作", types: [
    { id: "manga", label: "漫画・イラスト" },
    { id: "music", label: "音楽" },
    { id: "product", label: "プロダクト・発明" },
  ]},
  { id: "life", emoji: "🍱", label: "暮らし", types: [
    { id: "tip", label: "暮らしの工夫" },
    { id: "cooking", label: "料理・レシピ" },
    { id: "diy", label: "DIY" },
    { id: "space", label: "空間づくり" },
  ]},
  { id: "dream", emoji: "💤", label: "夢", types: [
    { id: "today", label: "その日見た夢" },
    { id: "memorable", label: "印象的な夢" },
    { id: "nightmare", label: "悪夢" },
    { id: "recurring", label: "繰り返す夢" },
    { id: "lucid", label: "明晰夢" },
  ]},
  { id: "other", emoji: "✨", label: "その他", types: [
    { id: "general", label: "分類しきれないもの" },
  ]},
];

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

await c.query('DELETE FROM "Type"');
await c.query('DELETE FROM "Genre"');

let genreOrder = 0;
for (const g of TAXONOMY) {
  await c.query(
    `INSERT INTO "Genre"(id,label,emoji,"order") VALUES ($1,$2,$3,$4)`,
    [g.id, g.label, g.emoji, genreOrder++]
  );
  let typeOrder = 0;
  for (const t of g.types) {
    await c.query(
      `INSERT INTO "Type"(id,"genreId",label,"order") VALUES ($1,$2,$3,$4)`,
      [`${g.id}-${t.id}`, g.id, t.label, typeOrder++]
    );
  }
}

console.log(`Seeded ${TAXONOMY.length} genres and ${TAXONOMY.reduce((n,g)=>n+g.types.length,0)} types.`);
await c.end();
