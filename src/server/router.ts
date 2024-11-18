import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "./prisma";
import * as z from "zod";
// HACK: The `superjson` library is ESM-only (does not support CJS), while our codebase is CJS.
// This is a workaround to still get to use the latest version of the library from our codebase.
// https://github.com/blitz-js/superjson/issues/268
// https://www.npmjs.com/package/fix-esm
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const fixESM = require("fix-esm");
import type SuperJSON from "superjson";
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const superjson: SuperJSON = fixESM.require("superjson");

const t = initTRPC.create({
  transformer: superjson,
});

type ProductSales = {
  [productId: string]: {
    productId: string;
    name: string;
    soldQuantity: number;
    wholesalePrice: number;
    purchasedQuantity: number;
    currentQuantity: number;
  };
};

export const appRouter = t.router({
  getDashboardMeterics: t.procedure.query(async () => {
    try {
      // Get the current date
      const currentDate = new Date();

      // Calculate the date for 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);

      const orders = await prisma.order.findMany({
        include: {
          orderedProducts: true,
        },
      });

      const products = await prisma.product.findMany({});

      const productMap = products.reduce((map, product) => {
        map[product.productId] = product;
        return map;
      }, {} as Record<string, (typeof products)[0]>);

      const orderSummary = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= thirtyDaysAgo && orderDate <= currentDate;
      });

      const productSales: ProductSales = orderSummary.reduce((acc, order) => {
        order.orderedProducts.forEach((product) => {
          if (!acc[product.productId]) {
            const productDetails = productMap[product.productId];

            acc[product.productId] = {
              productId: product.productId,
              name: product.name,
              soldQuantity: 0,
              wholesalePrice: productDetails?.wholesalePrice || 0,
              purchasedQuantity: productDetails?.purchasedQuantity || 0,
              currentQuantity: productDetails?.currentQuantity || 0,
            };
          }
          acc[product.productId].soldQuantity += product.quantity;
        });
        return acc;
      }, {} as ProductSales); // Cast to ProductSales type

      // Convert aggregated sales into an array and sort by sold quantity
      const popularProducts = Object.values(productSales)
        .sort((a, b) => b.soldQuantity - a.soldQuantity)
        .slice(0, 15); // Take top 15 products

      // Fetch expenses from the database
      const expense = await prisma.expense.findMany({
        orderBy: {
          expendDate: "desc",
        },
      });

      // Filter expenses for the current month
      const expenseSummary = expense.filter((expense) => {
        const expenseDate = new Date(expense.expendDate);
        return expenseDate >= thirtyDaysAgo && expenseDate <= currentDate;
      });

      const merchants = await prisma.merchant.findMany({
        include: {
          orders: {
            where: {
              orderDate: {
                gte: thirtyDaysAgo, // Orders after the start of the month
                lte: currentDate, // Orders before the end of the month
              },
            },
          },
        },
      });

      const merchantSummary = merchants
        .map((merchant) => {
          // Calculate the total billed value for the merchant
          const totalBilled = merchant.orders.reduce((total, order) => {
            return total + order.totalBill; // Add the totalBill of each order
          }, 0);

          return {
            merchantId: merchant.merchantId,
            name: merchant.name,
            phoneNumber: merchant.phoneNumber,
            location: merchant.location,
            balance: merchant.balance,
            totalBilled, // Total billed value within the current month
          };
        })
        .sort((a, b) => b.totalBilled - a.totalBilled);

      return {
        popularProducts,
        expenseSummary,
        orderSummary,
        merchantSummary,
      };
    } catch (error) {
      console.log("API Failed: ", error);
    }
  }),
  getProducts: t.procedure
    .input(z.string().optional())
    .query(async ({ input: searchParams }) => {
      try {
        const products = await prisma.product.findMany({
          where: {
            name: {
              contains: searchParams ?? "",
            },
          },
        });

        return { products };
      } catch (error) {
        console.error("Error while retrieving products: ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve products",
        });
      }
    }),
  getProduct: t.procedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ input: { productId } }) => {
      try {
        const product = await prisma.product.findUnique({
          where: {
            productId: productId,
          },
        });

        return product;
      } catch (error) {
        console.error("Error while retrieving product: ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve product",
        });
      }
    }),
  createProduct: t.procedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string(),
        piecesPerQuantity: z.number(),
        wholesalePrice: z.number(),
        retailPrice: z.number(),
        purchasedQuantity: z.number(),
        expiryDate: z.date(),
      })
    )
    .mutation(
      async ({
        input: {
          productId,
          name,
          piecesPerQuantity,
          wholesalePrice,
          retailPrice,
          purchasedQuantity,
          expiryDate,
        },
      }) => {
        try {
          const products = await prisma.product.create({
            data: {
              productId,
              name,
              piecesPerQuantity,
              wholesalePrice,
              retailPrice,
              purchasedQuantity,
              expiryDate,
              currentQuantity: purchasedQuantity,
            },
          });

          return products;
        } catch (error) {
          console.log("Error creating products", error);
        }
      }
    ),
  updateProduct: t.procedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string(),
        piecesPerQuantity: z.number(),
        wholesalePrice: z.number(),
        retailPrice: z.number(),
        purchasedQuantity: z.number(),
        expiryDate: z.date(),
      })
    )
    .mutation(
      async ({
        input: {
          productId,
          name,
          piecesPerQuantity,
          wholesalePrice,
          retailPrice,
          purchasedQuantity,
          expiryDate,
        },
      }) => {
        try {
          const updatedProduct = await prisma.product.update({
            where: { productId },
            data: {
              name,
              piecesPerQuantity,
              wholesalePrice,
              retailPrice,
              purchasedQuantity,
              expiryDate,
            },
          });

          return updatedProduct;
        } catch (error) {
          console.error("Error failed to update product price:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update product price",
          });
        }
      }
    ),
  updateProductPrice: t.procedure
    .input(z.object({ productId: z.string(), amount: z.number() }))
    .mutation(async ({ input: { productId, amount } }) => {
      try {
        const updatedProduct = await prisma.product.update({
          where: { productId },
          data: {
            purchasedPrice: amount,
          },
        });

        return updatedProduct;
      } catch (error) {
        console.error("Error failed to update product price:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product price",
        });
      }
    }),
  getMerchants: t.procedure.query(async () => {
    try {
      const merchants = await prisma.merchant.findMany();

      return { merchants };
    } catch (error) {
      console.log("Error retrieving merchants", error);
    }
  }),
  getMerchantById: t.procedure
    .input(
      z.object({
        merchantId: z.string(),
      })
    )
    .query(async ({ input: { merchantId } }) => {
      try {
        const merchant = await prisma.merchant.findUnique({
          where: { merchantId: merchantId },
        });

        return { merchant };
      } catch (error) {
        console.log("Error retrieving merchant", error);
        throw new Error("Failed to retrieve merchant details");
      }
    }),
  addMerchant: t.procedure
    .input(
      z.object({
        merchantId: z.string(),
        name: z.string(),
        phoneNumber: z.string(),
        location: z.string(),
      })
    )
    .mutation(
      async ({ input: { merchantId, name, phoneNumber, location } }) => {
        try {
          const products = await prisma.merchant.create({
            data: {
              merchantId,
              name,
              phoneNumber,
              location,
            },
          });

          return products;
        } catch (error) {
          console.log("Error creating products", error);
        }
      }
    ),
  getExpenses: t.procedure.query(async () => {
    try {
      const expenses = await prisma.expense.findMany({
        orderBy: {
          expendDate: "desc",
        },
      });

      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        expenses,
        totalExpenses,
      };
    } catch (error) {
      console.log("Error retrieving expenses", error);
    }
  }),
  addExpense: t.procedure
    .input(
      z.object({
        category: z.string(),
        amount: z.number(),
        expendDate: z.date(),
        description: z.string(),
      })
    )
    .mutation(
      async ({ input: { category, amount, expendDate, description } }) => {
        try {
          const expense = await prisma.expense.create({
            data: {
              category,
              amount,
              expendDate,
              description: description ?? "",
            },
          });

          return expense;
        } catch (error) {
          console.error("Error creating expense:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create expense",
          });
        }
      }
    ),
  getOrders: t.procedure.query(async () => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          merchant: true,
          billGeneratedBy: true,
        },
      });

      return { orders };
    } catch (error) {
      console.log("Error retrieving orders", error);
    }
  }),
  getOrderById: t.procedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .query(async ({ input: { orderId } }) => {
      try {
        const order = await prisma.order.findUnique({
          where: { orderId: orderId },
          include: {
            merchant: true,
            billGeneratedBy: true,
            orderedProducts: true,
          },
        });

        return { order };
      } catch (error) {
        console.log("Error retrieving order", error);
        throw new Error("Failed to retrieve order details");
      }
    }),
  getOrdersWithProduct: t.procedure.query(async () => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          merchant: true,
          billGeneratedBy: true,
          orderedProducts: true,
        },
      });

      return { orders };
    } catch (error) {
      console.log("Error retrieving orders", error);
    }
  }),
  takeOrder: t.procedure
    .input(
      z.object({
        orderId: z.string(),
        merchantId: z.string(),
        products: z.array(
          z.object({
            productId: z.string(),
            name: z.string(),
            quantity: z.number(),
            soldPrice: z.number(),
            stockSource: z.enum(["Godown", "Shop"]), // Add stockSource here
          })
        ),
        billId: z.string(),
        billGeneratedById: z.string(),
        paymentByUPI: z.number(),
        paymentByCheck: z.number(),
        paymentByCash: z.number(),
        accountType: z.string(),
        totalBill: z.number(),
        totalPaid: z.number(),
      })
    )
    .mutation(
      async ({
        input: {
          orderId,
          merchantId,
          products,
          billId,
          billGeneratedById,
          paymentByUPI,
          paymentByCheck,
          paymentByCash,
          accountType,
          totalBill,
          totalPaid,
        },
      }) => {
        try {
          // Start transaction for atomic operations
          const result = await prisma.$transaction(async (prisma) => {
            // Step 1: Create the order
            const order = await prisma.order.create({
              data: {
                orderId,
                merchantId,
                billId,
                billGeneratedById,
                paymentByUPI,
                paymentByCheck,
                paymentByCash,
                accountType,
                totalBill,
                totalPaid,
              },
            });

            // Step 2: Create ordered products and update quantities
            for (const product of products) {
              await prisma.orderedProduct.create({
                data: {
                  orderId: order.orderId,
                  productId: product.productId,
                  name: product.name,
                  quantity: product.quantity,
                  soldPrice: product.soldPrice,
                },
              });

              // Conditionally decrement quantities based on stockSource
              await prisma.product.update({
                where: { productId: product.productId },
                data: {
                  currentQuantity: {
                    decrement: product.quantity,
                  },
                  ...(product.stockSource === "Shop" && {
                    inShopQuantity: {
                      decrement: product.quantity,
                    },
                  }),
                },
              });
            }

            // Step 3: Update merchant's balance
            await prisma.merchant.update({
              where: { merchantId },
              data: {
                balance: {
                  increment: totalPaid - totalBill,
                },
              },
            });

            // Only return the order details
            return order;
          });

          return result;
        } catch (error) {
          console.error("Error processing order:", error);
          throw new Error("Order processing failed");
        }
      }
    ),
  moveStockToShop: t.procedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"), // Ensure quantity is positive
      })
    )
    .mutation(async ({ input: { productId, quantity } }) => {
      try {
        // Fetch the current stock of the product
        const product = await prisma.product.findUnique({
          where: { productId },
        });

        // Check if the product exists
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Check if there is enough stock in the godown
        if (product.currentQuantity - product.inShopQuantity < quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not enough stock in godown to move",
          });
        }

        // Perform the stock movement: update godown and shop quantities
        const updatedProduct = await prisma.product.update({
          where: { productId },
          data: {
            inShopQuantity: {
              increment: quantity, // Increase stock in shop
            },
          },
        });

        return updatedProduct;
      } catch (error) {
        console.error("Error moving stock:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to move stock",
        });
      }
    }),
  paidMoneyTransaction: t.procedure
    .input(
      z.object({
        transactionId: z.string(),
        merchantId: z.string(),
        paymentType: z.string(),
        paidToId: z.string(),
        paymentByUPI: z.number(),
        paymentByCheck: z.number(),
        paymentByCash: z.number(),
        accountType: z.string(),
        totalAmount: z.number(),
        description: z.string(),
      })
    )
    .mutation(
      async ({
        input: {
          transactionId,
          merchantId,
          paymentType,
          paidToId,
          paymentByUPI,
          paymentByCheck,
          paymentByCash,
          accountType,
          totalAmount,
          description,
        },
      }) => {
        try {
          const merchant = await prisma.merchant.findUnique({
            where: { merchantId },
          });

          if (!merchant) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Merchant not found",
            });
          }

          // Start transaction for atomic operations
          const result = await prisma.$transaction(async (prisma) => {
            const moneyTransaction = await prisma.moneyTransaction.create({
              data: {
                transactionId,
                merchantId,
                paymentType,
                paidToId,
                paymentByUPI,
                paymentByCheck,
                paymentByCash,
                accountType,
                totalAmount,
                description,
              },
            });

            await prisma.merchant.update({
              where: { merchantId },
              data: {
                balance: {
                  increment: paymentType === "Add" ? totalAmount : -totalAmount,
                },
              },
            });

            return moneyTransaction;
          });

          return result;
        } catch (error) {
          console.error("Error adding money to balance:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add money",
          });
        }
      }
    ),
  getMoneyTransactions: t.procedure.query(async () => {
    try {
      const moneyTransaction = await prisma.moneyTransaction.findMany({
        include: {
          merchant: true,
          paidTo: true,
        },
      });

      return { moneyTransaction };
    } catch (error) {
      console.log("Error retrieving orders", error);
    }
  }),
  getMoneyTransactionById: t.procedure
    .input(
      z.object({
        merchantId: z.string(),
      })
    )
    .query(async ({ input: { merchantId } }) => {
      try {
        const moneyTransaction = await prisma.moneyTransaction.findMany({
          where: { merchantId: merchantId },
          include: {
            merchant: true,
            paidTo: true,
          },
        });

        return { moneyTransaction };
      } catch (error) {
        console.log("Error retrieving order", error);
        throw new Error("Failed to retrieve order details");
      }
    }),
  getEmployees: t.procedure.query(async () => {
    try {
      const employees = await prisma.employee.findMany();

      return { employees };
    } catch (error) {
      console.log("Error retrieving employees", error);
    }
  }),
  addEmployee: t.procedure
    .input(
      z.object({
        employeeId: z.string(),
        name: z.string(),
        phoneNumber: z.string(),
        role: z.string(),
        location: z.string(),
        joinedDate: z.date(),
      })
    )
    .mutation(
      async ({
        input: { employeeId, name, phoneNumber, role, location, joinedDate },
      }) => {
        try {
          const employee = await prisma.employee.create({
            data: {
              employeeId,
              name,
              phoneNumber,
              role,
              location,
              joinedDate,
            },
          });

          return employee;
        } catch (error) {
          console.log("Error creating employees", error);
        }
      }
    ),
  checkPassword: t.procedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input: { password } }) => {
      const originalPassword = "Yash0285";
      return { success: password === originalPassword };
    }),
});

export type AppRouter = typeof appRouter;
