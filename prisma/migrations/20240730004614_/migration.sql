-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "prices_id_key" ON "prices"("id");
