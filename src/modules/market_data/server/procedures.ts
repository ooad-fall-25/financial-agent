import z from "zod";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews, getCompanyNameFromFinnhub, searchSymbols, getCompanyPeers, getFinnhubClient} from "@/lib/finnhub";
import { alpacaApiV2, alpacaApiV1, alpacaCryptoApi, alpacaCryptoClient} from "@/lib/alpaca"; 
import { isAxiosError } from "axios";
import { Limelight } from "next/font/google";
import * as alpaca from "@/lib/alpaca";
export interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface AlpacaSnapshot {
latestTrade: { p: number; t: string };
dailyBar: { o: number; h: number; l: number; c: number; v: number };
prevDailyBar: { o: number; h: number; l: number; c: number; v: number };
symbol?: string; // Add the symbol property as optional
}

export interface HistoricalBar {
  t: string; // Timestamp
  c: number; // Close price
}

export interface CompetitorData {
  ticker: string;
  companyName: string;
  industry: string;
  marketCap: number; // in millions
  price: number;
  percentChange: number;
}

export interface AlpacaNewsArticle {
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

export interface ScreenerStock {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

export interface MarketMovers {
  gainers: ScreenerStock[];
  losers: ScreenerStock[];
}

export interface CryptoData {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  volume24h: number;
  sparklineData: number[];
}

const cryptoSymbols = [
  "BTC/USD",
  "ETH/USD",
  "USDT/USD",
  "XRP/USD",
  "SOL/USD",
  "USDC/USD",
  "DOGE/USD",
];

// Helper to wrap service calls and handle errors consistently
const handleProcedure = async <T>(serviceCall: () => Promise<T>) => {
  try {
    return await serviceCall();
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown server error occurred.";
    const code = message.toLowerCase().includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR";
    throw new TRPCError({ code, message });
  }
};

export const AlpacaDataRouter = createTRPCRouter({
  // --- Chart & Historical Data ---
  fetchStockData: protectedProcedure
    .input(z.object({ ticker: z.string(), range: z.string(), interval: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.getStockBars(input.ticker, input.range, input.interval))),

  fetchCryptoBars: protectedProcedure
    .input(z.object({ ticker: z.string(), range: z.string(), interval: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.getCryptoBars(input.ticker, input.range, input.interval))),

  // --- Core Data Points ---
  fetchStockSnapshot: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.getStockSnapshot(input.ticker))),

  fetchCryptoSnapshot: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.getCryptoSnapshot(input.ticker))),
    
  fetchCompanyName: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }) => {
        const data = await getCompanyNameFromFinnhub(input.ticker); // Simple enough to keep direct
        if (!data) throw new TRPCError({ code: "NOT_FOUND", message: `Company name not found for ${input.ticker}`});
        return data;
    }),

  // --- Search & Discovery ---
  searchSymbols: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.findSymbols(input.query))),

  // --- Market Overview ---
  fetchMarketMovers: protectedProcedure
    .query(() => handleProcedure(alpaca.getMarketMovers)),

  fetchMarketScreener: protectedProcedure
    .input(z.object({ screenerType: z.literal("most_actives") }))
    .query(() => handleProcedure(alpaca.getMarketScreener)),
  
  fetchCryptoList: protectedProcedure
    .query(() => handleProcedure(alpaca.getCryptoListData)),

  // --- Batch & Analytical Data ---
  fetchMarketDataByTickers: protectedProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(({ input }) => handleProcedure(() => alpaca.getMarketDataForTickers(input.tickers))),

  fetchSparklineData: protectedProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(({ input }) => handleProcedure(() => alpaca.getSparklineData(input.tickers))),

  // --- Company-Specific Analytics ---
  fetchStockPerformance: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.getStockPerformance(input.ticker))),

  fetchCompetitors: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(({ input }) => handleProcedure(() => alpaca.getCompetitorsData(input.ticker))),

  fetchStockNews: protectedProcedure
    .input(z.object({ ticker: z.string().optional(), limit: z.number().optional().default(10) }))
    .query(({ input }) => handleProcedure(() => alpaca.getStockNews(input.ticker, input.limit))),
});
