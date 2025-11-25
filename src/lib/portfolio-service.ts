import { prisma } from "@/lib/db";
import { getMarketDataForTickers } from "@/lib/alpaca";

// --- Types ---
export interface HoldingInput {
  symbol: string;
  quantity: number;
  avgCost: number;
}

// --- Logic ---

export const getUserHoldings = async (userId: string) => {
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
};

export const upsertHolding = async (userId: string, input: HoldingInput) => {
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
};

export const deleteUserHolding = async (userId: string, holdingId: string) => {
  return await prisma.holding.deleteMany({
    where: {
      id: holdingId,
      userId: userId, // Ensure users can only delete their own holdings
    },
  });
};

export const getUserWatchlist = async (userId: string) => {
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
};

export const addToUserWatchlist = async (userId: string, symbol: string) => {
  // Check if already exists
  const exists = await prisma.watchlistItem.findUnique({
    where: { userId_symbol: { userId, symbol } },
  });

  if (exists) {
    throw new Error("Already in watchlist"); // Throw generic error, handle in router
  }

  return await prisma.watchlistItem.create({
    data: { userId, symbol },
  });
};

export const removeFromUserWatchlist = async (userId: string, itemId: string) => {
  return await prisma.watchlistItem.deleteMany({
    where: {
      id: itemId,
      userId, // Ensure ownership
    },
  });
};