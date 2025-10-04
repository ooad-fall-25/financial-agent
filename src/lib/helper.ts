import * as cheerio from "cheerio";

import { getStockNews } from "./polygon";
import { getMarketNews } from "./finnhub";
import { getAlpacaStockNews } from "./alpaca";
import { marked } from "marked";
import puppeteer from "puppeteer";

//********important**********: dont import this help.ts to client components (the .tsx file)

export const getAllFinnhubNewsSummary = async (category: string) => {
  const newsResponse = await getMarketNews(category);
  const news = newsResponse.data;

  const summaries = news.map((item, index) => {
    return `${index + 1}. Headline: ${item.headline}. Summary: ${item.summary}`;
  });

  return summaries.join(", ");
};

export const getAllPolygonNewsSummary = async () => {
  const newsResponse = await getStockNews();
  const news = newsResponse.results || [];

  const summaries = news.map((item, index) => {
    return `${index + 1}. Title: ${item.title}. Description: ${
      item.description
    }`;
  });

  return summaries.join(", ");
};

export const getAllAlpacaNewsSummary = async () => {
  const news = await getAlpacaStockNews();

  const summaries = news.map((item, index) => {
    return `${index + 1}. Headline: ${item.Headline}. Summary: ${item.Summary}`;
  });

  return summaries.join(", ");
};

export const getWebsiteHTMLText = async (url: string) => {
  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);

  $("script, style, nav, footer, header").remove();

  const text = $("body").text().replace(/\s+/g, " ").trim();

  return text;
};

export const getHeadlineFromAIResponse = (content: string) => {
  const match = content.match(/^\[\/\/\]:\s*#\s*"([^"]+)"/m);
  if (match) {
    return match[1];
  }
  return "Placeholder";
};

export const markdownToPDF = async (markdown: string) => {
  const html = marked(markdown) as string;

  // 2. Optional: OCR on images
  // TODO: parse <img> tags and run Tesseract if needed

  // 3. Puppeteer: HTML -> PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  
  return pdfBuffer; 
};
