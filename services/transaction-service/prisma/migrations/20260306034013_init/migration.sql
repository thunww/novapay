-- CreateEnum
CREATE TYPE "transaction"."TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "transaction"."Transaction" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "transaction"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_fromUserId_idx" ON "transaction"."Transaction"("fromUserId");

-- CreateIndex
CREATE INDEX "Transaction_toUserId_idx" ON "transaction"."Transaction"("toUserId");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "transaction"."Transaction"("createdAt");
