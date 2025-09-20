"use client";

import React, { useState, useEffect } from 'react';
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { usePrevious } from '@/lib/use-previous'; // Make sure to import the hook

// --- Type Definitions (from your original code) ---
type TrendingTickerData = {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
};

// Assuming a type for the screener data based on usage
type ScreenerStockData = {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
  fiftyTwoWeekChangePercent: number;
};

// --- Helper Functions (from your original code) ---
const formatLargeNumber = (num: number | null | undefined): string => {
  if (num === null || typeof num === 'undefined') return '--';
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  return num.toString();
};
const formatPercentage = (num: number | null | undefined): string => {
  if (num === null || typeof num === 'undefined') return '--';
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};
const formatPriceChange = (num: number | null | undefined): string => {
  if (num === null || typeof num === 'undefined') return '--';
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}`;
};


// ========================================================================
// 1. TRENDING SECTION: TrendingCard is now a stateful component
// ========================================================================
const TrendingCard = ({ ticker }: { ticker: TrendingTickerData }) => {
  const [highlightClass, setHighlightClass] = useState('');
  const prevPrice = usePrevious(ticker.price);

  useEffect(() => {
    if (prevPrice !== undefined && ticker.price !== prevPrice) {
      if (ticker.price > prevPrice) {
        setHighlightClass('highlight-green');
      } else {
        setHighlightClass('highlight-red');
      }
    }
    if (highlightClass) {
      const timer = setTimeout(() => setHighlightClass(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [ticker.price, prevPrice, highlightClass]);

  const isPositive = ticker.changePercent >= 0;

  return (
    <div className="flex-shrink-0 w-48 p-4 mr-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-white">{ticker.ticker}</h3>
      <p className="text-sm text-gray-400 truncate">{ticker.companyName}</p>
      <p className="mt-2 text-xl font-semibold text-white">
        <span className={`inline-block px-2 py-1 rounded-md ${highlightClass}`}>
          ${ticker.price?.toFixed(2)}
        </span>
      </p>
      <p className={`text-md ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>
          {formatPercentage(ticker.changePercent)}
        </span>
      </p>
    </div>
  );
};

export const TrendingSection = () => {
  const trpc = useTRPC();
  const { data: trendingData, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchTrendingTickers.queryOptions(),
    refetchInterval: 500, // Adjusted to 30 seconds
    refetchIntervalInBackground: true
  });

  if (isLoading) return <div>Loading Trending Stocks...</div>;
  if (isError) return <div>Error fetching trending stocks.</div>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Trending Now</h2>
      <div className="flex overflow-x-auto pb-4">
        {trendingData?.map((ticker) => (
          <TrendingCard key={ticker.ticker} ticker={ticker} />
        ))}
      </div>
    </div>
  );
};


// ========================================================================
// 2. MARKET SCREENER: We create a new stateful ScreenerTableRow component
// ========================================================================
const ScreenerTableRow = ({ stock }: { stock: ScreenerStockData }) => {
  const [highlightClass, setHighlightClass] = useState('');
  const prevPrice = usePrevious(stock.price);

  useEffect(() => {
    if (prevPrice !== undefined && stock.price !== prevPrice) {
      if (stock.price > prevPrice) {
        setHighlightClass('highlight-green');
      } else {
        setHighlightClass('highlight-red');
      }
    }
    if (highlightClass) {
      const timer = setTimeout(() => setHighlightClass(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [stock.price, prevPrice, highlightClass]);

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800">
      <td className="px-4 py-4 font-bold text-blue-400">
        <Link href={`/market-data/${stock.ticker}`}>{stock.ticker}</Link>
      </td>
      <td className="px-4 py-4">{stock.companyName}</td>
      <td className="px-4 py-4 text-right font-semibold">
        <span className={`inline-block px-2 py-1 rounded-md ${highlightClass}`}>
          ${stock.price?.toFixed(2)}
        </span>
      </td>
      <td className={`px-4 py-4 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`inline-block px-2 py-1 rounded-md ${highlightClass}`}>
          {formatPriceChange(stock.change)}
        </span>
      </td>
      <td className={`px-4 py-4 text-right ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`inline-block px-2 py-1 rounded-md ${highlightClass}`}>
          {formatPercentage(stock.changePercent)}
        </span>
      </td>
      <td className="px-4 py-4 text-right">{formatLargeNumber(stock.volume)}</td>
      <td className="px-4 py-4 text-right">{formatLargeNumber(stock.marketCap)}</td>
      <td className="px-4 py-4 text-right">{stock.peRatio?.toFixed(2) ?? '--'}</td>
      <td className={`px-4 py-4 text-right ${stock.fiftyTwoWeekChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {formatPercentage(stock.fiftyTwoWeekChangePercent)}
      </td>
    </tr>
  );
};

export const MarketScreener = () => {
  const trpc = useTRPC();
  const screenerTabs = [
    { id: 'most_actives', label: 'Most Active' },
    { id: 'day_gainers', label: 'Top Gainers' },
    { id: 'day_losers', label: 'Top Losers' },
    { id: 'recent_52_week_highs', label: '52 Week Gainers' },
    { id: 'recent_52_week_lows', label: '52 Week Losers' },
  ];
  const [activeTab, setActiveTab] = useState(screenerTabs[0].id);

  const { data: screenerData, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchMarketScreener.queryOptions({ query: activeTab }),
    refetchInterval: 500, // Adjusted to 30 seconds
    refetchIntervalInBackground: true
  });

  return (
    <div>
      <div className="flex border-b border-gray-700 mb-4">
        {screenerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === tab.id ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="border-b border-gray-700 text-xs uppercase text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">Symbol</th>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3 text-right">Price</th>
              <th scope="col" className="px-4 py-3 text-right">Change</th>
              <th scope="col" className="px-4 py-3 text-right">Change %</th>
              <th scope="col" className="px-4 py-3 text-right">Volume</th>
              <th scope="col" className="px-4 py-3 text-right">Market Cap</th>
              <th scope="col" className="px-4 py-3 text-right">P/E Ratio (TTM)</th>
              <th scope="col" className="px-4 py-3 text-right">52 Wk Change %</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9} className="text-center py-4">Loading...</td></tr>}
            {isError && <tr><td colSpan={9} className="text-center py-4 text-red-500">Error loading data.</td></tr>}
            {screenerData?.map((stock) => (
              // Use the new stateful component for each row
              <ScreenerTableRow key={stock.ticker} stock={stock} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};