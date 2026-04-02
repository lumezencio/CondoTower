import pkg from "@prisma/client";        // ← importa como default (CJS)
import bcrypt from "bcrypt";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@condotower.com.br";
  const pass  = process.env.SEED_ADMIN_PASS  || "Admin@2025!";

  const hash  = await bcrypt.hash(pass, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Administrador", password: hash, role: "ADMIN" }
  });

  console.log(`✓ Usuário admin seed: ${email} / ${pass}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
