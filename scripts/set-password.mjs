import { Client } from "pg";
import { readFileSync, writeFileSync } from "node:fs";

const newPassword = process.argv[2];
if (!newPassword) {
  console.error("Usage: node scripts/set-password.mjs <new_password>");
  process.exit(1);
}

const ENV_PATH = ".env";
const envText = readFileSync(ENV_PATH, "utf8");
const envMap = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/i);
  if (m) envMap[m[1]] = m[2];
}

const oldUrl = envMap.DATABASE_URL;
if (!oldUrl) throw new Error("DATABASE_URL not in .env");

const url = new URL(oldUrl);
const role = decodeURIComponent(url.username);

console.log(`Setting password for role: ${role}`);

const client = new Client({
  connectionString: oldUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(`ALTER ROLE "${role}" WITH PASSWORD '${newPassword}'`);
await client.end();
console.log("Password updated on Postgres server.");

url.password = newPassword;
const newUrl = url.toString();

const verify = new Client({
  connectionString: newUrl,
  ssl: { rejectUnauthorized: false },
});
await verify.connect();
await verify.query("SELECT 1");
await verify.end();
console.log("New password verified.");

const updated = envText.replace(
  /^DATABASE_URL\s*=.*$/m,
  `DATABASE_URL="${newUrl}"`
);
writeFileSync(ENV_PATH, updated);
console.log(".env updated.");
