import axios from 'axios';
import Alpaca from "@alpacahq/alpaca-trade-api"; 
export interface PerformanceData {
  period: string; // e.g., "YTD", "1Y", "3Y", "5Y"
  stock_return: number;
  benchmark_return: number;
}
import { getMarketNews, getCompanyNameFromFinnhub, 
  searchSymbols, getCompanyPeers, getFinnhubClient} from "@/lib/finnhub";
import {
  AlpacaBar,
  AlpacaSnapshot,
  HistoricalBar,
  CompetitorData,
  AlpacaNewsArticle,
  ScreenerStock,
  MarketMovers,
  CryptoData,
} from "@/modules/market_data/server/procedures";


const cryptoSymbols = ["BTC/USD", "ETH/USD", "USDT/USD", "XRP/USD", "SOL/USD", "USDC/USD", "DOGE/USD"];

/**
 * Generates a start date based on a string range.
 * @param range - e.g., "1d", "1mo", "5y"
 * @returns A Date object set to the calculated start date.
 */
const getStartDateFromRange = (range: string): Date => {
  const start = new Date();
  switch (range) {
    case "1d": start.setDate(start.getDate() - 1); break;
    case "5d": start.setDate(start.getDate() - 5); break;
    case "1mo": start.setMonth(start.getMonth() - 1); break;
    case "6mo": start.setMonth(start.getMonth() - 6); break;
    case "ytd": start.setMonth(0); start.setDate(1); break;
    case "1y": start.setFullYear(start.getFullYear() - 1); break;
    case "5y": start.setFullYear(start.getFullYear() - 5); break;
    case "max": start.setFullYear(start.getFullYear() - 10); break;
    default: start.setDate(start.getDate() - 1);
  }
  return start;
};




// This is our single, reusable client for making direct API calls to Alpaca.
// It pulls the API keys directly from your environment variables.
export const alpacaApiV2 = axios.create({
  baseURL: 'https://data.alpaca.markets/v2',
  headers: {
    'accept': 'application/json',
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY,
  }
});

export const alpacaApiV1 = axios.create({
  baseURL: 'https://data.alpaca.markets/v1beta1', // Note the different version
  headers: {
    'accept': 'application/json',
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY,
  }
});


export const alpacaCryptoApi = axios.create({
  baseURL: 'https://data.alpaca.markets/v1beta3/crypto', // Note the different version
  headers: {
    'accept': 'application/json',
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY,
  }
});

export const alpacaCryptoClient = axios.create({
  // Include the '/us' region directly in the base URL
  baseURL: 'https://data.alpaca.markets/v1beta3/crypto/us', 
  headers: {
    'accept': 'application/json',
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY,
  }
});

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY_ID,
  secretKey: process.env.ALPACA_API_SECRET_KEY,
  paper: true,
})

export const getAlpacaStockNews =  () => {
  const news = alpaca.getNews({});
  return news;  
}

// --- Historical Data Services ---
export const getStockBars = async (ticker: string, range: string, interval: string): Promise<AlpacaBar[]> => {
  const start = getStartDateFromRange(range);
  try {
    const response = await alpacaApiV2.get(`/stocks/${ticker}/bars`, {
      params: { timeframe: interval, start: start.toISOString(), limit: 10000, adjustment: "raw", feed: "iex", sort: "asc" },
    });
    return response.data.bars || [];
  } catch (error) {
    console.error(`Alpaca API error in getStockBars for ${ticker}:`, error);
    throw new Error(`Failed to fetch historical data for ${ticker}.`);
  }
};

export const getCryptoBars = async (ticker: string, range: string, interval: string): Promise<AlpacaBar[]> => {
  const start = getStartDateFromRange(range);
  try {
    const response = await alpacaCryptoClient.get('/bars', {
      params: { symbols: ticker, timeframe: interval, start: start.toISOString(), limit: 10000, sort: 'asc' },
    });
    return response.data.bars[ticker] || [];
  } catch (error) {
    console.error(`Alpaca API error in getCryptoBars for ${ticker}:`, error);
    throw new Error(`Failed to fetch historical crypto data for ${ticker}.`);
  }
};

