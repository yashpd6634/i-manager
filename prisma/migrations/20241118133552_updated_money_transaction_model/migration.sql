/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MoneyTransaction` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoneyTransaction" (
    "transactionId" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "paidToId" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL DEFAULT 'Add',
    "paymentByUPI" INTEGER NOT NULL DEFAULT 0,
    "paymentByCash" INTEGER NOT NULL DEFAULT 0,
    "paymentByCheck" INTEGER NOT NULL DEFAULT 0,
    "accountType" TEXT NOT NULL DEFAULT 'None',
    "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "totalAmount" INTEGER NOT NULL,
    CONSTRAINT "MoneyTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("merchantId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MoneyTransaction_paidToId_fkey" FOREIGN KEY ("paidToId") REFERENCES "Employee" ("employeeId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MoneyTransaction" ("accountType", "description", "merchantId", "paidToId", "paymentByCash", "paymentByCheck", "paymentByUPI", "paymentType", "totalAmount", "transactionDate", "transactionId") SELECT "accountType", "description", "merchantId", "paidToId", "paymentByCash", "paymentByCheck", "paymentByUPI", "paymentType", "totalAmount", "transactionDate", "transactionId" FROM "MoneyTransaction";
DROP TABLE "MoneyTransaction";
ALTER TABLE "new_MoneyTransaction" RENAME TO "MoneyTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
