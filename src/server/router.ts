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
      const popularProducts = await prisma.products.findMany({
        take: 15,
        orderBy: {
          stockQuantity: "desc",
        },
      });
      const salesSummary = await prisma.salesSummary.findMany({
        take: 5,
        orderBy: {
          date: "desc",
        },
      });
      const purchaseSummary = await prisma.purchaseSummary.findMany({
        take: 5,
        orderBy: {
          date: "desc",
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
        salesSummary,
        purchaseSummary,
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
        const products = await prisma.products.findMany({
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
  createProducts: t.procedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        rating: z.number(),
        stockQuantity: z.number(),
      })
    )
    .mutation(
      async ({ input: { productId, name, price, rating, stockQuantity } }) => {
        try {
          const products = await prisma.products.create({
            data: {
              productId,
              name,
              price,
              rating,
              stockQuantity,
            },
          });

          return products;
        } catch (error) {
          console.log("", error);
        }
      }
    ),
});

export type AppRouter = typeof appRouter;