const fetchLongTermBars = async (symbol: string): Promise<HistoricalBar[]> => {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  try {
    const response = await alpacaApiV2.get(`/stocks/${symbol}/bars`, {
      params: { timeframe: "1Day", start: fiveYearsAgo.toISOString().slice(0, 10), limit: 10000, adjustment: "raw" },
    });
    return (response.data.bars || []).map((bar: any) => ({ t: bar.t, c: bar.c }));
  } catch (error) {
    console.error(`Alpaca API error inside fetchLongTermBars for ${symbol}:`, error);
    throw new Error(`Failed to fetch long-term data for ${symbol}.`);
  }
};


// --- Snapshot Services ---

export const getStockSnapshot = async (ticker: string): Promise<AlpacaSnapshot> => {
  try {
    const response = await alpacaApiV2.get("/stocks/snapshots", { params: { symbols: ticker, feed: "iex" } });
    const snapshotData = response.data[ticker];
    if (!snapshotData || !snapshotData.prevDailyBar) {
      throw new Error(`Snapshot data not found or incomplete for ${ticker}.`);
    }
    return snapshotData;
  } catch (error) {
    console.error(`Alpaca API error in getStockSnapshot for ${ticker}:`, error);
    throw new Error(`Failed to fetch snapshot for ${ticker}.`);
  }
};

export const getCryptoSnapshot = async (ticker: string): Promise<AlpacaSnapshot> => {
  try {
    const response = await alpacaCryptoClient.get('/snapshots', { params: { symbols: ticker } });
    const snapshotData = response.data.snapshots[ticker];
    if (!snapshotData || !snapshotData.prevDailyBar) {
      throw new Error(`Crypto snapshot data not found for ${ticker}.`);
    }
    return snapshotData;
  } catch (error) {
    console.error(`Alpaca API error in getCryptoSnapshot for ${ticker}:`, error);
    throw new Error(`Failed to fetch crypto snapshot for ${ticker}.`);
  }
};

export const getMarketDataForTickers = async (tickers: string[]): Promise<AlpacaSnapshot[]> => {
    if (tickers.length === 0) return [];
    try {
        const response = await alpacaApiV2.get("/stocks/snapshots", {
            params: { symbols: tickers.join(","), feed: "iex" },
        });
        const snapshotsBySymbol = response.data;
        return tickers
            .map(ticker => {
                const snapshot = snapshotsBySymbol[ticker];
                if (snapshot) {
                    // This is the key change: we add the symbol to the object
                    return { ...snapshot, symbol: ticker };
                }
                return null;
            })
            .filter(Boolean) as AlpacaSnapshot[];

    } catch (error) {
        console.error(`Error fetching batch snapshots:`, error);
        throw new Error("Failed to fetch market data from Alpaca.");
    }
};


// --- Finnhub & Symbol Services ---

export const findSymbols = async (query: string) => {
  if (query.length < 1) return { result: [] };
  
  const searchResults = await searchSymbols(query);
  if (!searchResults?.result?.length) return { result: [] };
  
  const upperCaseQuery = query.toUpperCase();
  
  // First, check for exact symbol match
  const exactMatch = searchResults.result.find(stock => stock.symbol === upperCaseQuery);
  if (exactMatch) return { result: [exactMatch] };
  
  // Then filter for relevant results that match the query
  const filtered = searchResults.result.filter(stock => 
    stock.symbol && 
    !stock.symbol.includes(".") && 
    stock.type === "Common Stock" &&
    // Add this: check if symbol or description contains the query
    (stock.symbol.toUpperCase().includes(upperCaseQuery) || 
     stock.description?.toUpperCase().includes(upperCaseQuery))
  );
  
  return { result: filtered.slice(0, 5) };
};


// --- Complex/Combined Data Services ---

