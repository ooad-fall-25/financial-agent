import z from "zod";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews, getCompanyNameFromFinnhub, searchSymbols, getCompanyPeers, getFinnhubClient} from "@/lib/finnhub";
import { alpacaApiV2, alpacaApiV1, alpacaCryptoApi, alpacaCryptoClient} from "@/lib/alpaca"; 
import { isAxiosError } from "axios";

interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface AlpacaSnapshot {
  latestTrade: { p: number; t: string };
  dailyBar: { o: number; h: number; l: number; c: number; v: number };
  // Correct the property name to match the API response
  prevDailyBar: { o: number; h: number; l: number; c: number; v: number };
}

interface HistoricalBar {
  t: string; // Timestamp
  c: number; // Close price
}

interface CompetitorData {
  ticker: string;
  companyName: string;
  industry: string;
  marketCap: number; // in millions
  price: number;
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

interface ScreenerStock {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

interface MarketMovers {
  gainers: ScreenerStock[];
  losers: ScreenerStock[];
}

interface CryptoData {
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

const fetchLongTermBarsFromAlpaca = async (
  symbol: string
): Promise<HistoricalBar[]> => {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const formattedStartDate = fiveYearsAgo.toISOString().slice(0, 10);

  try {
    const response = await alpacaApiV2.get(`/stocks/${symbol}/bars`, {
      params: {
        timeframe: "1Day",
        start: formattedStartDate,
        limit: 10000,
        adjustment: "raw", // This is correct, we are intentionally getting raw prices
      },
    });
    return (response.data.bars || []).map((bar: any) => ({
      t: bar.t,
      c: bar.c,
    }));
  } catch (error) {
    console.error(
      `Alpaca API error inside fetchLongTermBars for ${symbol}:`,
      error
    );
    throw new Error(`Failed to fetch long-term data for ${symbol}.`);
  }
};

export const AlpacaDataRouter = createTRPCRouter({
  fetchStockData: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        range: z.string(),
        interval: z.string(),
      })
    )
    // --- ADD AN EXPLICIT RETURN TYPE HINT ---
    .query(async ({ input }): Promise<AlpacaBar[]> => {
      const { ticker, range, interval } = input;

      const start = new Date();
      // ... (your switch case for date logic remains the same)
      switch (range) {
        case "1d":
          start.setDate(start.getDate() - 1);
          break;
        case "5d":
          start.setDate(start.getDate() - 5);
          break;
        case "1mo":
          start.setMonth(start.getMonth() - 1);
          break;
        case "6mo":
          start.setMonth(start.getMonth() - 6);
          break;
        case "ytd":
          start.setMonth(0);
          start.setDate(1);
          break;
        case "1y":
          start.setFullYear(start.getFullYear() - 1);
          break;
        case "5y":
          start.setFullYear(start.getFullYear() - 5);
          break;
        case "max":
          start.setFullYear(start.getFullYear() - 10);
          break;
        default:
          start.setDate(start.getDate() - 1);
      }

      try {
        const response = await alpacaApiV2.get(`/stocks/${ticker}/bars`, {
          params: {
            timeframe: interval,
            start: start.toISOString(),
            limit: 10000,
            adjustment: "raw",
            feed: "sip",
            sort: "asc",
          },
        });

        // --- GUARANTEE AN ARRAY IS RETURNED ---
        // If response.data.bars is null or undefined, return an empty array.
        // This guarantees the 'happy path' always returns the correct type.
        return response.data.bars || [];
      } catch (error) {
        // This catch block will now handle both Axios and other errors,
        // but it will always THROW, never return. This is key for inference.
        console.error(`Error fetching stock data for ${ticker}:`, error);

        if (isAxiosError(error)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch data from Alpaca for ${ticker}.`,
            cause: error.response?.data,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error occurred while fetching stock data.",
        });
      }
    }),

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

  searchSymbols: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (input.query.length < 1) {
        return { result: [] };
      }

      const searchResults = await searchSymbols(input.query);

      if (
        !searchResults ||
        !searchResults.result ||
        searchResults.result.length === 0
      ) {
        return { result: [] };
      }

      const upperCaseQuery = input.query.toUpperCase();
      const results = searchResults.result;

      const exactMatch = results.find(
        (stock) => stock.symbol === upperCaseQuery
      );

      if (exactMatch) {
        return { result: [exactMatch] };
      }

      const filteredResults = results.filter(
        (stock) =>
          stock.symbol &&
          !stock.symbol.includes(".") &&
          stock.type === "Common Stock"
      );
      return { result: filteredResults.slice(0, 5) };
    }),

  fetchStockSnapshot: protectedProcedure
    .input(z.object({ ticker: z.string() }))
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

        // LOG 3: See the raw response from Alpaca if the call succeeds

        const snapshotData = response.data[ticker];

        if (!snapshotData || !snapshotData.prevDailyBar) {
          // LOG 4: This will run if the data is missing for the ticker
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Snapshot data not found or incomplete for ${ticker}.`,
          });
        }

        // LOG 5: This means everything was successful
        return snapshotData;
      } catch (error) {
        // --- THIS IS THE MOST IMPORTANT LOG ---
        // It will show us the exact error that is causing the crash.

        if (isAxiosError(error)) {
          // Log the specific details from the Axios error
          console.error("[TRPC CRITICAL ERROR] Axios error details:", {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config, // This shows the exact request that was made
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

  fetchStockPerformance: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }) => {
      const { ticker } = input;
      const benchmarkTicker = "SPY"; // Use SPY ETF as the S&P 500 benchmark

      // --- Helper functions for calculation (local to this procedure) ---
      const calculateReturn = (
        startPrice?: number,
        endPrice?: number
      ): number => {
        if (
          startPrice === undefined ||
          endPrice === undefined ||
          startPrice === 0
        )
          return 0.0;
        return ((endPrice - startPrice) / startPrice) * 100;
      };

      const findPriceOnOrBefore = (
        targetDate: Date,
        data: HistoricalBar[]
      ): number | undefined => {
        for (let i = data.length - 1; i >= 0; i--) {
          const barDate = new Date(data[i].t);
          barDate.setUTCHours(0, 0, 0, 0);
          if (barDate <= targetDate) {
            return data[i].c;
          }
        }
        return undefined;
      };

      try {
        // --- THE FIX: Use the SAME helper for both requests ---
        // Now that our API request format is correct, this should succeed for both.
        const [stockData, benchmarkData] = await Promise.all([
          fetchLongTermBarsFromAlpaca(ticker),
          fetchLongTermBarsFromAlpaca(benchmarkTicker),
        ]);

        if (stockData.length < 2 || benchmarkData.length < 2) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Insufficient historical data.",
          });
        }

        // --- THE REST OF THE LOGIC IS NOW CORRECT AND NO LONGER NEEDS COMPLEX CONDITIONS ---
        const latestStockPrice = stockData[stockData.length - 1].c;
        const latestBenchmarkPrice = benchmarkData[benchmarkData.length - 1].c;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const ytdStartDate = new Date(
          Date.UTC(today.getUTCFullYear() - 1, 11, 31)
        );
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getUTCFullYear() - 1);
        const threeYearsAgo = new Date(today);
        threeYearsAgo.setFullYear(today.getUTCFullYear() - 3);

