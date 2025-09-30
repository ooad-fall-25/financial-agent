import axios from 'axios';

export interface PerformanceData {
  period: string; // e.g., "YTD", "1Y", "3Y", "5Y"
  stock_return: number;
  benchmark_return: number;
}

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';


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
    'User-Agent': BROWSER_USER_AGENT,
  }
});
