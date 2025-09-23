import z from "zod";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews } from "@/lib/finnhub";
import {
  fetchCompanyName,
  fetchCompCompetitors,
  fetchStockData,
  fetchStockPerformance,
  fetchCompNews,
  fetchSymbolSearch,
  fetchMarketScreener,
  fetchMarketDataByTickers,
  fetchCryptoScreener,
  fetchTrendingTickers,
} from "@/lib/yahoo";
import { getStockNews } from "@/lib/polygon";
import {
  createAINewsSummary,
  createAINewsSummaryByLink,
} from "@/lib/langchain";
import {
  getAllFinnhubNewsSummary,
  getAllPolygonNewsSummary,
  getWebsiteHTMLText,
} from "@/lib/utils";
import { prisma } from "@/lib/db";
import puppeteer from "puppeteer";
import { marked } from "marked";

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

  createAINewsSummary: protectedProcedure
    .input(
      z.object({
        language: z.string(),
        providerName: z.string(),
        category: z.string(),
        days: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let accumulatedNews = "";
      if (input.providerName === "finnhub") {
        accumulatedNews = await getAllFinnhubNewsSummary(
          input.category.toLowerCase()
        );
      } else if (input.providerName === "polygon") {
        accumulatedNews = await getAllPolygonNewsSummary();
      } else {
        return;
      }

      if (accumulatedNews.length == 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No news found" });
      }

      const newsSummary = await createAINewsSummary(
        accumulatedNews,
        input.language,
        input.providerName,
        input.category,
        input.days
      );

      if (!newsSummary) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
      }

      const createdSummary = await prisma.newsSummary.create({
        data: {
          userId: ctx.auth.userId,
          aiRepsonse: newsSummary.content.toString(),
          provider: input.providerName,
          category: input.category,
          language: input.language,
          days: input.days,
        },
      });

      // manually insert id field, easy to query back from db. it was auto assigned by db, type number
      return { ...newsSummary, id: createdSummary.id };
    }),

  getAINewsSummary: protectedProcedure.query(async ({ ctx }) => {
    const newsSummary = prisma.newsSummary.findFirst({
      where: {
        userId: ctx.auth.userId,
        url: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!newsSummary) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Summary not found" });
    }

    return newsSummary;
  }),

  createAINewsSummaryByLink: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        language: z.string(),
        providerName: z.string(),
        category: z.string(),
        days: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.url.length == 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No link found",
        });
      }
      const article = await getWebsiteHTMLText(input.url);

      if (article.length == 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No news article found",
        });
      }

      const summaryByLink = await createAINewsSummaryByLink(
        article,
        input.language,
        input.providerName,
        input.category,
        input.days
      );

      if (!summaryByLink) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
      }

      const createdNewsSummaryByLink = await prisma.newsSummary.create({
        data: {
          userId: ctx.auth.userId,
          aiRepsonse: summaryByLink.content.toString(),
          provider: input.providerName,
          category: input.category,
          language: input.language,
          url: input.url,
          days: input.days,
        },
      });

      console.log(summaryByLink.content.toString());

      return createdNewsSummaryByLink;
    }),

  getAINewsSummaryByLink: protectedProcedure.query(async ({ ctx }) => {
    const summary = await prisma.newsSummary.findFirst({
      where: {
        userId: ctx.auth.userId,
        url: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return summary;
  }),

  markdownToPdf: protectedProcedure
    .input(z.object({ markdown: z.string() }))
    .mutation(async ({ input }) => {
      const { markdown } = input;

      // 1. Convert Markdown -> HTML
      const html = marked(markdown) as string;

      // 2. Optional: OCR on images
      // TODO: parse <img> tags and run Tesseract if needed

      // 3. Puppeteer: HTML -> PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm",
        },
      });

      await browser.close();

      // 4. Return base64 string of PDF
      return Buffer.from(pdfBuffer).toString("base64");
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
      const YahooStockData = await fetchStockData(
        input.ticker,
        input.range,
        input.interval
      );

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

  fetchCompNews: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
      })
    )
    .query(async ({ input }) => {
      const News = await fetchCompNews(input.ticker);

      if (!News) {
        throw new TRPCError({ code: "NOT_FOUND", message: "News not found" });
      }
      return News;
    }),

  searchSymbols: protectedProcedure // Add this new procedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Return empty array if query is too short to avoid useless API calls
      if (input.query.length < 2) {
        return [];
      }
      const results = await fetchSymbolSearch(input.query);
      if (!results) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Search failed" });
      }
      return results;
    }),

  fetchMarketScreener: protectedProcedure // Add this new procedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Return empty array if query is too short to avoid useless API calls
      if (input.query.length < 2) {
        return [];
      }
      const results = await fetchMarketScreener(input.query);
      if (!results) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Search failed" });
      }
      return results;
    }),

  fetchTrendingTickers: protectedProcedure.query(async () => {
    const results = await fetchTrendingTickers();
    if (!results) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Search failed" });
    }
    return results;
  }),

  fetchMarketDataByTickers: protectedProcedure
    .input(
      z.object({
        tickers: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      // Call the new, correct fetching function from lib/yahoo.ts
      const marketData = await fetchMarketDataByTickers(input.tickers);

      if (!marketData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed to fetch market data",
        });
      }
      return marketData;
    }),

  fetchCryptoScreener: protectedProcedure
    .input(
      z.object({
        screener: z.string(),
      })
    )
    .query(async ({ input }) => {
      const results = await fetchCryptoScreener(input.screener);
      if (!results) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Crypto screener failed",
        });
      }
      return results;
    }),
});
