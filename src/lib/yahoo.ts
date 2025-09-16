import axios from 'axios';

// The interface can remain the same, as our Python API now returns this structure
export interface StockDataPoint {
  date: string;
  open: number;
  close: number;
  volume: number;
  timestamp: number;
}

export const fetchStockData = async (ticker: string): Promise<StockDataPoint[]> => {
  // The URL now points to YOUR Python API server
  const apiUrl = `http://127.0.0.1:8000/stock/${ticker}`;

  console.log(`Fetching data for ${ticker} from Python API...`);

  try {
    // The request is much simpler now. No headers needed here.
    const response = await axios.get<StockDataPoint[]>(apiUrl);
    
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