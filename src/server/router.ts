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

export const appRouter = t.router({
  getDashboardMeterics: t.procedure.query(async () => {
    try {
      const popularProducts = await prisma.product.findMany({
        take: 15,
        orderBy: {
          currentQuantity: "desc",
        },
      });
      const expenseSummary = await prisma.expense.findMany({
        take: 5,
        orderBy: {
          expendDate: "desc",
        },
      });

      return {
        popularProducts,
        expenseSummary,
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
  createProduct: t.procedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string(),
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
  getMerchants: t.procedure.query(async () => {
    try {
      const merchants = await prisma.merchant.findMany();

      return { merchants };
    } catch (error) {
      console.log("Error retrieving merchants", error);
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

      // Aggregate data by category and calculate total expenses
      const expenseByCategory = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { category: expense.category, amount: 0 };
        }
        acc[expense.category].amount += expense.amount;
        return acc;
      }, {} as Record<string, { category: string; amount: number }>);

      // Create a unique color for each category
      const colorPalette = [
        "#FF6347",
        "#4682B4",
        "#32CD32",
        "#FFD700",
        "#8A2BE2",
        "#D2691E",
        "#FF1493",
        "#00BFFF",
        "#8B0000",
        "#A52A2A",
      ];

      const categoryData = Object.values(expenseByCategory).map(
        (item, index) => ({
          ...item,
          color: colorPalette[index % colorPalette.length], // Cycle through colors
        })
      );

      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        expenses,
        expenseByCategory: categoryData,
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
          })
        ),
        totalBill: z.number(),
        totalPaid: z.number(),
      })
    )
    .mutation(
      async ({
        input: { orderId, merchantId, products, totalBill, totalPaid },
      }) => {
        try {
          // Start transaction for atomic operations
          const result = await prisma.$transaction(async (prisma) => {
            // Step 1: Create the order
            const order = await prisma.order.create({
              data: {
                orderId,
                merchantId,
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

              // Update current quantity of the product
              await prisma.product.update({
                where: { productId: product.productId },
                data: {
                  currentQuantity: {
                    decrement: product.quantity,
                  },
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
});

export type AppRouter = typeof appRouter;
