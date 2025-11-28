import * as cheerio from "cheerio";

import { getStockNews } from "./polygon";
import { getMarketNews } from "./finnhub";
import { getAlpacaStockNews } from "./alpaca";
import { marked } from "marked";
import puppeteer from "puppeteer";
import {
  getChineseNews,
  getUSCompanyNews,
  getUSMarketNews,
  MarketNews,
} from "./news-summary";
import { read, utils } from "xlsx";
import { getPath } from 'pdf-parse/worker'; // must import this before PDFParse
import { PDFParse } from "pdf-parse";
PDFParse.setWorker(getPath());

//********important**********: dont import this help.ts to client components (the .tsx file)

export const getAccumulatedNews = async (
  marketType: string,
  category: string,
  limit?: number,
  ticker?: string
) => {
  let news = [] as MarketNews[];
  if (marketType === "us" && category === "company") {
    news = await getUSCompanyNews(ticker || "AAPL");
  } else if (marketType === "us") {
    news = await getUSMarketNews(category);
  } else if (marketType === "cn") {
    news = await getChineseNews(category);
  } else {
    return "";
  }

  news.sort((a, b) => {
    const timeA = a.datetime ? new Date(a.datetime).getTime() : 0;
    const timeB = b.datetime ? new Date(b.datetime).getTime() : 0;
    return timeB - timeA; // descending
  });

  if (!limit) {
    limit = news.length;
  }

  if (limit === 0 || limit > news.length) {
    limit = news.length;
  }

  const limitedNews = news.slice(0, limit);

  const summaries = limitedNews.map((item, index) => {
    return `${index + 1}. Headline: ${item.headline}. Summary: ${
      item.summary
    }. Datetime: ${item.datetime}`;
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

// export const pdfToText = async (content: Buffer) => {
//     const parser = new PDFParse({ data: content });
//     const result = await parser.getText();
//     console.log(result.text);
//     return result.text;
// };

export const pdfToText = async (content: Buffer) => {
  
  // PDFParse.setWorker(getData());
  const uint8 = new Uint8Array(content);

  const parser = new PDFParse({data: uint8});

  const result = await parser.getText();
  return result.text;
};

export const xlsxToText = (content: Buffer) => {  
    // load workbook
    const workbook = read(content, {type: 'buffer'});
  
    // pick a sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
  
    // convert sheet to JSON to text
    const data: any[] = utils.sheet_to_json(sheet, {header:1});
    const textData = data.map(row => row.join('\t')).join('\n');
  
    return textData; 
};