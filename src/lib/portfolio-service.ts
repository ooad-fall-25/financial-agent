import { prisma } from "@/lib/db";
import { getMarketDataForTickers, getCompanyNames } from "@/lib/alpaca";

// --- Types ---
export interface HoldingInput {
  symbol: string;
  quantity: number;
  avgCost: number;
}

// --- Logic ---

// Helper for validating tickers
const validateTicker = async (symbol: string) => {
  let data;
  try {
    const result = await getMarketDataForTickers([symbol]);
    data = result ? result[0] : null;
  } catch (error) {
    data = null;
  }

  const price = data?.latestTrade?.p ?? data?.dailyBar?.c ?? 0;
  
  if (!data || price === 0) {
    throw new Error(`Invalid Ticker: '${symbol}' not found or delisted.`);
  }
  return true;
};

// temporary fix to sanitize name cuz idk why it keeps showing up as ticker symbol when its not available
const sanitizeName = (rawName: string | undefined, symbol: string): string | null => {
  if (!rawName) return null;
  
  const cleanName = rawName.trim();
  const cleanSymbol = symbol.trim();

  if (cleanName.toUpperCase() === cleanSymbol.toUpperCase()) {
    return null;
  }

  return cleanName;
};

export const getUserHoldings = async (userId: string) => {
  // 1. Get Holdings from DB
  const dbHoldings = await prisma.holding.findMany({
    where: { userId },
    orderBy: { symbol: "asc" },
  });

  if (dbHoldings.length === 0) return [];

  // 2. Get Real-time Data AND Company Names (Parallel)
  const symbols = dbHoldings.map((h) => h.symbol);
  
  const [marketData, assetDetails] = await Promise.all([
    getMarketDataForTickers(symbols),
    getCompanyNames(symbols)
  ]);

  // 3. Merge Data
  return dbHoldings.map((holding) => {
    const data = marketData.find((m) => m.symbol === holding.symbol);
    const asset = assetDetails.find((a) => a.symbol === holding.symbol);

    const currentPrice = data?.latestTrade?.p ?? data?.dailyBar?.c ?? 0;
    const prevClose = data?.prevDailyBar?.c ?? 0;

    return {
      ...holding,
      // USE SANITIZED NAME
      name: sanitizeName(asset?.name, holding.symbol), 
      marketData: {
        price: currentPrice,
        open: data?.dailyBar?.o ?? null,
        high: data?.dailyBar?.h ?? null,
        low: data?.dailyBar?.l ?? null,
        close: data?.dailyBar?.c ?? null,
        volume: data?.dailyBar?.v ?? null,
        prevClose: prevClose,
        lastUpdated: data?.latestTrade?.t || null,
      },
    };
  });
};

export const getUserWatchlist = async (userId: string) => {
  const watchlistItems = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { symbol: "asc" },
  });

  if (watchlistItems.length === 0) return [];

  const symbols = watchlistItems.map((w) => w.symbol);

  const [marketData, assetDetails] = await Promise.all([
    getMarketDataForTickers(symbols),
    getCompanyNames(symbols)
  ]);

  return watchlistItems.map((item) => {
    const data = marketData.find((m) => m.symbol === item.symbol);
    const asset = assetDetails.find((a) => a.symbol === item.symbol);
    
    const currentPrice = data?.latestTrade?.p ?? data?.dailyBar?.c ?? 0;

    return {
      ...item,
      // USE SANITIZED NAME
      name: sanitizeName(asset?.name, item.symbol),
      marketData: {
        price: currentPrice,
        open: data?.dailyBar?.o ?? null,
        high: data?.dailyBar?.h ?? null,
        low: data?.dailyBar?.l ?? null,
        close: data?.dailyBar?.c ?? null,
        volume: data?.dailyBar?.v ?? null,
        prevClose: data?.prevDailyBar?.c ?? null,
        lastUpdated: data?.latestTrade?.t || null,
      },
    };
  });
};

export const upsertHolding = async (userId: string, input: HoldingInput) => {
  await validateTicker(input.symbol);

  return await prisma.holding.upsert({
    where: { userId_symbol: { userId, symbol: input.symbol } },
    update: { quantity: input.quantity, avgCost: input.avgCost },
    create: { userId, symbol: input.symbol, quantity: input.quantity, avgCost: input.avgCost },
  });
};

export const deleteUserHolding = async (userId: string, holdingId: string) => {
  return await prisma.holding.deleteMany({ where: { id: holdingId, userId } });
};

export const addToUserWatchlist = async (userId: string, symbol: string) => {
  await validateTicker(symbol);

  const exists = await prisma.watchlistItem.findUnique({
    where: { userId_symbol: { userId, symbol } },
  });
  if (exists) throw new Error("Already in watchlist");

  return await prisma.watchlistItem.create({
    data: { userId, symbol },
  });
};

export const removeFromUserWatchlist = async (userId: string, itemId: string) => {
  return await prisma.watchlistItem.deleteMany({ where: { id: itemId, userId } });
};