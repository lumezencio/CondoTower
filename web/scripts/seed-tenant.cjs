require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

function tenantUrl(slug) {
  const base = process.env.DATABASE_URL_BASE;
  const prefix = process.env.DB_PREFIX || "condotech_";
  if (!base) throw new Error("DATABASE_URL_BASE ausente");
  const u = new URL(base); u.pathname = `/${prefix}${slug}`;
  return u.toString();
}

async function run(slug, email="admin@condotech.com", pass="Admin@2025!") {
  const prisma = new PrismaClient({ datasources: { db: { url: tenantUrl(slug) } } });
  const hash = await bcrypt.hash(pass, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Administrador", password: hash, role: "ADMIN" },
  });
  await prisma.$disconnect();
  console.log(`✓ Seed OK em ${slug}: ${email} / ${pass}`);
}

const slug = process.argv[2] || process.env.DEFAULT_TENANT || "default";
run(slug).catch((e)=>{ console.error(e); process.exit(1); });
