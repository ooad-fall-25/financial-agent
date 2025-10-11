import axios from "axios";
import { DefaultApi } from "finnhub-ts";
import MarketAux from "marketaux-api";
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

interface TianNewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  picUrl: string;
  url: string;
  ctime: string;
}

export interface MediastackNewsItem {
  author: string | null;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string | null;
  category: string;
  language: string;
  country: string;
  published_at: string;
}

export interface MediastackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: MediastackNewsItem[];
}

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

const apiKey = process.env.MARKETAUX_API_KEY || "";
const marketauxClient = new MarketAux(apiKey);

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
      datetime: item.datetime
        ? new Date(item.datetime * 1000).toISOString()
        : undefined, // time form finnhub is in unix format
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
      datetime: new Date(item.published_utc).toISOString(),
    }));
  } else {
    return [] as MarketNews[];
  }
};

export const getUSCompanyNews = async (ticker: string) => {
  ticker = ticker.toUpperCase();
  const finnhubClient = getFinnhubClient();

  const fmt = (d: Date): string =>
    d.toISOString().slice(0, 10).replace(/-/g, "/");

  const today: string = fmt(new Date());
  const twoDaysAgo: string = fmt(
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  );

  const companyNews = await finnhubClient.companyNews(
    ticker,
    twoDaysAgo, // TODO: reconsider this
    today
  );
  if (!companyNews.data) {
    return [] as MarketNews[];
  }

  return companyNews.data.map((item) => ({
    id: item.id?.toString(),
    headline: item.headline,
    summary: item.summary,
    category: "company",
    url: item.url,
    imageUrl: item.image,
    related: item.related,
    source: item.source,
    datetime: item.datetime
      ? new Date(item.datetime * 1000).toISOString()
      : undefined,
  }));
};

export const getChineseNews = async (
  category: string
): Promise<MarketNews[]> => {
  let result = [] as MarketNews[];
  if (category.toLowerCase() === "finance") {
    const news = await marketauxClient.news.getFeed({ countries: "cn" });
    const auxNews = news.data.map((item) => ({
      id: item.uuid.toString(),
      headline: item.title,
      summary: item.description,
      category: "stock",
      url: item.url,
      imageUrl: item.image_url,
      related: item.entities
        ? item.entities.map((entity) => entity.symbol).join(" ")
        : "",
      source: item.source,
      datetime: new Date(item.published_at).toISOString(), // time from marketaux is in this format: 2025-10-09T08:23:31.000000Z
    }));

    const res = await axios.get<{ result: { newslist: TianNewsItem[] } }>(
      `https://apis.tianapi.com/caijing/index?key=${process.env.TIAN_API_KEY}&num=1`,
      { headers: { Accept: "application/json" } }
    );

    const tianNews = res.data.result.newslist.map((item: any) => ({
      id: item.id?.toString(),
      headline: item.title as string,
      summary: item.description as string,
      category: "finance" as string,
      url: item.url?.startsWith("//") ? "https:" + item.url : item.url,
      imageUrl: item.picUrl?.startsWith("//")
        ? "https:" + item.picUrl
        : item.picUrl,
      related: "",
      source: item.source as string,
      datetime: new Date(item.ctime + "Z").toISOString() as string, // time from tianapi is 2021-02-04 18:00
    }));
    result = [...tianNews, ...auxNews];
  } else if (category === "business") {
    const mediaStackRes = await axios.get<MediastackResponse>(
      `http://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_API_KEY}&categories=business&countries=cn`
    );

    const newsList = mediaStackRes.data.data.map((item) => ({
      id: item.url,
      headline: item.title,
      summary: item.description,
      category: item.category,
      url: item.url,
      imageUrl: item.image as string,
      related: "",
      source: item.source,
      datetime: new Date(item.published_at).toISOString(),
    }));

    result = newsList;
  }

  return result;
};
