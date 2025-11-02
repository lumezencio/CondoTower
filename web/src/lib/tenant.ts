import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

/** Usa a DATABASE_URL do .env. Reativamos multi-tenant depois. */
export function getTenantPrisma(_slug?: string) {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}
