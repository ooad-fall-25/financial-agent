"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { usePrevious } from "@/lib/use-previous"; // Your existing hook
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

// ========================================================================
// 1. Data and Types
// ========================================================================

// We need to update our data type to include the sparkline data
interface MarketSummaryData {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: { price: number }[]; // Optional array for the mini-chart
}

// Ticker lists for each region
const americasTickers = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', 'DX-Y.NYB', '^GSPTSE', '^BVSP'];
const europeTickers = ['^FTSE', '^GDAXI', '^FCHI', '^STOXX50E', 'IEUR', '^AEX'];
const asiaTickers = ['^N225', '^HSI', '000001.SS', '^BSESN', '^AXJO', '^KS11'];

// ========================================================================
// 2. The Reusable Sparkline Chart Component
// ========================================================================
const SparklineChart = ({ data, isPositive }: { data: { price: number }[], isPositive: boolean }) => {
  if (!data || data.length < 2) { // Need at least 2 points to draw a line
    return <div className="w-16 h-8 bg-gray-800/50 rounded" />;
  }

  // --- THIS IS THE FIX ---
  // We use useMemo to calculate the Y-axis domain only when the data changes.
  const yAxisDomain = useMemo(() => {
    // Extract all price points from the data array
    const prices = data.map(p => p.price);
    const dataMin = Math.min(...prices);
    const dataMax = Math.max(...prices);

    // If all data points are the same, create a small artificial range
    if (dataMin === dataMax) {
      // Create a small buffer (e.g., 0.5% of the value) above and below
      const buffer = Math.abs(dataMin * 0.005);
      return [dataMin - buffer, dataMax + buffer];
    }
    
    // If data varies, add a small padding to the top and bottom for aesthetics
    const range = dataMax - dataMin;
    return [dataMin - range * 0.1, dataMax + range * 0.1];

  }, [data]); // Dependency array: this code only runs when `data` changes

  const strokeColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* Add a hidden YAxis and pass our calculated domain to it */}
          <YAxis domain={yAxisDomain} hide />
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


// ========================================================================
// 3. The Stateful Row Component (Manages its own highlights)
// ========================================================================
const IndexRow = ({ data }: { data: MarketSummaryData }) => {
  // ... (This component is correct and does not need changes)
  const [highlightClass, setHighlightClass] = useState('');
  const prevPrice = usePrevious(data.price);

  useEffect(() => {
    if (prevPrice !== undefined && data.price !== prevPrice) {
      setHighlightClass(data.price > prevPrice ? 'highlight-green' : 'highlight-red');
    }
    if (highlightClass) {
      const timer = setTimeout(() => setHighlightClass(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [data.price, prevPrice, highlightClass]);

  const isPositive = data.changePercent >= 0;

  return (
    <tr className="border-b border-gray-800">
      <td className="py-2 px-2 font-semibold truncate whitespace-nowrap">
        {data.companyName.split(' ')[0] === data.ticker ? data.ticker : data.companyName}
      </td>
      <td className="py-2 px-2">
        <SparklineChart data={data.sparkline || []} isPositive={isPositive} />
      </td>
      <td className="py-2 px-2 text-right font-mono">
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>
          {data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </td>
      <td className={`py-2 px-2 text-right font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>
          {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
        </span>
      </td>
    </tr>
  );
};

// ========================================================================
// 4. The Reusable Table Component for each Region
// ========================================================================
const IndicesTable = ({ title, tickers }: { title: string, tickers: string[] }) => {
  const trpc = useTRPC();
  
  const { data, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchMarketDataByTickers.queryOptions({ tickers: tickers }),
    refetchInterval: 500, // I've adjusted this to a safer 30 seconds
    refetchIntervalInBackground: true
  });

  // ... (loading and error states remain the same)
  if (isLoading) { /* ... */ }
  if (isError || !data) return null;

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
      <h3 className="font-bold mb-2 text-white">{title}</h3>
      {/* Add `table-fixed` to ensure the column widths are respected */}
      <table className="w-full table-fixed text-sm text-gray-300">
        <thead>
          <tr className="text-left text-gray-500">
            {/* --- THE FIX IS HERE --- */}
            {/* Column 1: Symbol (takes up the most space) */}
            <th className="w-2/5 py-1 px-2 font-normal">Symbol</th>
            
            {/* Column 2: Chart (fixed width) */}
            <th className="w-1/5 py-1 px-2 font-normal"></th> 
            
            {/* Column 3: Price (flexible but smaller) */}
            <th className="w-1/5 py-1 px-2 font-normal text-right">Price</th>

            {/* Column 4: Change % (flexible but smaller) */}
            <th className="w-1/5 py-1 px-2 font-normal text-right">Change %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((indexData) => (
            <IndexRow key={indexData.ticker} data={indexData} />
          ))}
        </tbody>
      </table>
    </div>
  );
};


// ========================================================================
// 5. The Main Exported Component
// ========================================================================
export const WorldIndices = () => {
  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          World Indices <span className="text-green-500">&rarr;</span>
        </h2>
        {/* Optional: Add navigation arrows here */}
      </div>

      {/* This creates the 3-column responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IndicesTable title="Americas" tickers={americasTickers} />
        <IndicesTable title="Europe" tickers={europeTickers} />
        <IndicesTable title="Asia" tickers={asiaTickers} />
      </div>
    </div>
  );
};