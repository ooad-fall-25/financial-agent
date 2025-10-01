import axios from 'axios';
import Alpaca from "@alpacahq/alpaca-trade-api"; 
export interface PerformanceData {
  period: string; // e.g., "YTD", "1Y", "3Y", "5Y"
  stock_return: number;
  benchmark_return: number;
}



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
