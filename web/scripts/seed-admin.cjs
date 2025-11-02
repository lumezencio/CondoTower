require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

(async () => {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash("Admin@2025!", 12);
    await prisma.user.upsert({
      where: { email: "admin@condotech.com" },
      update: { name: "Administrador", password: hash, role: "ADMIN" },
      create: { name: "Administrador", email: "admin@condotech.com", password: hash, role: "ADMIN" },
    });
    console.log("✓ Seed OK: admin@condotech.com / Admin@2025!");
  } catch (e) { console.error(e); process.exit(1); }
  finally { await prisma.$disconnect(); }
})();
