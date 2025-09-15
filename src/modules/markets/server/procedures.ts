import z from "zod";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews } from "@/lib/finnhub";
import { getStockNews } from "@/lib/polygon";

export const marketsRouter = createTRPCRouter({
  getMarketNews: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        minId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { data: marketNews } = await getMarketNews(
        input.category,
        input.minId
      );

      if (!marketNews) {
        throw new TRPCError({ code: "NOT_FOUND", message: "News not found" });
      }
      return marketNews;
    }),

  getPolygonStockNews: protectedProcedure.query(async () => {
    const stockNews = await getStockNews();
    const result = stockNews.results;
    return result;
  }),
});
