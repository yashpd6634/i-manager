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
      const expenseSummary = await prisma.expenseSummary.findMany({
        take: 5,
        orderBy: {
          date: "desc",
        },
      });
      const expenseByCategorySummaryRaw =
        await prisma.expenseByCategory.findMany({
          take: 5,
          orderBy: {
            date: "desc",
          },
        });

      const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
        (item) => ({
          ...item,
          amount: item.amount.toString(),
        })
      );

      return {
        popularProducts,
        expenseSummary,
        expenseByCategorySummary,
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
  getExpensesByCategory: t.procedure.query(async () => {
    try {
      const expenseByCategorySummaryRaw =
        await prisma.expenseByCategory.findMany({
          orderBy: {
            date: "desc",
          },
        });
      const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
        (item) => ({
          ...item,
          amount: item.amount.toString(),
        })
      );

      return { expenseByCategorySummary };
    } catch (error) {
      console.log("Error retrieving expenses by category", error);
    }
  }),
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
});

export type AppRouter = typeof appRouter;
