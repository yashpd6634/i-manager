/*
  Warnings:

  - You are about to drop the column `paidTo` on the `MoneyTransaction` table. All the data in the column will be lost.
  - Added the required column `paidToId` to the `MoneyTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoneyTransaction" (
    "transactionId" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "paidToId" TEXT NOT NULL,
    "paymentByUPI" INTEGER NOT NULL DEFAULT 0,
    "paymentByCash" INTEGER NOT NULL DEFAULT 0,
    "paymentByCheck" INTEGER NOT NULL DEFAULT 0,
    "accountType" TEXT NOT NULL DEFAULT 'None',
    "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" INTEGER NOT NULL,
    CONSTRAINT "MoneyTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("merchantId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MoneyTransaction_paidToId_fkey" FOREIGN KEY ("paidToId") REFERENCES "Employee" ("employeeId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MoneyTransaction" ("accountType", "merchantId", "paymentByCash", "paymentByCheck", "paymentByUPI", "totalAmount", "transactionId") SELECT "accountType", "merchantId", "paymentByCash", "paymentByCheck", "paymentByUPI", "totalAmount", "transactionId" FROM "MoneyTransaction";
DROP TABLE "MoneyTransaction";
ALTER TABLE "new_MoneyTransaction" RENAME TO "MoneyTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
