"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { usePrevious } from "@/lib/use-previous";
// --- 1. IMPORT AreaChart and Area for the new chart style ---
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
// --- 2. IMPORT the icons from lucide-react ---
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";


// ========================================================================
// Data and Types (No changes needed)
// ========================================================================
interface MarketSummaryData {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: { price: number }[];
}

const americasTickers = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', 'DX-Y.NYB', '^GSPTSE', '^BVSP'];
const europeTickers = ['^FTSE', '^GDAXI', '^FCHI', '^STOXX50E', 'IEUR', '^AEX'];
const asiaTickers = ['^N225', '^HSI', '000001.SS', '^BSESN', '^AXJO', '^KS11'];

// ========================================================================
// 3. The UPGRADED Sparkline Chart Component
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

  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `gradient-${isPositive ? 'positive' : 'negative'}-${Math.random()}`; // Unique ID

  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        {/* Use AreaChart instead of LineChart */}
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis domain={yAxisDomain} hide />
          {/* Use Area instead of Line */}
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
// Stateful Row Component (No changes needed)
// ========================================================================
const IndexRow = ({ data }: { data: MarketSummaryData }) => {
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
// Reusable Table Component (No changes needed)
// ========================================================================
const IndicesTable = ({ title, tickers }: { title: string, tickers: string[] }) => {
    const trpc = useTRPC();
    const { data, isLoading, isError } = useQuery({
      ...trpc.YahooMarket.fetchMarketDataByTickers.queryOptions({ tickers: tickers }),
      refetchInterval: 30000,
      refetchIntervalInBackground: true
    });
  
    if (isLoading) {
      return (
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-white">{title}</h3>
          <div className="h-64 bg-gray-800 rounded animate-pulse"></div>
        </div>
      );
    }
    if (isError || !data) return null;
  
    return (
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <h3 className="font-bold mb-2 text-white">{title}</h3>
        <table className="w-full table-fixed text-sm text-gray-300">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="w-2/5 py-1 px-2 font-normal">Symbol</th>
              <th className="w-1/5 py-1 px-2 font-normal"></th> 
              <th className="w-1/5 py-1 px-2 font-normal text-right">Price</th>
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
// 4. The UPGRADED Main Exported Component
// ========================================================================
export const WorldIndices = () => {
  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          World Indices 
          {/* Replace the text arrow with a Lucide icon */}
          <ArrowRight className="text-green-500" size={24} />
        </h2>
        
        {/* Add the navigation buttons */}
        <div className="flex items-center gap-2">
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IndicesTable title="Americas" tickers={americasTickers} />
        <IndicesTable title="Europe" tickers={europeTickers} />
        <IndicesTable title="Asia" tickers={asiaTickers} />
      </div>
    </div>
  );
};