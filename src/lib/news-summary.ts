import { DefaultApi } from "finnhub-ts";
import Alpaca from "@alpacahq/alpaca-trade-api";
import { restClient } from "@polygon.io/client-js";

export type Category = "general" | "forex" | "crypto" | "merger";
export type MarketNews = {
  id?: string;
  headline?: string;
  summary?: string;
  category?: string;
  url?: string;
  imageUrl?: string;
  related?: string;
  source?: string;
  datetime?: number | string;
};

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

const getRestClient = () => {
  const rest = restClient(
    process.env.POLYGON_API_KEY || "",
    process.env.POLYGON_URL
  );
  return rest;
};

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY_ID,
  secretKey: process.env.ALPACA_API_SECRET_KEY,
  paper: true,
});

export const getUSMarketNews = async (
  category: string
): Promise<MarketNews[]> => {
  category = category.toLowerCase();

  const finnhubClient = getFinnhubClient();
  const rest = getRestClient();

  if (
    category === "general" ||
    category === "crypto" ||
    category === "merger"
  ) {
    const marketNews = await finnhubClient.marketNews(category);
    return marketNews.data.map((item) => ({
      id: item.id?.toString(),
      headline: item.headline,
      summary: item.summary,
      category: item.category,
      url: item.url,
      imageUrl: item.image,
      related: item.related,
      source: item.source,
      datetime: item.datetime,
    }));
  } else if (category === "stock") {
    // const marketNews = await alpaca.getNews({});
    // if (!marketNews) {
    //     return [] as MarketNews[]
    // }
    // return marketNews.map((item) => ({
    //   id: item.ID?.toString(),
    //   headline: item.Headline,
    //   summary: item.Summary,
    //   category: "stock",
    //   url: item.URL,
    //   imageUrl: item.Images?.[0]?.URL ?? null,
    //   related: item.Symbols.join(" "), // tickers is arr, convert to string separate by space
    //   source: item.Source,
    //   datetime: item.UpdatedAt,
    // }));

    const marketNews = await rest.listNews(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      20
    );
    if (!marketNews.results) {
      return [] as MarketNews[];
    }
    return marketNews.results.map((item) => ({
      id: item.id?.toString(),
      headline: item.title,
      summary: item.description,
      category: "stock",
      url: item.article_url,
      imageUrl: item.image_url,
      related: item.tickers.join(" "), // tickers is arr, convert to string separate by space
      source: item.publisher.name,
      datetime: undefined,
    }));
  } else {
    return [] as MarketNews[];
  }
};

export const getUSCompanyNews = async (ticker: string) => {
  ticker = ticker.toUpperCase();
  const finnhubClient = getFinnhubClient();

  const companyNews = await finnhubClient.companyNews(
    ticker,
    "2025-10-03",
    "2025-10-05"
  );
  if (!companyNews.data) {
    return [] as MarketNews[];
  }

  return companyNews.data.map((item) => ({
    id: item.id?.toString(),
    headline: item.headline,
    summary: item.summary,
    category: item.category,
    url: item.url,
    imageUrl: item.image,
    related: item.related,
    source: item.source,
    datetime: item.datetime,
  }));
};
