import { DefaultApi } from "finnhub-ts";

export type Category = "general" | "forex" | "crypto" | "merger";

const getFinnhubClient = () => {
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
