-- CreateTable
CREATE TABLE "MoneyTransaction" (
    "transactionId" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "paidTo" TEXT NOT NULL,
    "paymentByUPI" INTEGER NOT NULL DEFAULT 0,
    "paymentByCash" INTEGER NOT NULL DEFAULT 0,
    "paymentByCheck" INTEGER NOT NULL DEFAULT 0,
    "accountType" TEXT NOT NULL DEFAULT 'None',
    "totalAmount" INTEGER NOT NULL,
    CONSTRAINT "MoneyTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("merchantId") ON DELETE CASCADE ON UPDATE CASCADE
);
