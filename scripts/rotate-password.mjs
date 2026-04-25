import { Client } from "pg";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

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
const newPassword = "npg_" + randomBytes(18).toString("base64url");

console.log(`Rotating password for role: ${role}`);

// Connect with current credentials and ALTER the role's password
const client = new Client({
  connectionString: oldUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(`ALTER ROLE "${role}" WITH PASSWORD '${newPassword}'`);
await client.end();
console.log("Password updated on Postgres server.");

// Build the new connection string
url.password = newPassword;
const newUrl = url.toString();

// Verify the new password actually works
const verify = new Client({
  connectionString: newUrl,
  ssl: { rejectUnauthorized: false },
});
await verify.connect();
const { rows } = await verify.query(
  "SELECT current_user AS user, current_database() AS db"
);
await verify.end();
console.log("New connection verified:", rows[0]);

// Persist to .env
const updated = envText.replace(
  /^DATABASE_URL\s*=.*$/m,
  `DATABASE_URL="${newUrl}"`
);
writeFileSync(ENV_PATH, updated);
console.log(".env updated.\n");

console.log("=========================================================");
console.log("New DATABASE_URL (paste this into Vercel env var):");
console.log("=========================================================");
console.log(newUrl);
console.log("=========================================================");