        // We can now reliably get the 5-year start price for both
        const fiveYearStockPrice = stockData[0]?.c;
        const fiveYearBenchmarkPrice = benchmarkData[0]?.c;

        const performanceData = [
          {
            period: "YTD Return",
            stock_return: calculateReturn(
              findPriceOnOrBefore(ytdStartDate, stockData),
              latestStockPrice
            ),
            benchmark_return: calculateReturn(
              findPriceOnOrBefore(ytdStartDate, benchmarkData),
              latestBenchmarkPrice
            ),
          },
          {
            period: "1-Year Return",
            stock_return: calculateReturn(
              findPriceOnOrBefore(oneYearAgo, stockData),
              latestStockPrice
            ),
            benchmark_return: calculateReturn(
              findPriceOnOrBefore(oneYearAgo, benchmarkData),
              latestBenchmarkPrice
            ),
          },
          {
            period: "3-Year Return",
            stock_return: calculateReturn(
              findPriceOnOrBefore(threeYearsAgo, stockData),
              latestStockPrice
            ),
            benchmark_return: calculateReturn(
              findPriceOnOrBefore(threeYearsAgo, benchmarkData),
              latestBenchmarkPrice
            ),
          },
          {
            period: "5-Year Return",
            stock_return: calculateReturn(fiveYearStockPrice, latestStockPrice),
            benchmark_return: calculateReturn(
              fiveYearBenchmarkPrice,
              latestBenchmarkPrice
            ),
          },
        ];

