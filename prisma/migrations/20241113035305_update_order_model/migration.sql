/*
  Warnings:

  - Added the required column `billGeneratedBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "orderId" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billId" TEXT NOT NULL,
    "billGeneratedBy" TEXT NOT NULL,
    "paymentByUPI" INTEGER NOT NULL DEFAULT 0,
    "paymentByCash" INTEGER NOT NULL DEFAULT 0,
    "paymentByCheck" INTEGER NOT NULL DEFAULT 0,
    "account" TEXT NOT NULL DEFAULT 'None',
    "totalBill" INTEGER NOT NULL,
    "totalPaid" INTEGER NOT NULL,
    CONSTRAINT "Order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("merchantId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("merchantId", "orderDate", "orderId", "totalBill", "totalPaid") SELECT "merchantId", "orderDate", "orderId", "totalBill", "totalPaid" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
