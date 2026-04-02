// Seed para criar tenant e dados iniciais
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando tenant parkclub...');

  // Verifica se tenant já existe
  const existingUnit = await prisma.unit.findFirst({
    where: { tenant: 'parkclub' },
  });

  if (existingUnit) {
    console.log('✅ Tenant parkclub já existe.');
  } else {
    // Cria uma unidade de teste para inicializar o tenant
    await prisma.unit.create({
      data: {
        tenant: 'parkclub',
        block: 'A',
        number: '101',
        areaM2: 65,
        bedrooms: 2,
        parkingSpots: 1,
      },
    });
    console.log('✅ Tenant parkclub criado com sucesso!');
  }

  // Cria usuário admin
  const passwordHash = await bcrypt.hash('Admin@2025!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@condotech.com' },
    update: {},
    create: {
      email: 'admin@condotech.com',
      name: 'Administrador',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado!');
  console.log('   Email: admin@condotech.com');
  console.log('   Senha: Admin@2025!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
