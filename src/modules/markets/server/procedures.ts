import z from "zod";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews } from "@/lib/finnhub";
import { fetchCompanyName, fetchCompCompetitors, fetchStockData, fetchStockPerformance} from "@/lib/yahoo";
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

export const YahooFinanceRouter = createTRPCRouter({
  fetchStockData: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        range: z.string(),
        interval: z.string(),
      })
    )
    .query(async ({ input }) => {
      const YahooStockData = await fetchStockData(input.ticker, input.range, input.interval);

      if (!YahooStockData) {
        throw new TRPCError({ code: "NOT_FOUND", message: "News not found" });
      }
      return YahooStockData;
    }),
    

    fetchCompanyName: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
      })
    )
    .query(async ({ input }) => {
      const YahooStockSummary = await fetchCompanyName(input.ticker);

      if (!YahooStockSummary) {
        throw new TRPCError({ code: "NOT_FOUND", message: "News not found" });
      }
      return YahooStockSummary;
    }),

    fetchStockPerformance: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
      })
    )
    .query(async ({ input }) => {
      const YahooStockPerformance = await fetchStockPerformance(input.ticker);

      if (!YahooStockPerformance) {
        throw new TRPCError({ code: "NOT_FOUND", message: "News not found" });
      }
      return YahooStockPerformance;
    }),

    fetchCompCompetitors: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
      })
    )
    .query(async ({ input }) => {
      const Competitors = await fetchCompCompetitors(input.ticker);

      if (!Competitors) {
        throw new TRPCError({ code: "NOT_FOUND", message: "News not found" });
      }
      return Competitors;
    }),

  
});
