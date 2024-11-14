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
  addMoneyToBalance: t.procedure
    .input(
      z.object({
        merchantId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input: { merchantId, amount } }) => {
      try {
        // Fetch the current stock of the product
        const merchant = await prisma.merchant.findUnique({
          where: { merchantId },
        });

        // Check if the product exists
        if (!merchant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Merchant not found",
          });
        }

        // Perform the stock movement: update godown and shop quantities
        const updatedMerchnt = await prisma.merchant.update({
          where: { merchantId },
          data: {
            balance: {
              increment: amount, // Increase stock in shop
            },
          },
        });

        return updatedMerchnt;
      } catch (error) {
        console.error("Error adding money to balance:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add money",
        });
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
});

export type AppRouter = typeof appRouter;
