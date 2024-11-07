/*
  Warnings:

  - You are about to drop the column `wholsalePrice` on the `Product` table. All the data in the column will be lost.
  - Added the required column `wholesalePrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
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
INSERT INTO "new_Product" ("createdAt", "currentQuantity", "expiryDate", "godownQuantity", "name", "productId", "purchasedPrice", "purchasedQuantity", "retailPrice", "shopQuantity", "updatedAt") SELECT "createdAt", "currentQuantity", "expiryDate", "godownQuantity", "name", "productId", "purchasedPrice", "purchasedQuantity", "retailPrice", "shopQuantity", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
