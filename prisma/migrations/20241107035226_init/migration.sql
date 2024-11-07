/*
  Warnings:

  - You are about to drop the `OrderedProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OrderedProduct";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Product";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "product" (
    "productId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "purchasedPrice" REAL,
    "wholesalePrice" REAL NOT NULL,
    "retailPrice" REAL NOT NULL,
    "purchasedQuantity" INTEGER NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "godownQuantity" INTEGER,
    "shopQuantity" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "orderedProduct" (
    "orderedProductId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "soldPrice" REAL NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    CONSTRAINT "orderedProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("orderId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orderedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product" ("productId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "orderedProduct_productId_key" ON "orderedProduct"("productId");
