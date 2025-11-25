import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init"; 
import { prisma } from "@/lib/db"; 
import { getMarketDataForTickers } from "@/lib/alpaca"; 
import { TRPCError } from "@trpc/server";

// Schema for Adding/Editing Holdings
const holdingInputSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().min(0),
  avgCost: z.number().min(0),
});

export const portfolioRouter = createTRPCRouter({
  // --- HOLDINGS PROCEDURES ---

  getHoldings: baseProcedure.query(async ({ ctx }) => {
    // FIX: Access userId from ctx.auth
    const { userId } = ctx.auth; 
    
    if (!userId) {
      // Return empty if not logged in, or throw UNAUTHORIZED
      return []; 
    }

    // 1. Get Holdings from DB
    const dbHoldings = await prisma.holding.findMany({
      where: { userId },
      orderBy: { symbol: "asc" },
    });

    if (dbHoldings.length === 0) return [];

    // 2. Get Real-time Data from Alpaca
    const symbols = dbHoldings.map((h) => h.symbol);
    const marketData = await getMarketDataForTickers(symbols);

    // 3. Merge Data
    return dbHoldings.map((holding) => {
      const data = marketData.find((m) => m.symbol === holding.symbol);
      
      // Fallback values if API fails for specific ticker
      const currentPrice = data?.latestTrade?.p ?? data?.dailyBar?.c ?? 0;
      const prevClose = data?.prevDailyBar?.c ?? 0;
      
      return {
        ...holding,
        marketData: {
          price: currentPrice,
          open: data?.dailyBar?.o ?? 0,
          high: data?.dailyBar?.h ?? 0,
          low: data?.dailyBar?.l ?? 0,
          close: data?.dailyBar?.c ?? 0,
          volume: data?.dailyBar?.v ?? 0,
          prevClose: prevClose,
          lastUpdated: data?.latestTrade?.t || new Date().toISOString(),
        },
      };
    });
  }),

  addHolding: baseProcedure
    .input(holdingInputSchema)
    .mutation(async ({ ctx, input }) => {
      // FIX: Access userId from ctx.auth
      const { userId } = ctx.auth;
      
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
      }
      
      // Upsert: Update if exists, Create if not
      return await prisma.holding.upsert({
        where: {
          userId_symbol: { userId, symbol: input.symbol },
        },
        update: {
          quantity: input.quantity,
          avgCost: input.avgCost,
        },
        create: {
          userId,
          symbol: input.symbol,
          quantity: input.quantity,
          avgCost: input.avgCost,
        },
      });
    }),

  deleteHolding: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Optional: Check if the user owns this holding before deleting
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await prisma.holding.deleteMany({
        where: { 
          id: input.id,
          userId: userId // Ensure users can only delete their own holdings
        },
      });
    }),

  // --- WATCHLIST PROCEDURES ---

  getWatchlist: baseProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    
    if (!userId) return [];

    const watchlistItems = await prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { symbol: "asc" },
    });

    if (watchlistItems.length === 0) return [];

    const symbols = watchlistItems.map((w) => w.symbol);
    const marketData = await getMarketDataForTickers(symbols);

    return watchlistItems.map((item) => {
      const data = marketData.find((m) => m.symbol === item.symbol);
      const currentPrice = data?.latestTrade?.p ?? data?.dailyBar?.c ?? 0;
      
      return {
        ...item,
        marketData: {
          price: currentPrice,
          open: data?.dailyBar?.o ?? 0,
          high: data?.dailyBar?.h ?? 0,
          low: data?.dailyBar?.l ?? 0,
          close: data?.dailyBar?.c ?? 0,
          volume: data?.dailyBar?.v ?? 0,
          prevClose: data?.prevDailyBar?.c ?? 0,
          lastUpdated: data?.latestTrade?.t || new Date().toISOString(),
        },
      };
    });
  }),

  addToWatchlist: baseProcedure
    .input(z.object({ symbol: z.string().min(1).toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      // Check if already exists to avoid errors
      const exists = await prisma.watchlistItem.findUnique({
        where: { userId_symbol: { userId, symbol: input.symbol } },
      });

      if (exists) throw new TRPCError({ code: "CONFLICT", message: "Already in watchlist" });

      return await prisma.watchlistItem.create({
        data: { userId, symbol: input.symbol },
      });
    }),

  removeFromWatchlist: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await prisma.watchlistItem.deleteMany({
        where: { 
          id: input.id,
          userId // Ensure ownership
        },
      });
    }),
});