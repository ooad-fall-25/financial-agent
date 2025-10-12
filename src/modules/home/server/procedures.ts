import z from "zod";
import https from 'https';

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import axios from "axios"; 
import { prisma } from "@/lib/db";
import {
    getCompanyNameFromFinnhub, 
    getFinnhubClient
} from "@/lib/finnhub";
import { 
    alpacaApiV2, 
    alpacaApiV1
} from "@/lib/alpaca"; 
import AlphaVantageAPI from "@/lib/alphavantage"
import { isAxiosError } from "axios";

interface ScreenerStock {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

interface AlpacaNewsArticle {
  id: number;
  headline: string;
  summary: string;
  author: string;
  created_at: string;
  updated_at: string;
  source: string;
  url: string;
  symbols: string[];
  images: { size: "thumb" | "small" | "large"; url: string }[];
}

interface MarketMovers {
  gainers: ScreenerStock[];
  losers: ScreenerStock[];
}

interface YahooArticle {
    guid: string | null;
    link: string;
    pubDate: Date;
    source: string | null;
    title: string | null;
}

const parseAlphaVantageDate = (dateString: string): string => {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hour = dateString.substring(9, 11);
  const minute = dateString.substring(11, 13);
  const second = dateString.substring(13, 15);
  // Construct a standard ISO 8601 formatted string, which is universally parsable
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
};


interface AVNewsArticle {
  id: string;
  headline: string;
  source: string;
  url: string;
  created_at: string; // Will now be a standard ISO string
  summary: string;
  banner_image: string | null;
}

const alphaVantage = new AlphaVantageAPI(process.env.ALPHAVANTAGE_API_KEY!);


export const HomeDataRouter = createTRPCRouter({
  fetchCompanyName: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Call the corrected function from your finnhub library
      const companyData = await getCompanyNameFromFinnhub(input.ticker);

      if (!companyData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Company name not found for ticker: ${input.ticker}`,
        });
      }

      return companyData;
    }),

  fetchStockNews: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }): Promise<AlpacaNewsArticle[]> => {
      const { limit } = input;
      try {
        const response = await alpacaApiV1.get("/news", {
          params: {
            sort: "desc", // Most recent first
            limit: limit, // Let's limit to 10 articles for a clean UI
            include_content: false, // We only need the summary
          },
        });

        // The API returns { "news": [...] }, so we extract the array
        return response.data.news || [];
      } catch (error) {
        console.error(`Error fetching Alpaca news for :`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch news`,
        });
      }
    }),

    fetchAVStockNews: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        sort: z.string().optional().default('RELEVANCE')
      })
    )
    .query(async ({ input }): Promise<AVNewsArticle[]> => {
      try {
        const response = await alphaVantage.getNewsAndSentiment(
          input.limit
        );

        if (!response || !response.feed) {
          return [];
        }

        return response.feed.map((item: any) => ({
          id: item.url + item.time_published,
          headline: item.title,
          source: item.source,
          url: item.url,
          // --- UPDATED: Use the helper to return a standard date string ---
          created_at: parseAlphaVantageDate(item.time_published),
          summary: item.summary,
          banner_image: item.banner_image || null,
        }));
      } catch (error) {
        console.error("Error fetching Alpha Vantage news:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch news from Alpha Vantage.",
        });
      }
    }),

  fetchYahooFinanceNews: protectedProcedure
    .input(
      z.object({
        ticker: z.string().optional(), // Can be undefined for general news
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }): Promise<YahooArticle[]> => {
      const { ticker, limit } = input;
      const rapidApiKey = process.env.RAPIDAPI_KEY; // Securely load the key

      if (!rapidApiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'CRITICAL: RapidAPI key is not configured on the server.',
        });
      }

      // 3. Set up the parameters for the API call.
      // If a ticker is provided, we use it. Otherwise, we don't send the 'tickers' param to get general news.
      const params: { tickers?: string; type: string } = { type: 'ALL' };
      if (ticker) {
        params.tickers = ticker;
      }

      const options = {
        method: 'GET',
        url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/news',
        params: params,
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        },
      };

      try {
        // 4. Make the request using axios, which you already have in the project.
        const response = await axios.request(options);

        // 5. Process the response. The actual articles are usually in `response.data.body`.
        // We also use .slice() to respect the 'limit' input, as the API itself might not support it.
        const articles = response.data.body || [];
        return articles.slice(0, limit);

      } catch (error) {
        console.error("Error fetching from RapidAPI (Yahoo Finance):", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch news from Yahoo Finance.',
        });
      }
    }),

  fetchMarketScreener: protectedProcedure
    .input(
      z.object({
        // This input is now simpler, or could be removed if it only ever does one thing
        screenerType: z.literal("most_actives"),
      })
    )
    .query(async ({ input }): Promise<ScreenerStock[]> => {
      const { screenerType } = input; // This will always be 'most_actives'

      try {
        // No switch statement needed
        const activesResponse = await alpacaApiV1.get(
          "/screener/stocks/most-actives",
          {
            params: { by: "volume", top: 5 },
          }
        );
        const activeSymbols =
          activesResponse.data.most_actives?.map(
            (stock: any) => stock.symbol
          ) || [];

        if (activeSymbols.length === 0) return [];

        const snapshotsResponse = await alpacaApiV2.get("/stocks/snapshots", {
          params: { symbols: activeSymbols.join(","), feed: "delayed_sip" },
        });
        const snapshots = snapshotsResponse.data;

        return activeSymbols.map((symbol: string) => {
          const snapshot = snapshots[symbol];
          const price = snapshot?.latestTrade?.p ?? snapshot?.dailyBar?.c ?? 0;
          const prevDayClose = snapshot?.prevDailyBar?.c ?? 0;
          const change = price - prevDayClose;
          const percentChange =
            prevDayClose !== 0 ? (change / prevDayClose) * 100 : 0;
          return { symbol, price, change, percentChange };
        });
      } catch (error) {
        console.error(
          `Error fetching Alpaca screener for ${screenerType}:`,
          error
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch market screener data.`,
        });
      }
    }),

  fetchMarketMovers: protectedProcedure.query(
    async (): Promise<MarketMovers> => {
      try {
        const response = await alpacaApiV1.get("/screener/stocks/movers", {
          params: { top: 10 },
        });

        // Helper to transform the data into our consistent ScreenerStock shape
        const transformMover = (mover: any): ScreenerStock => ({
          symbol: mover.symbol,
          price: mover.price,
          change: mover.change,
          percentChange: mover.percent_change,
        });

        // Safely get and transform the gainers and losers arrays
        const gainers = response.data.gainers?.map(transformMover) || [];
        const losers = response.data.losers?.map(transformMover) || [];

        return { gainers, losers };
      } catch (error) {
        console.error(`Error fetching Alpaca market movers:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch market movers data.`,
        });
      }
    }
  )
});


