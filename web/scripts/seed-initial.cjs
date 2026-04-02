// Seed para popular dados iniciais de teste
// Executar: node scripts/seed-initial.cjs

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed inicial...');

  const tenant = 'parkclub';

  // Criar unidades de teste
  console.log('📦 Criando unidades...');
  const units = [];
  for (let bloco = 'A'; bloco <= 'C'; bloco++) {
    for (let num = 101; num <= 106; num++) {
      const unit = await prisma.unit.upsert({
        where: {
          tenant_block_number: {
            tenant,
            block: bloco,
            number: num.toString(),
          },
        },
        update: {},
        create: {
          tenant,
          block: bloco,
          number: num.toString(),
          areaM2: 65 + Math.floor(Math.random() * 30),
          bedrooms: 2 + Math.floor(Math.random() * 2),
          parkingSpots: 1 + Math.floor(Math.random() * 2),
        },
      });
      units.push(unit);
    }
  }
  console.log(`✅ ${units.length} unidades criadas.`);

  // Criar proprietários
  console.log('👤 Criando proprietários...');
  const owners = [];
  const nomes = ['JOAO SILVA', 'MARIA SANTOS', 'PEDRO OLIVEIRA', 'ANA COSTA', 'CARLOS FERREIRA', 'LUCIA RODRIGUES'];
  for (let i = 0; i < units.length && i < nomes.length; i++) {
    const owner = await prisma.owner.create({
      data: {
        tenant,
        unitId: units[i].id,
        type: 'PROPRIETARIO',
        name: nomes[i],
        cpf: `123456789${String(i).padStart(2, '0')}`,
        rg: `MG${String(i).padStart(8, '0')}`,
        phone: `(31) 9${String(8000 + i).padStart(4, '0')}-${String(1000 + i).padStart(4, '0')}`,
        email: `${nomes[i].toLowerCase().replace(' ', '.')}@email.com`,
      },
      include: { unit: true },
    });
    owners.push(owner);
  }
  console.log(`✅ ${owners.length} proprietários criados.`);

  // Criar pets
  console.log('🐾 Criando pets...');
  const petNames = ['REX', 'LUNA', 'THOR', 'BELA', 'MAX', 'MEL'];
  const species = ['CACHORRO', 'GATO'];
  for (let i = 0; i < 6; i++) {
    await prisma.pet.create({
      data: {
        tenant,
        unitId: units[i].id,
        name: petNames[i],
        species: species[i % 2],
        breed: ['LABRADOR', 'PERSA', 'BULLDOG', 'SIAMES', 'PASTOR', 'VIRA-LATA'][i],
        color: ['PRETO', 'BRANCO', 'MARROM', 'LARANJA', 'CINZA', 'AMARELO'][i],
        size: ['GRANDE', 'PEQUENO', 'MEDIO', 'PEQUENO', 'GRANDE', 'MEDIO'][i],
        vaccinated: true,
      },
    });
  }
  console.log('✅ Pets criados.');

  // Criar despesas
  console.log('💰 Criando despesas...');
  const expenses = [
    { description: 'CONTA DE AGUA', category: 'AGUA', amount: 1500 },
    { description: 'CONTA DE LUZ AREA COMUM', category: 'LUZ', amount: 2800 },
    { description: 'GAS COZINHA', category: 'GAS', amount: 450 },
    { description: 'INTERNET SALAO FESTAS', category: 'INTERNET', amount: 120 },
    { description: 'LIMPEZA PISCINA', category: 'LIMPEZA', amount: 600 },
    { description: 'MANUTENCAO ELEVADOR', category: 'MANUTENCAO', amount: 1200 },
  ];
  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        tenant,
        description: exp.description,
        category: exp.category,
        amount: exp.amount,
        dueDate: new Date(Date.now() + 86400000 * (5 + Math.floor(Math.random() * 20))),
        status: ['PENDING', 'PAID', 'PENDING', 'PENDING', 'PAID', 'PENDING'][expenses.indexOf(exp)],
      },
    });
  }
  console.log('✅ Despesas criadas.');

  // Criar receitas
  console.log('💵 Criando receitas...');
  const revenues = [
    { description: 'TAXA CONDOMINIO APTO 101', type: 'TAXA_COND', amount: 850 },
    { description: 'TAXA CONDOMINIO APTO 102', type: 'TAXA_COND', amount: 850 },
    { description: 'MULTA BARULHO APTO 103', type: 'MULTA', amount: 300 },
    { description: 'ALUGUEL SALAO FESTAS', type: 'ALUGUEL_AREA_COMUM', amount: 500 },
  ];
  for (const rev of revenues) {
    await prisma.revenue.create({
      data: {
        tenant,
        description: rev.description,
        type: rev.type,
        amount: rev.amount,
        dueDate: new Date(Date.now() + 86400000 * (3 + Math.floor(Math.random() * 15))),
        status: ['PENDING', 'PAID', 'PENDING', 'PAID'][revenues.indexOf(rev)],
      },
    });
  }
  console.log('✅ Receitas criadas.');

  // Criar contatos
  console.log('📞 Criando contatos...');
  const contacts = [
    { name: 'SINDICO - JOAO SILVA', type: 'MORADOR', category: 'SINDICO', phone: '(31) 99999-9999' },
    { name: 'ZELADOR - CARLOS', type: 'FUNCIONARIO', category: 'ZELADOR', phone: '(31) 98888-8888' },
    { name: 'PORTARIA 24H', type: 'EMERGENCIA', category: 'PORTARIA', phone: '(31) 3333-3333' },
    { name: 'ELEVADORES LTDA', type: 'FORNECEDOR', category: 'MANUTENCAO', phone: '(31) 3222-2222' },
    { name: 'BOMBEIROS', type: 'EMERGENCIA', category: 'EMERGENCIA', phone: '193' },
    { name: 'POLICIA', type: 'EMERGENCIA', category: 'EMERGENCIA', phone: '190' },
  ];
  for (const contact of contacts) {
    await prisma.contact.create({
      data: {
        tenant,
        ...contact,
      },
    });
  }
  console.log('✅ Contatos criados.');

  // Criar recados
  console.log('💬 Criando recados...');
  const messages = [
    { subject: 'Manutencao do elevador', type: 'AVISO', content: 'O elevador passara por manutencao sabado as 8h.', priority: 'NORMAL' },
    { subject: 'Vazamento area comum', type: 'SOLICITACAO', content: 'Foi identificado vazamento no hall de entrada.', priority: 'ALTA' },
    { subject: 'Elogio portaria', type: 'ELOGIO', content: 'Gostaria de elogiar o atendimento do porteiro noturno.', priority: 'NORMAL' },
  ];
  for (const msg of messages) {
    await prisma.message.create({
      data: {
        tenant,
        ...msg,
        fromName: 'ADMINISTRACAO',
        status: 'PENDENTE',
      },
    });
  }
  console.log('✅ Recados criados.');

  // Criar assembleias
  console.log('🏛️ Criando assembleias...');
  await prisma.meeting.create({
    data: {
      tenant,
      type: 'ASSEMBLEIA_GERAL_ORDINARIA',
      title: 'Assembleia Geral Ordinaria 2026',
      description: 'Discussao e aprovacao das contas do exercicio anterior.',
      agenda: '1. Aprovacao das contas\n2. Eleicao do sindico\n3. Obras necessarias\n4. Assuntos gerais',
      scheduledFor: new Date(Date.now() + 86400000 * 30),
      location: 'Salao de Festas',
      status: 'AGENDADA',
    },
  });
  console.log('✅ Assembleias criadas.');

  // Criar enquetes
  console.log('📊 Criando enquetes...');
  await prisma.poll.create({
    data: {
      tenant,
      title: 'Escolha da cor da fachada',
      description: 'Vote na cor que devera ser usada na pintura da fachada.',
      options: ['BRANCO', 'CINZA', 'BEGE', 'AMARELO'],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 86400000 * 7),
      status: 'ATIVA',
      anonymous: false,
      totalVotes: 0,
    },
  });
  console.log('✅ Enquetes criadas.');

  // Criar sorteio
  console.log('🎁 Criando sorteio...');
  await prisma.lottery.create({
    data: {
      tenant,
      title: 'Sorteio Vaga Garagem Visitantes',
      type: 'VAGA_GARAGEM',
      description: 'Sorteio da vaga de garagem rotativa para visitantes.',
      rules: 'Cada unidade pode ter 1 numero. Sorteio sera realizado no proximo sabado.',
      scheduledFor: new Date(Date.now() + 86400000 * 10),
      status: 'AGENDADO',
    },
  });
  console.log('✅ Sorteio criado.');

  // Criar aprovação
  console.log('✅ Criando aprovacoes...');
  await prisma.approval.create({
    data: {
      tenant,
      type: 'PRESTACAO_CONTAS',
      title: 'Prestacao de Contas - Janeiro 2026',
      description: 'Prestacao de contas referente ao mes de janeiro de 2026.',
      period: '01/2026',
      status: 'PENDENTE',
    },
  });
  console.log('✅ Aprovacoes criadas.');

  console.log('\n🎉 Seed inicial concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   - ${units.length} Unidades`);
  console.log(`   - ${owners.length} Proprietários`);
  console.log(`   - 6 Pets`);
  console.log(`   - ${expenses.length} Despesas`);
  console.log(`   - ${revenues.length} Receitas`);
  console.log(`   - ${contacts.length} Contatos`);
  console.log(`   - ${messages.length} Recados`);
  console.log(`   - 1 Assembleia`);
  console.log(`   - 1 Enquete`);
  console.log(`   - 1 Sorteio`);
  console.log(`   - 1 Aprovação`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
