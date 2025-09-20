  import axios from 'axios';

  // The interface can remain the same, as our Python API now returns this structure
  export interface StockDataPoint {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    timestamp: number;
    daily_change: number;
    previous_close: number;
    percentage_change: number;
  }

export interface PerformanceData {
  period: string;
  stock_return: number;
  benchmark_return: number;
}
export interface CompetitorsData {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
  industry: string;
}

export interface NewsData {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  time_ago: number;
  thumbnail_url: string;
}

export interface SymbolSearchResult {
  ticker: string;
  companyName: string;
  assetType: string;
  exchange: string;
}

export interface MarketScreenerData {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume3Month: number;
  marketCap: number;
  peRatio: number;
  fiftyTwoWeekChangePercent: number;
}


export interface TrendingTickerData {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
}

export interface MarketSummaryData {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: { price: number }[];
}


export interface CryptoData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume24hr: number;
  volumeAllCurrencies24hr: number;
  circulatingSupply: number;
  sparkline?: { price: number }[];
}

  export const fetchStockData = async (ticker: string, range?: string, interval?:string): Promise<StockDataPoint[]> => {
    // The URL now points to YOUR Python API server
    const apiUrl = `http://127.0.0.1:8000/stock/${ticker}`;

    console.log(`Fetching data for ${ticker} from Python API...`);

    try {
      // The request is much simpler now. No headers needed here.
      const response = await axios.get<StockDataPoint[]>(apiUrl, {
        params: {
          time_range: range,
          interval: interval
        }
      });
      
      // The data is already formatted by Python, so we can just return it!
      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
          // Log the error from the Python API
          console.error(`Error fetching data from Python API for ${ticker}:`, error.response?.data || error.message);
      } else {
          console.error("An unexpected error occurred:", error);
      }
      // Return an empty array on error
      return [];
    }
  };


    export const fetchCompanyName = async (ticker: string): Promise<string | null> => {
    // The URL now points to YOUR Python API server
    const apiUrl = `http://127.0.0.1:8000/company_name/${ticker}`;

    console.log(`Fetching data for ${ticker} from Python API...`);

    try {
      // The request is much simpler now. No headers needed here.
      const response = await axios.get<string>(apiUrl)
      
      // The data is already formatted by Python, so we can just return it!
      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
          // Log the error from the Python API
          console.error(`Error fetching data from Python API for ${ticker}:`, error.response?.data || error.message);
      } else {
          console.error("An unexpected error occurred:", error);
      }
      // Return an empty array on error
      return null;
    }
  };

  export const fetchStockPerformance = async (ticker: string): Promise<PerformanceData[] | null> => {
  const apiUrl = `http://127.0.0.1:8000/stock-performance/${ticker}`;

  try {
    const response = await axios.get<PerformanceData[]>(apiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance data from Python API for ${ticker}:`, error);
    return null;
  }

  
};


  export const fetchCompCompetitors = async (ticker: string): Promise<CompetitorsData[] | null> => {
  const apiUrl = `http://127.0.0.1:8000/stock-competitors/${ticker}`;

  try {
    const response = await axios.get<CompetitorsData[]>(apiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance data from Python API for ${ticker}:`, error);
    return null;
  }
  
  
};


export const fetchCompNews = async (ticker: string): Promise<NewsData[] | null> => {
  const apiUrl = `http://127.0.0.1:8000/stock-news/${ticker}`;

  try {
    const response = await axios.get<NewsData[]>(apiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance data from Python API for ${ticker}:`, error);
    return null;
  }
  
  
};

export const fetchSymbolSearch = async (query: string): Promise<SymbolSearchResult[] | null> => {
  if (!query) return []; // Don't make a request if the query is empty
  const apiUrl = `http://127.0.0.1:8000/search-symbols/${query}`;

  try {
    const response = await axios.get<SymbolSearchResult[]>(apiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching symbol search from Python API for query "${query}":`, error);
    return null;
  }
};


export const fetchMarketScreener = async (query: string): Promise<MarketScreenerData[] | null> => {
  if (!query) return []; // Don't make a request if the query is empty
  const apiUrl = `http://127.0.0.1:8000/market-discovery/${query}`;

  try {
    const response = await axios.get<MarketScreenerData[]>(apiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching symbol search from Python API for query "${query}":`, error);
    return null;
  }
};



export const fetchTrendingTickers = async (count: number = 6): Promise<TrendingTickerData[] | null> => {
  // The API endpoint is different and doesn't need a query string
  const apiUrl = `http://127.0.0.1:8000/market-trending?count=${count}`;

  try {
    const response = await axios.get<TrendingTickerData[]>(apiUrl);
    return response.data;
  } catch (error) {
    // Updated the error message for clarity
    console.error(`Error fetching trending tickers from Python API:`, error);
    return null;
  }
};

export const fetchMarketDataByTickers = async (tickers: string[]): Promise<MarketSummaryData[] | null> => {
  if (!tickers || tickers.length === 0) {
    return [];
  }
  const apiUrl = `http://127.0.0.1:8000/market-data/batch`;

  try {
    // We use axios.post to send the list of tickers in the request body
    const response = await axios.post<MarketSummaryData[]>(apiUrl, {
      tickers: tickers // The body matches the Pydantic model in Python
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching batch market data from Python API:`, error);
    return null;
  }
};

export const fetchCryptoScreener = async (screener: string): Promise<CryptoData[] | null> => {
  if (!screener) return [];
  const apiUrl = `http://127.0.0.1:8000/crypto-screener/${screener}`;

  try {
    const response = await axios.get<CryptoData[]>(apiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crypto screener from Python API for "${screener}":`, error);
    return null;
  }
};







