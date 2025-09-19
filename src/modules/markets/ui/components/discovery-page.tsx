import React, { useState } from 'react';
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
// Define the types for our data based on the Python API response.
// This gives us great autocomplete and type safety.
type TrendingTickerData = {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
};

type MarketScreenerData = {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume3Month: number;
  marketCap: number;
  peRatio: number | null;
  fiftyTwoWeekChangePercent: number;
};

// --- Helper Functions for Formatting ---
// It's good practice to format raw numbers for better display.
const formatLargeNumber = (num: number | null | undefined): string => {
  if (num === null || typeof num === 'undefined') return '--';
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  return num.toString();
};

const formatPercentage = (num: number | null | undefined): string => {
  if (num === null || typeof num === 'undefined') return '--';
  return `${num.toFixed(2)}%`;
};

const formatPriceChange = (num: number | null | undefined): string => {
    if (num === null || typeof num === 'undefined') return '--';
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}`;
}

// --- Sub-Components for UI Structure ---

// Component for a single "Trending Now" card
const TrendingCard = ({ ticker }: { ticker: TrendingTickerData }) => (
  <div className="flex-shrink-0 w-48 p-4 mr-4 bg-gray-800 rounded-lg">
    <h3 className="text-lg font-bold text-white">{ticker.ticker}</h3>
    <p className="text-sm text-gray-400 truncate">{ticker.companyName}</p>
    <p className="mt-2 text-xl font-semibold text-white">${ticker.price?.toFixed(2)}</p>
    <p className={`text-md ${ticker.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {ticker.changePercent >= 0 ? '+' : ''}{formatPercentage(ticker.changePercent)}
    </p>
  </div>
);

// Component for the "Trending Now" horizontal scrolling section
export const TrendingSection = () => {
  const trpc = useTRPC();
  // Use the tRPC hook to fetch trending tickers. No input is needed.
  const { data: trendingData, isLoading, isError } = useQuery(trpc.YahooMarket.fetchTrendingTickers.queryOptions());

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

// Component for the main market data table and its tabs
export const MarketScreener = () => {
    const trpc = useTRPC();
  // Define the tabs for the screener
  const screenerTabs = [
    { id: 'most_actives', label: 'Most Active' },
    { id: 'day_gainers', label: 'Top Gainers' },
    { id: 'day_losers', label: 'Top Losers' },
    { id: 'recent_52_week_highs', label: '52 Week Gainers' },
    { id: 'recent_52_week_lows', label: '52 Week Losers' },
  ];
  
  // State to keep track of the currently selected tab
  const [activeTab, setActiveTab] = useState(screenerTabs[0].id);

  // Use the tRPC hook to fetch screener data. The `input` is reactive.
  // When `activeTab` changes, tRPC will automatically refetch the data.
  const { data: screenerData, isLoading, isError } = useQuery(trpc.YahooMarket.fetchMarketScreener.queryOptions({ query: activeTab }));

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        {screenerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
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
              <tr key={stock.ticker} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="px-4 py-4 font-bold text-blue-400">
                    <Link href={`/market-data/${stock.ticker}`}>
                        {stock.ticker}
                    </Link>
                </td>
                <td className="px-4 py-4">{stock.companyName}</td>
                <td className="px-4 py-4 text-right font-semibold">${stock.price?.toFixed(2)}</td>
                <td className={`px-4 py-4 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPriceChange(stock.change)}</td>
                <td className={`px-4 py-4 text-right ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercentage(stock.changePercent)}</td>
                <td className="px-4 py-4 text-right">{formatLargeNumber(stock.volume)}</td>
                <td className="px-4 py-4 text-right">{formatLargeNumber(stock.marketCap)}</td>
                <td className="px-4 py-4 text-right">{stock.peRatio?.toFixed(2) ?? '--'}</td>
                <td className={`px-4 py-4 text-right ${stock.fiftyTwoWeekChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercentage(stock.fiftyTwoWeekChangePercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


