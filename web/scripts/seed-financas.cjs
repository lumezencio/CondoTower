// Seed para criar dados de teste para finanças
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando dados de teste para finanças...');

  const tenant = 'parkclub';

  // Busca unidade existente
  const unit = await prisma.unit.findFirst({
    where: { tenant },
  });

  if (!unit) {
    console.log('❌ Tenant não encontrado. Execute seed-tenant.cjs primeiro.');
    return;
  }

  // Cria despesas de teste
  const expenses = [
    { description: 'CONTA DE AGUA', category: 'AGUA', amount: 1500, dueDate: new Date(Date.now() + 86400000 * 5) },
    { description: 'CONTA DE LUZ AREA COMUM', category: 'LUZ', amount: 2800, dueDate: new Date(Date.now() + 86400000 * 10) },
    { description: 'GAS COZINHA', category: 'GAS', amount: 450, dueDate: new Date(Date.now() + 86400000 * 3) },
    { description: 'INTERNET SALAO FESTAS', category: 'INTERNET', amount: 120, dueDate: new Date(Date.now() + 86400000 * 15) },
    { description: 'LIMPEZA PISCINA', category: 'LIMPEZA', amount: 600, dueDate: new Date(Date.now() + 86400000 * 7) },
    { description: 'MANUTENCAO ELEVADOR', category: 'MANUTENCAO', amount: 1200, dueDate: new Date(Date.now() - 86400000 * 2) }, // Atrasada
  ];

  for (const exp of expenses) {
    // Verifica se já existe
    const existing = await prisma.expense.findFirst({
      where: { tenant, description: exp.description },
    });

    if (!existing) {
      await prisma.expense.create({
        data: {
          tenant,
          description: exp.description,
          category: exp.category,
          amount: exp.amount,
          dueDate: exp.dueDate,
          status: exp.dueDate < new Date() ? 'OVERDUE' : 'PENDING',
        },
      });
    }
  }

  console.log(`✅ ${expenses.length} despesas criadas/atualizadas.`);

  // Cria receitas de teste
  const revenues = [
    { description: 'TAXA CONDOMINIO APTO 101', type: 'TAXA_COND', amount: 850, dueDate: new Date(Date.now() + 86400000 * 5) },
    { description: 'TAXA CONDOMINIO APTO 102', type: 'TAXA_COND', amount: 850, dueDate: new Date(Date.now() + 86400000 * 5) },
    { description: 'MULTA BARULHO APTO 103', type: 'MULTA', amount: 300, dueDate: new Date(Date.now() - 86400000 * 5) }, // Atrasada
    { description: 'ALUGUEL SALAO FESTAS', type: 'ALUGUEL_AREA_COMUM', amount: 500, dueDate: new Date(Date.now() + 86400000 * 10) },
  ];

  for (const rev of revenues) {
    const existing = await prisma.revenue.findFirst({
      where: { tenant, description: rev.description },
    });

    if (!existing) {
      await prisma.revenue.create({
        data: {
          tenant,
          description: rev.description,
          type: rev.type,
          amount: rev.amount,
          dueDate: rev.dueDate,
          status: rev.dueDate < new Date() ? 'OVERDUE' : 'PENDING',
        },
      });
    }
  }

  console.log(`✅ ${revenues.length} receitas criadas/atualizadas.`);

  console.log('\n🎉 Dados de teste criados com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
