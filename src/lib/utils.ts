import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getMarketNews } from "./finnhub"
import { getStockNews } from "./polygon"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAllFinnhubNewsSummary = async (category: string) => {
  const newsResponse = await getMarketNews(category); 
  const news = newsResponse.data; 

  const summaries = news.map((item, index) => {
    return `${index + 1}. ${item.summary}`;  
  });
  
  return summaries.join(", ");
}

export const getAllPolygonNewsSummary = async () => {
  const newsResponse = await getStockNews(); 
  const news = newsResponse.results || []; 

  const summaries = news.map((item, index) => {
    return `${index + 1}. ${item.description}`
  })
  
  return summaries.join(", "); 
}