        return performanceData;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(
          `An error occurred in fetchStockPerformance for ${ticker}:`,
          error
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch performance data for ${ticker}.`,
          cause: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  fetchCompetitors: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }): Promise<CompetitorData[]> => {
      const { ticker } = input;

      try {
        // Step 1: Get the list of competitor tickers from Finnhub.
        const peerTickers = await getCompanyPeers(ticker);

        // Edge Case: If Finnhub returns no peers, create an array with just the
        // primary ticker so the component can still display its own data.
        if (peerTickers.length === 0) {
          peerTickers.push(ticker);
        }

        // Step 2: Fetch all price snapshots from Alpaca in a single, efficient batch call.
        const snapshotsResponse = await alpacaApiV2.get("/stocks/snapshots", {
          params: {
            symbols: peerTickers.join(","), // e.g., "OPEN,OPAD,COMP"
            feed: "delayed_sip",
          },
        });
        const snapshots = snapshotsResponse.data;

        // Step 3: Fetch all company profiles from Finnhub in parallel.
        const finnhubClient = getFinnhubClient(); // Use the exported helper
        const profilePromises = peerTickers.map((peer) =>
          finnhubClient.companyProfile2(peer)
        );
        const profileResults = await Promise.all(profilePromises);

        // Step 4: Combine all the fetched data into a clean array for the frontend.
        const combinedData = peerTickers.map((peer, index) => {
          const snapshot = snapshots[peer];
          const profile = profileResults[index]?.data;

          // Safely get the price, falling back from latest trade to the daily close.
          const price = snapshot?.latestTrade?.p ?? snapshot?.dailyBar?.c ?? 0;
          const prevDayClose = snapshot?.prevDailyBar?.c ?? 0;

          // Calculate the percentage change, safely handling division by zero.
          const percentChange =
            prevDayClose !== 0
              ? ((price - prevDayClose) / prevDayClose) * 100
              : 0;

          // Construct the final object for this competitor.
          return {
            ticker: peer,
            companyName: profile?.name || "N/A",
            industry: profile?.finnhubIndustry || "N/A",
            marketCap: profile?.marketCapitalization || 0,
            price: price,
            percentChange: percentChange,
          };
        });

        return combinedData;
      } catch (error) {
        // Catch any errors from the API calls and report them.
        console.error(`Error in fetchCompetitors for ${ticker}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch competitor data for ${ticker}.`,
        });
      }
    }),

  fetchStockNews: protectedProcedure
    .input(
      z.object({
        ticker: z.string().optional(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }): Promise<AlpacaNewsArticle[]> => {
      const { ticker, limit } = input;
      try {
        const response = await alpacaApiV1.get("/news", {
          params: {
            symbols: ticker,
            sort: "desc", // Most recent first
            limit: limit, // Let's limit to 10 articles for a clean UI
            include_content: false, // We only need the summary
          },
        });

        // The API returns { "news": [...] }, so we extract the array
        return response.data.news || [];
      } catch (error) {
        console.error(`Error fetching Alpaca news for ${ticker}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch news for ${ticker}.`,
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
            params: { by: "volume", top: 10 },
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
  ),

  fetchMarketDataByTickers: protectedProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(async ({ input }): Promise<AlpacaSnapshot[]> => {
      // Use the AlpacaSnapshot type
      const { tickers } = input;
      if (tickers.length === 0) return [];

      try {
        const snapshotsResponse = await alpacaApiV2.get("/stocks/snapshots", {
          params: { symbols: tickers.join(","), feed: "delayed_sip" },
        });
        const snapshots = snapshotsResponse.data;

        // Convert the object of snapshots into an array that matches the input order
        // and filter out any symbols that the API might not have found.
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

  fetchSparklineData: protectedProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(async ({ input }): Promise<Record<string, number[]>> => {
      const { tickers } = input;
      if (tickers.length === 0) return {};

      // Helper to fetch the last 2 days of 15-minute bars for a single ticker
      const fetchBarsForTicker = async (ticker: string) => {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        const formattedStartDate = fifteenDaysAgo.toISOString().slice(0, 10);

        try {
          const response = await alpacaApiV2.get(`/stocks/${ticker}/bars`, {
            params: {
              timeframe: "1T",
              start: formattedStartDate,
              adjustment: "raw",
            },
          });
          // Return just the closing prices
          const closingPrices = (response.data.bars || []).map(
            (bar: any) => bar.c
          );
          return { ticker, prices: closingPrices };
        } catch (e) {
          console.error(`Failed to fetch sparkline bars for ${ticker}`, e);
          return { ticker, prices: [] }; // Return empty array on failure for a single ticker
        }
      };

      try {
        // Fetch all ticker histories in parallel
        const results = await Promise.all(tickers.map(fetchBarsForTicker));

        // Convert the array of results into a dictionary object { ticker: prices[] }
        const sparklineData = results.reduce((acc, result) => {
          acc[result.ticker] = result.prices;
          return acc;
        }, {} as Record<string, number[]>);

        return sparklineData;
      } catch (error) {
        console.error(`Error fetching batch sparkline data:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sparkline data.",
        });
      }
    }),

  fetchCryptoList: protectedProcedure.query(async (): Promise<CryptoData[]> => {
    try {
      // --- 1. Get Price Data from Alpaca ---
      const snapshotsResponse = await alpacaCryptoApi.get("/us/snapshots", {
        params: { symbols: cryptoSymbols.join(",") },
      });
      const snapshots = snapshotsResponse.data.snapshots;

      // --- 2. Get Sparklines from Alpaca ---
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const sparklineResponse = await alpacaCryptoApi.get("/us/bars", {
        params: {
          symbols: cryptoSymbols.join(","),
          timeframe: "5T",
          limit: 1000,
          sort: "asc",
        },
      });
      const sparklinesBySymbol = sparklineResponse.data.bars;

      // --- 4. Combine all the data ---
      return cryptoSymbols.map((symbol, index) => {
        const snapshot = snapshots[symbol];

        // Data from Alpaca
        const price = snapshot?.latestTrade?.p ?? 0;
        const prevDayClose = snapshot?.prevDailyBar?.c ?? 0;
        const change = price - prevDayClose;
        const percentChange =
          prevDayClose !== 0 ? (change / prevDayClose) * 100 : 0;
        const volume24h = snapshot?.dailyBar?.v ?? 0;

          return {
            symbol,
            price,
            change,
            percentChange,
            volume24h: snapshot?.dailyBar?.v ?? 0,
            sparklineData: (sparklinesBySymbol[symbol] || []).map((bar: any) => bar.c),
            // We use the data from Finnhub if available, otherwise 0
            marketCap: 0,
            circulatingSupply: 0,
          };
        });

      } catch (error) {
        console.error("Error fetching crypto list data:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch crypto data.' });
      }
    }),

    fetchCryptoBars: protectedProcedure
    .input(z.object({
      ticker: z.string(), // e.g., "BTC/USD"
      range: z.string(),
      interval: z.string(), // e.g., "15Min", "1Day"
    }))
    .query(async ({ input }): Promise<AlpacaBar[]> => {
      const { ticker, range, interval } = input;

      // The date logic is identical to the stock version
      const start = new Date();
      switch (range) {
        case '1d': start.setDate(start.getDate() - 1); break;
        case '5d': start.setDate(start.getDate() - 5); break;
        case '1mo': start.setMonth(start.getMonth() - 1); break;
        case '6mo': start.setMonth(start.getMonth() - 6); break;
        case 'ytd': start.setMonth(0); start.setDate(1); break;
        case '1y': start.setFullYear(start.getFullYear() - 1); break;
        case '5y': start.setFullYear(start.getFullYear() - 5); break;
        case 'max': start.setFullYear(start.getFullYear() - 10); break;
        default: start.setDate(start.getDate() - 1);
        
      }
      
      try {
        // Use the multi-symbol crypto bars endpoint
         const response = await alpacaCryptoClient.get('/bars', {
          params: {
            symbols: ticker,
            timeframe: interval, // The interval is passed directly
            start: start.toISOString(),
            limit: 10000,
            sort: 'asc',
          },
        });

        // The response structure is { bars: { "BTC/USD": [...] } }
        // We need to extract the array for the specific ticker.
        return response.data.bars[ticker] || [];

      } catch (error) {
        console.error(`Error fetching crypto bars for ${ticker}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch historical data for ${ticker}.`,
        });
      }
    }),
    

    fetchCryptoSnapshot: protectedProcedure
  .input(z.object({ ticker: z.string() }))
  .query(async ({ input }): Promise<AlpacaSnapshot> => {
    const { ticker } = input;

    const requestParams = {
      symbols: ticker,
    };

    try {
      const response = await alpacaCryptoClient.get('/snapshots', {
        params: requestParams,
      });

      // LOG 3: See the raw response from Alpaca if the call succeeds
      
      const snapshotData = response.data.snapshots[ticker];

      if (!snapshotData || !snapshotData.prevDailyBar) {
        // LOG 4: This will run if the data is missing for the ticker
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Snapshot data not found or incomplete for ${ticker}.`,
        });
      }
      
      // LOG 5: This means everything was successful
      return snapshotData;

    } catch (error) {
      // --- THIS IS THE MOST IMPORTANT LOG ---
      // It will show us the exact error that is causing the crash.

      if (isAxiosError(error)) {
        // Log the specific details from the Axios error
        console.error('[TRPC CRITICAL ERROR] Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config, // This shows the exact request that was made
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch snapshot for ${ticker}.`,
          cause: error.response?.data,
        });
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unknown error occurred while fetching snapshot.',
      });
    }
  }),


  
});
