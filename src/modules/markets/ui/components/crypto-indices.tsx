"use client";

import { useTRPC } from "@/trpc/client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrevious } from "@/lib/use-previous";
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowRight } from "lucide-react";
import Image from "next/image";

// ========================================================================
// 1. Types, Data, and Helpers
// ========================================================================
interface CryptoData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume24hr: number;
  volumeAllCurrencies24hr: number;
  circulatingSupply: number;
  sparkline?: { price: number }[];
}

// Helper to get crypto icons from a reliable, free source
const getCryptoIconUrl = (ticker: string) => {
  const symbol = ticker.replace('-USD', '').toLowerCase();
  // Use the reliable CoinCap static asset CDN
  return `https://static.coincap.io/assets/icons/${symbol}@2x.png`;
};

// Helper to format large numbers (Trillions, Billions, Millions)
const formatLargeNumber = (num: number): string => {
  if (!num) return '--';
  if (num >= 1e12) return `${(num / 1e12).toFixed(3)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(3)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(3)}M`;
  return num.toLocaleString();
};


// ========================================================================
// 2. Reusable Sub-Components (Sparkline, Row)
// ========================================================================
const SparklineChart = ({ data, isPositive }: { data: { price: number }[], isPositive: boolean }) => {
  if (!data || data.length < 2) {
    return <div className="w-20 h-8" />;
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
  const gradientId = `crypto-gradient-${Math.random()}`;
  
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis domain={yAxisDomain} hide />
          <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const CryptoTableRow = ({ crypto }: { crypto: CryptoData }) => {
  const [highlightClass, setHighlightClass] = useState('');
  const prevPrice = usePrevious(crypto.price);
  
  // --- THIS IS THE FIX ---
  // Add state to handle image loading errors
  const [imgSrc, setImgSrc] = useState(getCryptoIconUrl(crypto.ticker));

  useEffect(() => {
    if (prevPrice !== undefined && crypto.price !== prevPrice) {
      setHighlightClass(crypto.price > prevPrice ? 'highlight-green' : 'highlight-red');
    }
    if (highlightClass) {
      const timer = setTimeout(() => setHighlightClass(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [crypto.price, prevPrice, highlightClass]);

  const isPositive = crypto.change >= 0;

  return (
    <tr className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50">
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          {/* Update the Image component with the new props */}
          <Image 
            src={imgSrc} 
            alt={`${crypto.name} logo`}
            width={24} 
            height={24} 
            unoptimized
            // This is the key: if the image fails to load, we set a fallback
            onError={() => setImgSrc('/fallback-crypto-icon.svg')} // A generic icon in your /public folder
          />
          <span className="font-bold text-blue-400">{crypto.ticker}</span>
        </div>
      </td>
      {/* ... (the rest of the table cells are correct) ... */}
      <td className="py-3 px-2">{crypto.name}</td>
      <td className="py-3 px-2"><SparklineChart data={crypto.sparkline || []} isPositive={isPositive} /></td>
      <td className="py-3 px-2 text-right font-mono">
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>{crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
      </td>
      <td className={`py-3 px-2 text-right font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>{isPositive ? '+' : ''}{crypto.change.toFixed(4)}</span>
      </td>
      <td className={`py-3 px-2 text-right font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span className={`inline-block px-1 rounded-md ${highlightClass}`}>{isPositive ? '+' : ''}{crypto.changePercent.toFixed(2)}%</span>
      </td>
      <td className="py-3 px-2 text-right">{formatLargeNumber(crypto.marketCap)}</td>
      <td className="py-3 px-2 text-right">{formatLargeNumber(crypto.volume24hr)}</td>
      <td className="py-3 px-2 text-right">{formatLargeNumber(crypto.volumeAllCurrencies24hr)}</td>
      <td className="py-3 px-2 text-right">{formatLargeNumber(crypto.circulatingSupply)}</td>
    </tr>
  );
};


// ========================================================================
// 3. The Main Exported Component
// ========================================================================
export const CryptoDashboard = () => {
  const trpc = useTRPC();
  const screenerTabs = [
    { id: 'all_cryptocurrencies_us', label: 'All' },
    { id: 'most_actives_cryptocurrencies', label: 'Most Active' },
    { id: 'day_gainers_cryptocurrencies', label: 'Top Gainers' },
    { id: 'day_losers_cryptocurrencies', label: 'Top Losers' },
  ];
  const [activeTab, setActiveTab] = useState(screenerTabs[0].id);

  const { data: screenerData, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchCryptoScreener.queryOptions({ screener: activeTab }),
    refetchInterval: 500,
    refetchIntervalInBackground: true
  });
  
  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Cryptocurrencies <ArrowRight className="text-gray-500" size={24} />
        </h2>
      </div>
      
      <div className="flex items-center gap-2 mb-4 border-b border-gray-800">
        {screenerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-gray-700/50 rounded-t-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm text-gray-300">
          <thead className="border-b border-gray-700 text-xs uppercase text-gray-400">
            <tr>
              <th className="py-3 px-2 font-normal">Symbol</th>
              <th className="py-3 px-2 font-normal">Name</th>
              <th className="py-3 px-2 font-normal"></th> {/* Chart */}
              <th className="py-3 px-2 font-normal text-right">Price</th>
              <th className="py-3 px-2 font-normal text-right">Change</th>
              <th className="py-3 px-2 font-normal text-right">Change %</th>
              <th className="py-3 px-2 font-normal text-right">Market Cap</th>
              <th className="py-3 px-2 font-normal text-right">Volume 24hr</th>
              <th className="py-3 px-2 font-normal text-right">Total Volume 24hr</th>
              <th className="py-3 px-2 font-normal text-right">Circulating Supply</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-800"><td colSpan={10} className="py-6 px-2"><div className="h-4 bg-gray-800 rounded animate-pulse"></div></td></tr>
            ))}
            {isError && <tr><td colSpan={10} className="text-center py-8 text-red-500">Error loading data.</td></tr>}
            
            {/* This is the fix for the hydration error */}
            {(screenerData ?? []).map((crypto) => (
              <CryptoTableRow key={crypto.ticker} crypto={crypto} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};