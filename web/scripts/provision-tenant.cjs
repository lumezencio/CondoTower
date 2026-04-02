require('dotenv').config();
/* scripts/provision-tenant.cjs */
const { Client } = require("pg");
const { spawnSync } = require("cross-spawn");

const slug = process.argv[2];
if (!slug) {
  console.error("Uso: pnpm provision <slug-empresa>");
  process.exit(1);
}

const base = process.env.DATABASE_URL_BASE;
const prefix = process.env.DB_PREFIX || "condotower_";
if (!base) { console.error("DATABASE_URL_BASE não definido"); process.exit(1); }

(async () => {
  const u = new URL(base);
  const dbRoot = u.pathname.slice(1); // ex.: "postgres"
  const dbName = `${prefix}${slug}`;

  // conecta no DB base para criar o banco do cliente
  const client = new Client({ connectionString: base });
  await client.connect();
  const exists = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✓ Banco criado: ${dbName}`);
  } else {
    console.log(`(i) Banco já existe: ${dbName}`);
  }
  await client.end();

  // roda as migrações apontando o DATABASE_URL temporário
  const tenantUrl = new URL(base); tenantUrl.pathname = `/${dbName}`;
  const env = { ...process.env, DATABASE_URL: tenantUrl.toString() };
  const r = spawnSync("pnpm", ["dlx", "prisma", "migrate", "deploy"], { stdio: "inherit", env });
  process.exit(r.status ?? 0);
})();

