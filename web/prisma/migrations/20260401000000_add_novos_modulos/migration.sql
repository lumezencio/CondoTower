-- CreateEnum
CREATE TYPE "TipoFornecedor" AS ENUM ('PJ', 'PF');

-- CreateEnum
CREATE TYPE "TipoServico" AS ENUM ('LIMPEZA', 'SEGURANCA', 'MANUTENCAO', 'TI', 'PROFISSIONAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "NotaStatus" AS ENUM ('PENDENTE', 'PROCESSADA', 'CANCELADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "TipoChamado" AS ENUM ('MANUTENCAO_PREVENTIVA', 'MANUTENCAO_CORRETIVA', 'SOLICITACAO_SERVICO', 'RECLAMACAO', 'SUGESTAO', 'EMERGENCIA');

-- CreateEnum
CREATE TYPE "CategoriaChamado" AS ENUM ('ELETRICA', 'HIDRAULICA', 'ELEVADOR', 'AR_CONDICIONADO', 'PISCINA', 'JARDIM', 'LIMPEZA', 'SEGURANCA', 'ESTRUTURAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('ABERTO', 'EM_ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PrioridadeChamado" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE', 'EMERGENCIA');

-- CreateEnum
CREATE TYPE "StatusEvento" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'CANCELADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "TipoAreaComum" AS ENUM ('SALAO_FESTAS', 'CHURRASQUEIRA', 'PISCINA', 'ACADEMIA', 'QUADRA', 'PLAYGROUND', 'ESPACO_GOURMET', 'SALA_REUNIAO', 'OUTRO');

-- AlterEnum
BEGIN;
CREATE TYPE "TaxType_new" AS ENUM ('INSS', 'IRRF', 'ISS', 'CSLL', 'COFINS', 'PIS', 'OUTRO');
ALTER TABLE "TaxWithholding" ALTER COLUMN "taxType" TYPE "TaxType_new" USING ("taxType"::text::"TaxType_new");
ALTER TYPE "TaxType" RENAME TO "TaxType_old";
ALTER TYPE "TaxType_new" RENAME TO "TaxType";
DROP TYPE "public"."TaxType_old";
COMMIT;

-- CreateTable
CREATE TABLE "NotaEntrada" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "numero" TEXT NOT NULL,
    "serie" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoFornecedor" "TipoFornecedor" NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "cnpjFornecedor" TEXT,
    "cpfFornecedor" TEXT,
    "simplesNacional" BOOLEAN NOT NULL DEFAULT false,
    "tipoServico" "TipoServico" NOT NULL,
    "descricao" TEXT NOT NULL,
    "cfop" TEXT,
    "valorBruto" DECIMAL(10,2) NOT NULL,
    "valorLiquido" DECIMAL(10,2),
    "chaveNfe" TEXT,
    "xmlUrl" TEXT,
    "pdfUrl" TEXT,
    "status" "NotaStatus" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "expenseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetencaoImposto" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "notaEntradaId" TEXT NOT NULL,
    "tipoImposto" "TaxType" NOT NULL,
    "baseCalculo" DECIMAL(10,2) NOT NULL,
    "aliquota" DECIMAL(6,4) NOT NULL,
    "valorRetido" DECIMAL(10,2) NOT NULL,
    "codigoRecolhimento" TEXT,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "guiaUrl" TEXT,
    "expenseId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetencaoImposto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT,
    "tipo" "TipoChamado" NOT NULL,
    "categoria" "CategoriaChamado" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusChamado" NOT NULL DEFAULT 'ABERTO',
    "prioridade" "PrioridadeChamado" NOT NULL DEFAULT 'MEDIA',
    "localAfetado" TEXT,
    "solucao" TEXT,
    "custo" DECIMAL(10,2),
    "dataPrevisao" TIMESTAMP(3),
    "dataResolucao" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaComum" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "nome" TEXT NOT NULL,
    "tipo" "TipoAreaComum" NOT NULL DEFAULT 'OUTRO',
    "descricao" TEXT,
    "capacidade" INTEGER,
    "valorReserva" DECIMAL(10,2),
    "antecedenciaMin" INTEGER NOT NULL DEFAULT 24,
    "requerAprovacao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "regras" TEXT,
    "fotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaComum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "areaComumId" TEXT NOT NULL,
    "unitId" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "StatusEvento" NOT NULL DEFAULT 'PENDENTE',
    "valor" DECIMAL(10,2),
    "nomeResponsavel" TEXT,
    "telefoneResponsavel" TEXT,
    "motivoRejeicao" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotaEntrada_tenant_idx" ON "NotaEntrada"("tenant");

-- CreateIndex
CREATE INDEX "NotaEntrada_tenant_dataEmissao_idx" ON "NotaEntrada"("tenant", "dataEmissao");

-- CreateIndex
CREATE INDEX "NotaEntrada_tenant_cnpjFornecedor_idx" ON "NotaEntrada"("tenant", "cnpjFornecedor");

-- CreateIndex
CREATE INDEX "NotaEntrada_tenant_status_idx" ON "NotaEntrada"("tenant", "status");

-- CreateIndex
CREATE INDEX "RetencaoImposto_tenant_notaEntradaId_idx" ON "RetencaoImposto"("tenant", "notaEntradaId");

-- CreateIndex
CREATE INDEX "RetencaoImposto_tenant_dataVencimento_idx" ON "RetencaoImposto"("tenant", "dataVencimento");

-- CreateIndex
CREATE INDEX "RetencaoImposto_tenant_status_idx" ON "RetencaoImposto"("tenant", "status");

-- CreateIndex
CREATE INDEX "RetencaoImposto_tenant_tipoImposto_idx" ON "RetencaoImposto"("tenant", "tipoImposto");

-- CreateIndex
CREATE INDEX "Chamado_tenant_idx" ON "Chamado"("tenant");

-- CreateIndex
CREATE INDEX "Chamado_tenant_status_idx" ON "Chamado"("tenant", "status");

-- CreateIndex
CREATE INDEX "Chamado_tenant_prioridade_idx" ON "Chamado"("tenant", "prioridade");

-- CreateIndex
CREATE INDEX "Chamado_tenant_tipo_idx" ON "Chamado"("tenant", "tipo");

-- CreateIndex
CREATE INDEX "Chamado_tenant_createdAt_idx" ON "Chamado"("tenant", "createdAt");

-- CreateIndex
CREATE INDEX "AreaComum_tenant_idx" ON "AreaComum"("tenant");

-- CreateIndex
CREATE INDEX "AreaComum_tenant_ativo_idx" ON "AreaComum"("tenant", "ativo");

-- CreateIndex
CREATE INDEX "Evento_tenant_idx" ON "Evento"("tenant");

-- CreateIndex
CREATE INDEX "Evento_tenant_status_idx" ON "Evento"("tenant", "status");

-- CreateIndex
CREATE INDEX "Evento_tenant_dataInicio_idx" ON "Evento"("tenant", "dataInicio");

-- CreateIndex
CREATE INDEX "Evento_areaComumId_idx" ON "Evento"("areaComumId");

-- AddForeignKey
ALTER TABLE "RetencaoImposto" ADD CONSTRAINT "RetencaoImposto_notaEntradaId_fkey" FOREIGN KEY ("notaEntradaId") REFERENCES "NotaEntrada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_areaComumId_fkey" FOREIGN KEY ("areaComumId") REFERENCES "AreaComum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
