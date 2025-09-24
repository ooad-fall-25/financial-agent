import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getMarketNews } from "./finnhub"
import { getStockNews } from "./polygon"

import * as cheerio from "cheerio";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAllFinnhubNewsSummary = async (category: string) => {
  const newsResponse = await getMarketNews(category); 
  const news = newsResponse.data; 

  const summaries = news.map((item, index) => {
    return `${index + 1}. Headline: ${item.headline}. Summary: ${item.summary}`;  
  });
  
  return summaries.join(", ");
}

export const getAllPolygonNewsSummary = async () => {
  const newsResponse = await getStockNews(); 
  const news = newsResponse.results || []; 

  const summaries = news.map((item, index) => {
    return `${index + 1}. Title: ${item.title}. Description: ${item.description}`;  
  })
  
  return summaries.join(", "); 
}

export const getWebsiteHTMLText = async (url: string) => {
   const res = await fetch(url); 
   const html = await res.text(); 


   const $ = cheerio.load(html); 

   $("script, style, nav, footer, header").remove(); 

   const text = $("body").text().replace(/\s+/g, " ").trim(); 

   return text; 
} 
