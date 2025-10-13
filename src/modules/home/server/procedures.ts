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

interface MarketauxArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: Date;
  source: string;
}

const parseAlphaVantageDate = (dateString: string): string => {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hour = dateString.substring(9, 11);
  const minute = dateString.substring(11, 13);
  const second = dateString.substring(13, 15);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
};


interface AVNewsArticle {
  id: string;
  headline: string;
  source: string;
  url: string;
  created_at: string; 
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

    fetchMarketauxTrendingNews: protectedProcedure
    .input(
      z.object({
        country: z.string().optional(),
        search: z.string().optional()
      })
    )
    .query(async ({  }): Promise<MarketauxArticle[]> => {
      const apiKey = process.env.MARKETAUX_API_KEY;
      const countries = "us"
      const search = "stock"

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "CRITICAL: Marketaux API key is not configured on the server.",
        });
      }

      const params: {
        api_token: string;
        countries: string;
        search: string;
      } = {
        api_token: apiKey,
        countries: countries,
        search: search 
      };

      try {
        const response = await axios.get("https://api.marketaux.com/v1/news/all", {
          params: params,
        });

        const articles = response.data.data || [];

        return articles.map((article: any) => ({
          uuid: article.uuid,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.image_url,
          publishedAt: new Date(article.published_at), 
          source: article.source,
        }));

      } catch (error) {
        console.error("Error fetching from Marketaux:", isAxiosError(error) ? error.response?.data : error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch news from Marketaux.",
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