export const getStockPerformance = async (ticker: string) => {
    const benchmarkTicker = "SPY";
    const calculateReturn = (start?: number, end?: number): number => (start && end ? ((end - start) / start) * 100 : 0);
    const findPrice = (target: Date, data: HistoricalBar[]): number | undefined => {
        for (let i = data.length - 1; i >= 0; i--) {
            if (new Date(data[i].t) <= target) return data[i].c;
        }
        return undefined;
    };

    const [stockData, benchmarkData] = await Promise.all([fetchLongTermBars(ticker), fetchLongTermBars(benchmarkTicker)]);
    if (stockData.length < 2 || benchmarkData.length < 2) throw new Error("Insufficient historical data.");

    const latestStock = stockData[stockData.length - 1].c;
    const latestBench = benchmarkData[benchmarkData.length - 1].c;
    const today = new Date();
    
    const periods = {
        "YTD Return": new Date(Date.UTC(today.getUTCFullYear() - 1, 11, 31)),
        "1-Year Return": new Date(new Date().setFullYear(today.getFullYear() - 1)),
        "3-Year Return": new Date(new Date().setFullYear(today.getFullYear() - 3)),
    };

    const performance = Object.entries(periods).map(([period, startDate]) => ({
        period,
        stock_return: calculateReturn(findPrice(startDate, stockData), latestStock),
        benchmark_return: calculateReturn(findPrice(startDate, benchmarkData), latestBench),
    }));

    performance.push({
        period: "5-Year Return",
        stock_return: calculateReturn(stockData[0]?.c, latestStock),
        benchmark_return: calculateReturn(benchmarkData[0]?.c, latestBench),
    });

    return performance;
};

export const getCompetitorsData = async (ticker: string): Promise<CompetitorData[]> => {
    const peerTickers = await getCompanyPeers(ticker);
    if (peerTickers.length === 0) peerTickers.push(ticker);

    const [snapshotsResponse, profileResults] = await Promise.all([
        alpacaApiV2.get("/stocks/snapshots", { params: { symbols: peerTickers.join(","), feed: "iex" } }),
        Promise.all(peerTickers.map(peer => getFinnhubClient().companyProfile2(peer)))
    ]);
    
    const snapshots = snapshotsResponse.data;
    return peerTickers.map((peer, index) => {
        const snap = snapshots[peer];
        const profile = profileResults[index]?.data;
        const price = snap?.latestTrade?.p ?? snap?.dailyBar?.c ?? 0;
        const prevClose = snap?.prevDailyBar?.c ?? 0;
        const pctChange = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        return {
            ticker: peer,
            companyName: profile?.name || "N/A",
            industry: profile?.finnhubIndustry || "N/A",
            marketCap: profile?.marketCapitalization || 0,
            price,
            percentChange: pctChange,
        };
    });
};

export const getSparklineData = async (tickers: string[]): Promise<Record<string, number[]>> => {
    if (tickers.length === 0) return {};
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const startDate = fifteenDaysAgo.toISOString().slice(0, 10);

    // --- START OF THE FIX ---

    // 1. Create an array of promises. Each promise fetches bar data for a single ticker.
    const barDataPromises = tickers.map(ticker =>
        alpacaApiV2.get(`/stocks/bars`, {
            params: {
                symbols: ticker, // Key change: Request one ticker at a time
                timeframe: "15Min",
                start: startDate,
                adjustment: "raw",
                limit: 1000,
                feed: "iex" // It's good practice to be explicit with the data feed
            },
        }).catch(error => {
            // Add error handling to prevent one failed ticker from breaking the whole process
            console.error(`Failed to fetch sparkline for ${ticker}:`, error);
            return null; // Return null for failed requests
        })
    );

    // 2. Execute all the fetch promises concurrently
    const responses = await Promise.all(barDataPromises);

    // 3. Process the results and build the final data object
    const sparklineData: Record<string, number[]> = {};
    responses.forEach(response => {
        // Skip any requests that failed
        if (!response) return;

        const barsBySymbol = response.data.bars;
        // The symbol will be the key in the 'bars' object from the API response
        const ticker = Object.keys(barsBySymbol)[0];

        if (ticker && barsBySymbol[ticker]) {
            sparklineData[ticker] = barsBySymbol[ticker].map((bar: any) => bar.c);
        }
    });
    
    // --- END OF THE FIX ---

    return sparklineData;
};


// --- Market & News Services ---

export const getStockNews = async (ticker?: string, limit: number = 10): Promise<AlpacaNewsArticle[]> => {
    try {
        const response = await alpacaApiV1.get("/news", {
            params: { symbols: ticker, sort: "desc", limit: limit, include_content: false },
        });
        return response.data.news || [];
    } catch (error) {
        console.error(`Alpaca API error in getStockNews for ${ticker}:`, error);
        throw new Error(`Failed to fetch news for ${ticker}.`);
    }
};

