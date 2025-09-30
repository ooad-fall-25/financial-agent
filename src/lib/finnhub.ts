import { DefaultApi } from "finnhub-ts";

export type Category = "general" | "forex" | "crypto" | "merger";

export const getFinnhubClient = () => {
  const finnhubClient = new DefaultApi({
    apiKey: process.env.FINNHUB_API_KEY,
    isJsonMime: (input) => {
      try {
        JSON.parse(input);
        return true;
      } catch (error) {}
      return false;
    },
  });
  return finnhubClient; 
};

export const getMarketNews = async (category: string, minId?: number) => {
  const finnhubClient = getFinnhubClient();
  const marketNews = await finnhubClient.marketNews(category, minId);
  return marketNews;
};

export const getFinnhubCompanyNews = async (input: string, from: string, to: string) => {
  const finnhubClient = getFinnhubClient();
  const CompanyNews = await finnhubClient.companyNews(input, from, to);
  return CompanyNews;
};

export const getCompanyNameFromFinnhub = async (ticker: string) => {
  const finnhubClient = getFinnhubClient();
  try {
    // CORRECTION: Pass the ticker string directly
    const companyProfile = await finnhubClient.companyProfile2(ticker);

    // The rest of the logic is the same
    if (companyProfile.data && companyProfile.data.name) {
      return { companyName: companyProfile.data.name };
    }
    return null; 
  } catch (error) {
    console.error(`Finnhub API error fetching company name for ${ticker}:`, error);
    return null;
  }
};

export const searchSymbols = async (query: string) => {
  if (!query) return null;
  const finnhubClient = getFinnhubClient();
  try {
    const searchResults = await finnhubClient.symbolSearch(query);
    return searchResults.data;
  } catch (error) {
    console.error(`Finnhub API error searching for "${query}":`, error);
    return null;
  }
};

export const getCompanyPeers = async (ticker: string): Promise<string[]> => {
  const finnhubClient = getFinnhubClient();
  try {
    const peers = await finnhubClient.companyPeers(ticker);
    // The first element is the company itself, so we can return the whole list
    // Let's take the first 5 peers for a clean UI
    return peers.data.slice(0, 10); 
  } catch (error) {
    console.error(`Finnhub API error fetching peers for ${ticker}:`, error);
    return []; // Return empty array on failure
  }
};
