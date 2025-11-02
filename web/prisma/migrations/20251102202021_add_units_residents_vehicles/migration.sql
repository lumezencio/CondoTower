-- CreateEnum
CREATE TYPE "ResidentRole" AS ENUM ('MORADOR', 'PROPRIETARIO', 'INQUILINO', 'SINDICO');

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "block" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "areaM2" DECIMAL(10,2),
    "bedrooms" INTEGER DEFAULT 0,
    "parkingSpots" INTEGER DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "role" "ResidentRole" NOT NULL DEFAULT 'MORADOR',
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL DEFAULT 'parkclub',
    "unitId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "model" TEXT,
    "color" TEXT,
    "tag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Unit_tenant_block_idx" ON "Unit"("tenant", "block");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_tenant_block_number_key" ON "Unit"("tenant", "block", "number");

-- CreateIndex
CREATE INDEX "Resident_tenant_unitId_idx" ON "Resident"("tenant", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Resident_tenant_cpf_key" ON "Resident"("tenant", "cpf");

-- CreateIndex
CREATE INDEX "Vehicle_tenant_unitId_idx" ON "Vehicle"("tenant", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_tenant_plate_key" ON "Vehicle"("tenant", "plate");

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