export const getMarketScreener = async (): Promise<ScreenerStock[]> => {
    const activesResponse = await alpacaApiV1.get("/screener/stocks/most-actives", { params: { by: "volume", top: 10 } });
    const activeSymbols = activesResponse.data.most_actives?.map((s: any) => s.symbol) || [];
    if (activeSymbols.length === 0) return [];
    
    // This call now returns an array of snapshots, each with a .symbol property
    const snapshots = await getMarketDataForTickers(activeSymbols);

    return activeSymbols.map((symbol: string) => {
        // This .find() will now succeed!
        const snapshot = snapshots.find(s => s.symbol === symbol); 
        
        const price = snapshot?.latestTrade?.p ?? snapshot?.dailyBar?.c ?? 0;
        const prevClose = snapshot?.prevDailyBar?.c ?? 0;
        const change = price - prevClose;
        const percentChange = prevClose ? (change / prevClose) * 100 : 0;

        return { symbol, price, change, percentChange };
    });
};


export const getMarketMovers = async (): Promise<MarketMovers> => {
    const response = await alpacaApiV1.get("/screener/stocks/movers", { params: { top: 10 } });
    const transform = (m: any): ScreenerStock => ({ symbol: m.symbol, price: m.price, change: m.change, percentChange: m.percent_change });
    return {
        gainers: response.data.gainers?.map(transform) || [],
        losers: response.data.losers?.map(transform) || [],
    };
};

export const getCryptoListData = async (): Promise<CryptoData[]> => {
    // Fetch snapshots for all cryptos in one go (this part is efficient and correct)
    const snapshotsResponse = await alpacaCryptoApi.get("/us/snapshots", { 
        params: { symbols: cryptoSymbols.join(",") } 
    });
    const snapshots = snapshotsResponse.data.snapshots;

    // --- START OF THE FIX ---

    // Create an array of promises, where each promise fetches the bars for one crypto symbol
    const sparklinePromises = cryptoSymbols.map(symbol =>
        alpacaCryptoApi.get("/us/bars", {
            params: {
                symbols: symbol, // Fetch one symbol at a time
                timeframe: "15Min",
                limit: 48,
                sort: "asc"
            }
        })
    );

    // Wait for all the individual bar data requests to complete
    const sparklineResults = await Promise.all(sparklinePromises);

    // Process the results to map them back to their symbols
    const sparklinesBySymbol: Record<string, any[]> = {};
    sparklineResults.forEach(response => {
        const symbolData = response.data.bars;
        const symbolName = Object.keys(symbolData)[0]; // The symbol is the key in the response
        if (symbolName) {
            sparklinesBySymbol[symbolName] = symbolData[symbolName];
        }
    });

    // --- END OF THE FIX ---

    // Map the snapshot and sparkline data together (this logic remains the same)
    return cryptoSymbols.map(symbol => {
        const snap = snapshots[symbol];
        const price = snap?.latestTrade?.p ?? 0;
        const prevClose = snap?.prevDailyBar?.c ?? 0;
        const change = price - prevClose;
        const percentChange = prevClose ? (change / prevClose) * 100 : 0;

        return {
            symbol,
            price,
            change,
            percentChange,
            volume24h: snap?.dailyBar?.v ?? 0,
            // Use the correctly fetched sparkline data
            sparklineData: (sparklinesBySymbol[symbol] || []).map((bar: any) => bar.c),
        };
    });
};

export const getCompanyNames = async (symbols: string[]) => {
  // Remove duplicates to save API calls
  const uniqueSymbols = [...new Set(symbols)];
  
  // Fetch asset details in parallel
  const assets = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        // We use the 'alpaca' instance you defined on line 59
        const asset = await alpaca.getAsset(symbol);
        return { symbol, name: asset.name };
      } catch (error) {
        console.warn(`Could not fetch name for ${symbol}`);
        return { symbol, name: symbol }; // Fallback to symbol if name fails
      }
    })
  );

  return assets;
};