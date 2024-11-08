/*
  Warnings:

  - You are about to alter the column `quantity` on the `orderedProduct` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orderedProduct" (
    "orderedProductId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldPrice" REAL NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    CONSTRAINT "orderedProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("orderId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orderedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product" ("productId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orderedProduct" ("name", "orderId", "orderedProductId", "productId", "quantity", "soldPrice") SELECT "name", "orderId", "orderedProductId", "productId", "quantity", "soldPrice" FROM "orderedProduct";
DROP TABLE "orderedProduct";
ALTER TABLE "new_orderedProduct" RENAME TO "orderedProduct";
CREATE UNIQUE INDEX "orderedProduct_productId_key" ON "orderedProduct"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
