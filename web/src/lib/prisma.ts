import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiplas instâncias em dev (HMR)
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prisma = globalThis.__prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prisma;
}

export { prisma };
export default prisma;
