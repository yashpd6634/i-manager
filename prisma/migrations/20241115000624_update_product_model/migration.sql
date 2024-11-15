/*
  Warnings:

  - Added the required column `piecesPerQuantity` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product" (
    "productId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "purchasedPrice" REAL,
    "wholesalePrice" REAL NOT NULL,
    "retailPrice" REAL NOT NULL,
    "piecesPerQuantity" INTEGER NOT NULL,
    "purchasedQuantity" INTEGER NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "inShopQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_product" ("createdAt", "currentQuantity", "expiryDate", "inShopQuantity", "name", "productId", "purchasedPrice", "purchasedQuantity", "retailPrice", "updatedAt", "wholesalePrice") SELECT "createdAt", "currentQuantity", "expiryDate", "inShopQuantity", "name", "productId", "purchasedPrice", "purchasedQuantity", "retailPrice", "updatedAt", "wholesalePrice" FROM "product";
DROP TABLE "product";
ALTER TABLE "new_product" RENAME TO "product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
