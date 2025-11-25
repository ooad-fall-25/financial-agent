// Type definitions for assets in the portfolio

export interface BaseAsset {
    tickerSymbol: string; // ticker symbol
    companyName?: string; // company name
    currentPrice?: number; // market price from API
    currency?: string; // currency the stock is in
    sector?: string; // company sector (take this outta tooltip since we need to filter)

    // (tooltip)
    createdAt: string; // date created
    lastUpdated?: string; // timestamp of last API price refresh

    // Alpaca-specific market fields (make it an expandable column, a bit complicated but prolly worth it?)
    open?: number; // daily open price (dailyBar.o)
    high?: number; // daily high price (dailyBar.h)
    low?: number;  // daily low price (dailyBar.l)
    close?: number; // current daily close (dailyBar.c)
    volume?: number; // daily trading volume (dailyBar.v)
    previousClose?: number; // previous day's close (prevDailyBar.c)
}

export interface WatchlistAsset extends BaseAsset {
    // note: these will be dynamically computed
    // priceChange?: number; // current_price - previousClose
    // priceChangePercent?: number; // (current_price - previousClose) / previousClose x 100

    // Finnhub fundamentals (include in the columns)
    marketCap?: number; // company valuation
    peRatio?: number; // price to earnings ratio
    fiftyTwoWeekRange?: [number, number];

    // If got alerts system
    alertPrice?: number;
}

export interface HoldingsAsset extends BaseAsset {
    quantity: number; // n of shares owned (user input)
    averageCost: number; // avg purchase price per share (user input)
    costBasis: number; // quantity x average_cost

    // note: these will be dynamically computed
    // marketValue?: number; // quantity x current_price
    // gainLossPercent?: number; // (current_price - average_cost) / average_cost x 100
    // unrealizedGainLoss?: number; // market_value - cost_basis
}