import { Client } from "pg";
import { readFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const TAXONOMY = [
  { id: "drink", emoji: "🍻", label: "飲み会", types: [
    { id: "song", label: "飲み歌" },
    { id: "game", label: "飲みゲーム" },
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
