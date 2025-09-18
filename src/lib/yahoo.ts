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

  export const fetchStockData = async (ticker: string, range: string, interval:string): Promise<StockDataPoint[]> => {
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

