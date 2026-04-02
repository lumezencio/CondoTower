const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@condotech.com";
  const pass  = process.env.SEED_ADMIN_PASS  || "Admin@2025!";
  const hash  = await bcrypt.hash(pass, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, name: "Administrador", password: hash }
  });

  console.log(`✓ Usuário admin seed: ${email} / ${pass}`);
}

main().finally(()=>prisma.$disconnect());
