-- CreateEnum
CREATE TYPE "BoletoStatus" AS ENUM ('ABERTO', 'PAGO', 'VENCIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Boleto" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "apartamento_id" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "codigo_barras" TEXT NOT NULL,
    "linha_digitavel" TEXT NOT NULL,
    "url_boleto" TEXT NOT NULL,
    "status" "BoletoStatus" NOT NULL DEFAULT 'ABERTO',
    "multa" DECIMAL(5,2),
    "juros" DECIMAL(5,2),
    "desconto" DECIMAL(10,2),
    "valor_pago" DECIMAL(10,2),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boleto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Boleto_apartamento_id_idx" ON "Boleto"("apartamento_id");

-- CreateIndex
CREATE INDEX "Boleto_status_idx" ON "Boleto"("status");

-- CreateIndex
CREATE INDEX "Boleto_data_vencimento_idx" ON "Boleto"("data_vencimento");

-- CreateIndex
CREATE INDEX "Boleto_referencia_idx" ON "Boleto"("referencia");

-- AddForeignKey
ALTER TABLE "Boleto" ADD CONSTRAINT "Boleto_apartamento_id_fkey" FOREIGN KEY ("apartamento_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
