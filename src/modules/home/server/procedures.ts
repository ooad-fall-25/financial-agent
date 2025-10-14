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
  companyName: string; 
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
    url: string;
    pubDate: Date;
    source: string;
    title: string;
    img: string;
    ago: string;
    tickers: string[];
}

interface AlpacaSnapshot {
  latestTrade: { p: number; t: string };
  dailyBar: { o: number; h: number; l: number; c: number; v: number };
  prevDailyBar: { o: number; h: number; l: number; c: number; v: number };
}

interface YahooTrendingTickerResponse {
  body: string[];
}

export const HomeDataRouter = createTRPCRouter({
  fetchCompanyName: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
      })
    )
    .query(async ({ input }) => {
      const companyData = await getCompanyNameFromFinnhub(input.ticker);

      if (!companyData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Company name not found for ticker: ${input.ticker}`,
        });
      }

      return companyData;
    }),

  fetchCompanyNames: protectedProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(async ({ input }) => {
        const companyDataPromises = input.tickers.map(async (ticker) => {
            const name = await getCompanyNameFromFinnhub(ticker);
            return { ticker, name: name ?? 'N/A' }; 
        });

        const companyData = await Promise.all(companyDataPromises);

        if (!companyData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Company name not found for tickers`,
          });
        }
        
        return companyData;
    }),

  fetchStockNews: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }): Promise<AlpacaNewsArticle[]> => {
      const { limit } = input;
      try {
        const response = await alpacaApiV1.get("/news", {
          params: {
            sort: "desc", 
            limit: limit, 
            include_content: false, 
          },
        });

        return response.data.news || [];
      } catch (error) {
        console.error(`Error fetching Alpaca news for :`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch news`,
        });
      }
    }),

  fetchYahooFinanceNews: protectedProcedure
    .input(
      z.object({
        ticker: z.string().optional(), 
        limit: z.number().optional().default(15),
      })
    )
    .query(async ({ input }): Promise<YahooArticle[]> => {
      const { ticker, limit } = input;
      const rapidApiKey = process.env.RAPIDAPI_KEY;

      if (!rapidApiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'CRITICAL: RapidAPI key is not configured on the server.',
        });
      }

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
        const response = await axios.request(options);
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

    fetchYahooTrendingTicker: protectedProcedure
    .input(
      z.object({
      })
    )
    .query(async ({ input }): Promise<YahooTrendingTickerResponse> => {
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      const limit = 10

      if (!rapidApiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'CRITICAL: RapidAPI key is not configured on the server.',
        });
      }

      const options = {
        method: 'GET',
        url: 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/tr/trending',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        },
      };

      try {
        const response = await axios.request(options);
        const tickers = response.data.body || [];
        const finalTickers = tickers.slice(0, limit)
        console.log(finalTickers)
        return  { body: finalTickers || [] };

      } catch (error) {
        console.error("Error fetching from RapidAPI (Yahoo Finance):", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch news from Yahoo Finance.',
        });
      }
    }),

    fetchStockSnapshot: protectedProcedure
      .input(z.object({ 
        ticker: z.string()
      }))
      .query(async ({ input }): Promise<AlpacaSnapshot> => {
        const { ticker } = input;
  
        const requestParams = {
          symbols: ticker,
          feed: "delayed_sip",
        };
  
        try {
          const response = await alpacaApiV2.get("/stocks/snapshots", {
            params: requestParams,
          });
      
          const snapshotData = response.data[ticker];
  
          if (!snapshotData || !snapshotData.prevDailyBar) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Snapshot data not found or incomplete for ${ticker}.`,
            });
          }
  
          return snapshotData;
        } catch (error) {
  
          if (isAxiosError(error)) {
            console.error("[TRPC CRITICAL ERROR] Axios error details:", {
              status: error.response?.status,
              data: error.response?.data,
              config: error.config, 
            });
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to fetch snapshot for ${ticker}.`,
              cause: error.response?.data,
            });
          }
  
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unknown error occurred while fetching snapshot.",
          });
        }
      }),

   fetchMarketDataByTickers: protectedProcedure
     .input(z.object({ 
      tickers: z.array(z.string()) 
    }))
     .query(async ({ input }): Promise<AlpacaSnapshot[]> => {
       const { tickers } = input;
       if (tickers.length === 0) 
        return [];
 
       try {
        console.log(tickers)
         const snapshotsResponse = await alpacaApiV2.get("/stocks/snapshots", {
           params: { symbols: tickers.join(","), feed: "delayed_sip" },
         });
         const snapshots = snapshotsResponse.data;
 
         return tickers.map((ticker) => snapshots[ticker]).filter(Boolean);
       } catch (error) {
         console.error(
           `Error fetching batch snapshots for ${tickers.join(",")}:`,
           error
         );
         throw new TRPCError({
           code: "INTERNAL_SERVER_ERROR",
           message: "Failed to fetch market data from Alpaca.",
         });
       }
     }),



fetchMarketScreener: protectedProcedure
    .input(
      z.object({
        screenerType: z.literal("most_actives"),
      })
    )
    .query(async ({ input }): Promise<ScreenerStock[]> => {
      const { screenerType } = input;

      try {
        const activesResponse = await alpacaApiV1.get(
          "/screener/stocks/most-actives",
          {
            params: { by: "volume", top: 7 },
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

        const enrichedStocksPromises = activeSymbols.map(async (symbol: string) => {
          const snapshot = snapshots[symbol];
          const price = snapshot?.latestTrade?.p ?? snapshot?.dailyBar?.c ?? 0;
          const prevDayClose = snapshot?.prevDailyBar?.c ?? 0;
          const change = price - prevDayClose;
          const percentChange =
            prevDayClose !== 0 ? (change / prevDayClose) * 100 : 0;
          const companyData = await getCompanyNameFromFinnhub(symbol);
          const companyName = companyData? companyData.companyName : symbol; 

          return { 
            symbol, 
            companyName, 
            price, 
            change, 
            percentChange 
          };
        });

        const enrichedStocks = await Promise.all(enrichedStocksPromises);
        return enrichedStocks;

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

        const transformAndEnrichMover = async (mover: any): Promise<ScreenerStock> => {
          const companyData = await getCompanyNameFromFinnhub(mover.symbol);
          const companyName = companyData? companyData : mover.symbol; 

          return {
            symbol: mover.symbol,
            companyName: companyName, 
            price: mover.price,
            change: mover.change,
            percentChange: mover.percent_change,
          };
        };

        const gainersPromises = response.data.gainers?.map(transformAndEnrichMover) || [];
        const losersPromises = response.data.losers?.map(transformAndEnrichMover) || [];

        const gainers = await Promise.all(gainersPromises);
        const losers = await Promise.all(losersPromises);

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