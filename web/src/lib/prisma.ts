import { PrismaClient } from "@prisma/client";

const pool = new Map<string, PrismaClient>();

export function tenantUrl(slug: string) {
  const base = process.env.DATABASE_URL_BASE;
  if (!base) throw new Error("DATABASE_URL_BASE not set");
  const prefix = process.env.DB_PREFIX || "condotech_";
  const u = new URL(base);      // .../postgres?schema=public
  u.pathname = `/${prefix}${slug}`;  // .../condotech_parkclub?schema=public
  return u.toString();
}

export function prismaForTenant(slug: string) {
  const key = (slug || "").toLowerCase();
  if (!pool.has(key)) {
    const url = tenantUrl(key);
    pool.set(key, new PrismaClient({ datasources: { db: { url } } }));
  }
  return pool.get(key)!;
}
