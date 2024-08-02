/*
  Warnings:

  - You are about to drop the `prices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "prices";

-- CreateTable
CREATE TABLE "Prices" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" TEXT NOT NULL,

    CONSTRAINT "Prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prices_id_key" ON "Prices"("id");

-- CreateIndex
CREATE INDEX "Prices_companyName_idx" ON "Prices"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Prices_companyName_time_key" ON "Prices"("companyName", "time");
