"use client";

import { useTRPC } from "@/trpc/client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrevious } from "@/lib/use-previous"; // Your existing hook
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ChevronLeft, ChevronRight } from "lucide-react";

// ========================================================================
// 1. Data and Types
// ========================================================================
interface MarketSummaryData {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: { price: number }[];
}

// Correct Yahoo Finance tickers for each asset class
const commodityTickers = ['SI=F', 'GC=F', 'HG=F', 'BZ=F', 'CL=F', 'NG=F'];
const currencyTickers = ['GBPUSD=X', 'AUDUSD=X', 'JPY=X', 'MXNUSD=X', 'CADUSD=X', 'EURUSD=X'];
const bondTickers = ['^TNX', '^FVX', '^TYX', 'ZN=F', 'ZB=F', '^IRX'];

// ========================================================================
// 2. The Upgraded Sparkline Chart Component (with Area Gradient)
// ========================================================================
const SparklineChart = ({ data, isPositive }: { data: { price: number }[], isPositive: boolean }) => {
  if (!data || data.length < 2) {
    return <div className="w-16 h-8 bg-gray-800/50 rounded" />;
  }

  const yAxisDomain = useMemo(() => {
    const prices = data.map(p => p.price);
    const dataMin = Math.min(...prices);
    const dataMax = Math.max(...prices);
    if (dataMin === dataMax) {
      const buffer = Math.abs(dataMin * 0.005) || 0.01;
      return [dataMin - buffer, dataMax + buffer];
    }
    const range = dataMax - dataMin;
    return [dataMin - range * 0.1, dataMax + range * 0.1];
  }, [data]);

  const strokeColor = isPositive ? '#22c55e' : '#ef4444'; // green-500 or red-500
  const gradientId = isPositive ? 'gradient-positive' : 'gradient-negative';

  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          {/* Define the gradients for the area fill */}
          <defs>
            <linearGradient id="gradient-positive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gradient-negative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis domain={yAxisDomain} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ========================================================================
// 3. The Stateful Row Component (Manages its own highlights)
// ========================================================================
const AssetRow = ({ data }: { data: MarketSummaryData }) => {
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
    <tr className="border-b border-gray-800 last:border-b-0">
      {/* Column 1: Symbol and Chart */}
      <td className="py-2 px-2">
        <div className="flex justify-between items-center gap-2">
          <span className="font-semibold truncate whitespace-nowrap">
            {data.companyName}
          </span>
          <SparklineChart data={data.sparkline || []} isPositive={isPositive} />
        </div>
      </td>
      {/* Column 2: Price */}
      <td className="py-2 px-2 text-right font-mono">
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>
          {data.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
        </span>
      </td>
      {/* Column 3: Change % */}
      <td className={`py-2 px-2 text-right font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>
          {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
        </span>
      </td>
    </tr>
  );
};

// ========================================================================
// 4. The Reusable Table Component for each Asset Class
// ========================================================================
const AssetTable = ({ title, tickers }: { title: string, tickers: string[] }) => {
  const trpc = useTRPC();
  
  const { data, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchMarketDataByTickers.queryOptions({ tickers: tickers }),
    refetchInterval: 500, // I've adjusted this to a safer 30 seconds
    refetchIntervalInBackground: true
  });

  if (isLoading) {
    return <div className="h-80 bg-gray-800/50 rounded animate-pulse" />;
  }
  if (isError || !data) return null;

  return (
    <div className="bg-gray-900">
      <h3 className="font-bold mb-2 text-white flex items-center">
        {title} <span className="text-gray-500 ml-1">&rarr;</span>
      </h3>
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full table-fixed text-sm text-gray-300">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-800/50">
              <th className="w-1/2 py-2 px-2 font-normal">Symbol</th>
              <th className="w-1/4 py-2 px-2 font-normal text-right">Price</th>
              <th className="w-1/4 py-2 px-2 font-normal text-right">Change %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((assetData) => (
              <AssetRow key={assetData.ticker} data={assetData} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========================================================================
// 5. The Main Exported Component
// ========================================================================
export const AssetsDashboard = () => {
  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Assets</h2>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AssetTable title="Commodities" tickers={commodityTickers} />
        <AssetTable title="Currencies" tickers={currencyTickers} />
        <AssetTable title="US Treasury Bonds" tickers={bondTickers} />
      </div>
    </div>
  );
}