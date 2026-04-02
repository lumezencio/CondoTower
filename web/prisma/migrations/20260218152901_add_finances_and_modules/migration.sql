-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('AGUA', 'LUZ', 'GAS', 'INTERNET', 'TELEFONE', 'ELEVADOR', 'PISCINA', 'JARDIM', 'LIMPEZA', 'SEGURANCA', 'SEGURO', 'MANUTENCAO', 'SALARIO', 'ENCARGOS', 'MATERIAL', 'SERVICO_TERCEIRIZADO', 'TAXA_COND', 'TAXA_EXTRA', 'MULTA', 'OUTRO');

-- CreateEnum
CREATE TYPE "RevenueType" AS ENUM ('TAXA_COND', 'TAXA_EXTRA', 'MULTA', 'JUROS', 'RESERVA', 'ALUGUEL_AREA_COMUM', 'OUTRO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('COFINS', 'CSLL', 'IRPJ', 'PIS', 'ISS', 'OUTRO');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('PROPRIETARIO', 'INQUILINO');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('MORADOR', 'FUNCIONARIO', 'FORNECEDOR', 'EMERGENCIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('RECADO', 'AVISO', 'SOLICITACAO', 'RECLAMACAO', 'ELOGIO', 'SUGESTAO');

-- CreateEnum
CREATE TYPE "MessagePriority" AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESPONDIDO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('PRESTACAO_CONTAS', 'APROVACAO_OBRA', 'APROVACAO_FESTA', 'APROVACAO_REFORMA', 'APROVACAO_PET', 'OUTRO');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDENTE', 'EM_VOTACAO', 'APROVADO', 'REJEITADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('ASSEMBLEIA_GERAL_ORDINARIA', 'ASSEMBLEIA_GERAL_EXTRAORDINARIA', 'REUNIAO_CONSELHO', 'REUNIAO_SINDICO', 'OUTRO');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('RASCUNHO', 'ATIVA', 'ENCERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "LotteryType" AS ENUM ('VAGA_GARAGEM', 'AREA_COMUM', 'BRINDE', 'DESCONTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "LotteryStatus" AS ENUM ('AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- AlterEnum
ALTER TYPE "ResidentRole" ADD VALUE 'FAMILIAR';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "description" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "description" TEXT NOT NULL,
    "type" "RevenueType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "receiptDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxWithholding" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "revenueId" TEXT NOT NULL,
    "taxType" "TaxType" NOT NULL,
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "guideUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxWithholding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT NOT NULL,
    "type" "OwnerType" NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "phone" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "birthDate" TIMESTAMP(3),
    "profession" TEXT,
    "billingStreet" TEXT,
    "billingNumber" TEXT,
    "billingComplement" TEXT,
    "billingNeighborhood" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingZip" TEXT,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "rentValue" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "color" TEXT,
    "size" TEXT,
    "birthDate" TIMESTAMP(3),
    "vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "category" TEXT,
    "phone" TEXT NOT NULL,
    "phone2" TEXT,
    "email" TEXT,
    "department" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "userId" TEXT,
    "type" "MessageType" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" "MessagePriority" NOT NULL DEFAULT 'NORMAL',
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDENTE',
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT,
    "fromPhone" TEXT,
    "toName" TEXT NOT NULL,
    "toEmail" TEXT,
    "toPhone" TEXT,
    "response" TEXT,
    "responseAt" TIMESTAMP(3),
    "responseBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "type" "ApprovalType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDENTE',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "votes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "type" "MeetingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'AGENDADA',
    "ataUrl" TEXT,
    "participants" JSONB,
    "quorum" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "createdBy" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "options" JSONB NOT NULL,
    "multiple" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "PollStatus" NOT NULL DEFAULT 'ATIVA',
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "pollId" TEXT NOT NULL,
    "unitId" TEXT,
    "userId" TEXT,
    "vote" JSONB NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lottery" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "createdBy" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "LotteryType" NOT NULL,
    "rules" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "LotteryStatus" NOT NULL DEFAULT 'AGENDADO',
    "winnerId" TEXT,
    "winnerName" TEXT,
    "winnerUnit" TEXT,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotteryTicket" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "lotteryId" TEXT NOT NULL,
    "unitId" TEXT,
    "number" INTEGER NOT NULL,
    "holderName" TEXT NOT NULL,
    "holderEmail" TEXT,
    "holderPhone" TEXT,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_tenant_dueDate_idx" ON "Expense"("tenant", "dueDate");

-- CreateIndex
CREATE INDEX "Expense_tenant_status_idx" ON "Expense"("tenant", "status");

-- CreateIndex
CREATE INDEX "Expense_tenant_category_idx" ON "Expense"("tenant", "category");

-- CreateIndex
CREATE INDEX "Revenue_tenant_dueDate_idx" ON "Revenue"("tenant", "dueDate");

-- CreateIndex
CREATE INDEX "Revenue_tenant_status_idx" ON "Revenue"("tenant", "status");

-- CreateIndex
CREATE INDEX "Revenue_tenant_type_idx" ON "Revenue"("tenant", "type");

-- CreateIndex
CREATE INDEX "TaxWithholding_tenant_revenueId_idx" ON "TaxWithholding"("tenant", "revenueId");

-- CreateIndex
CREATE INDEX "TaxWithholding_tenant_dueDate_idx" ON "TaxWithholding"("tenant", "dueDate");

-- CreateIndex
CREATE INDEX "TaxWithholding_tenant_status_idx" ON "TaxWithholding"("tenant", "status");

-- CreateIndex
CREATE INDEX "Owner_tenant_unitId_idx" ON "Owner"("tenant", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_tenant_cpf_key" ON "Owner"("tenant", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_tenant_unitId_type_key" ON "Owner"("tenant", "unitId", "type");

-- CreateIndex
CREATE INDEX "Pet_tenant_unitId_idx" ON "Pet"("tenant", "unitId");

-- CreateIndex
CREATE INDEX "Contact_tenant_idx" ON "Contact"("tenant");

-- CreateIndex
CREATE INDEX "Contact_type_idx" ON "Contact"("type");

-- CreateIndex
CREATE INDEX "Contact_unitId_idx" ON "Contact"("unitId");

-- CreateIndex
CREATE INDEX "Message_tenant_idx" ON "Message"("tenant");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_type_idx" ON "Message"("type");

-- CreateIndex
CREATE INDEX "Approval_tenant_idx" ON "Approval"("tenant");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "Approval_period_idx" ON "Approval"("period");

-- CreateIndex
CREATE INDEX "Meeting_tenant_idx" ON "Meeting"("tenant");

-- CreateIndex
CREATE INDEX "Meeting_scheduledFor_idx" ON "Meeting"("scheduledFor");

-- CreateIndex
CREATE INDEX "Poll_tenant_idx" ON "Poll"("tenant");

-- CreateIndex
CREATE INDEX "Poll_status_idx" ON "Poll"("status");

-- CreateIndex
CREATE INDEX "Poll_endsAt_idx" ON "Poll"("endsAt");

-- CreateIndex
CREATE INDEX "PollVote_pollId_idx" ON "PollVote"("pollId");

-- CreateIndex
CREATE INDEX "PollVote_unitId_idx" ON "PollVote"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_pollId_unitId_key" ON "PollVote"("pollId", "unitId");

-- CreateIndex
CREATE INDEX "Lottery_tenant_idx" ON "Lottery"("tenant");

-- CreateIndex
CREATE INDEX "Lottery_scheduledFor_idx" ON "Lottery"("scheduledFor");

-- CreateIndex
CREATE INDEX "LotteryTicket_lotteryId_idx" ON "LotteryTicket"("lotteryId");

-- CreateIndex
CREATE INDEX "LotteryTicket_unitId_idx" ON "LotteryTicket"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "LotteryTicket_lotteryId_number_key" ON "LotteryTicket"("lotteryId", "number");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxWithholding" ADD CONSTRAINT "TaxWithholding_revenueId_fkey" FOREIGN KEY ("revenueId") REFERENCES "Revenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryTicket" ADD CONSTRAINT "LotteryTicket_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryTicket" ADD CONSTRAINT "LotteryTicket_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
