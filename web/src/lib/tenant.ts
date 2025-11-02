import { PrismaClient } from "@prisma/client";

const g = globalThis as any;
if (!g.__prismaTenants) g.__prismaTenants = {};

const BASE   = process.env.DATABASE_URL_BASE!;
const PREFIX = process.env.DB_PREFIX ?? "condotech_";

export function tenantDb(slug: string) {
  return `${PREFIX}${slug}`;
}

export function tenantUrl(slug: string) {
  if (!BASE) throw new Error("DATABASE_URL_BASE ausente");
  // substitui apenas o nome do DB, mantendo host/credenciais
  return BASE.replace(/(\/\/[^/]+\/)[^/?]+/, `$1${tenantDb(slug)}`);
}

export function getTenantPrisma(slug: string) {
  if (!g.__prismaTenants[slug]) {
    g.__prismaTenants[slug] = new PrismaClient({
      datasources: { db: { url: tenantUrl(slug) } },
    });
  }
  return g.__prismaTenants[slug] as PrismaClient;
}
