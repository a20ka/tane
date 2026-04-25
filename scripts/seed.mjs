import { Client } from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

// Minimal .env loader (avoid extra dep)
const env = readFileSync(".env", "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

await client.query('DELETE FROM "Reaction"');
await client.query('DELETE FROM "Comment"');
await client.query('DELETE FROM "Idea"');

const a = randomUUID();
const b = randomUUID();
const c = randomUUID();
const d = randomUUID();

await client.query(
  `INSERT INTO "Idea" (id, title, body, category, "authorName") VALUES
   ($1, $2, $3, $4, $5)`,
  [
    a,
    "雨の日にしか開かない本屋",
    "雨の日だけシャッターが上がる古本屋。読みたい本は事前にメモしておく。傘立てが入口の暗号。",
    "reading",
    "あつき",
  ]
);
await client.query(
  `INSERT INTO "Idea" (id, title, body, category, "authorName") VALUES
   ($1, $2, $3, $4, $5)`,
  [
    b,
    "声を出さずに笑い合うだけの会",
    "誰かが何か面白そうな顔をしたら全員で深くうなずく。意味は問わない。月一開催。",
    "play",
    null,
  ]
);
await client.query(
  `INSERT INTO "Idea" (id, title, body, category, "authorName") VALUES
   ($1, $2, $3, $4, $5)`,
  [
    c,
    "主人公が一度も画面に映らない映画",
    "周囲の人々の反応だけで主人公の人物像を浮き彫りにする。声も足音も無し。",
    "movie",
    "テスト太郎",
  ]
);
await client.query(
  `INSERT INTO "Idea" (id, title, body, category, "authorName") VALUES
   ($1, $2, $3, $4, $5)`,
  [
    d,
    "1日1個だけ嘘をついて生きる日",
    "朝起きて今日つく嘘を1個決める。バレなければ勝ち。誰も傷つけない嘘限定。",
    "story",
    null,
  ]
);

await client.query(
  `INSERT INTO "Comment" (id, "ideaId", body, "authorName") VALUES ($1,$2,$3,$4)`,
  [randomUUID(), a, "雨予報の日を待つドキドキ感がいい", "通行人"]
);
await client.query(
  `INSERT INTO "Comment" (id, "ideaId", body, "authorName") VALUES ($1,$2,$3,$4)`,
  [randomUUID(), a, "傘の色で売り場が変わるとか…？", null]
);

for (const [ideaId, type] of [
  [a, "spark"],
  [a, "grow"],
  [b, "spark"],
  [c, "complete"],
  [d, "spark"],
  [d, "grow"],
]) {
  await client.query(
    `INSERT INTO "Reaction" (id, "ideaId", type) VALUES ($1,$2,$3)`,
    [randomUUID(), ideaId, type]
  );
}

console.log("Seeded ideas:", { a, b, c, d });
await client.end();
