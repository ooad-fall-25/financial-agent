"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePrevious } from "@/lib/use-previous";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// ========================================================================
// 1. Data, Types, and Configuration (UNCHANGED)
// ========================================================================

export interface AlpacaSnapshot {
  latestTrade: { p: number; t: string };
  dailyBar: { o: number; h: number; l: number; c: number; v: number };
  prevDailyBar: { o: number; h: number; l: number; c: number; v: number };
}

const indicesData = {
  americas: { title: 'Americas', tickers: ['SPY', 'DIA', 'QQQ', 'IWM', 'EWZ', 'EWC'] },
  europe: { title: 'Europe', tickers: ['IEV', 'VGK', 'EWQ', 'EWG', 'EWU', 'EWL'] },
  asia: { title: 'Asia', tickers: ['VPL', 'EWJ', 'EWY', 'MCHI', 'INDA', 'EWS'] },
};

const indexNames: { [key: string]: string } = {
  SPY: 'S&P 500', DIA: 'Dow 30', QQQ: 'Nasdaq 100', IWM: 'Russell 2000', EWZ: 'Brazil (MSCI)', EWC: 'Canada (MSCI)',
  IEV: 'Europe 350 (S&P)', VGK: 'Europe (FTSE)', EWQ: 'France (MSCI)', EWG: 'Germany (MSCI)', EWU: 'United Kingdom (MSCI)', EWL: 'Switzerland (MSCI)',
  VPL: 'Pacific (FTSE)', EWJ: 'Japan (MSCI)', EWY: 'South Korea (MSCI)', MCHI: 'China (MSCI)', INDA: 'India (MSCI)', EWS: 'Singapore (MSCI)',
};

// ========================================================================
// 2. Internal Sub-Components (UNCHANGED)
// ========================================================================

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) {
    return <div className="w-20 h-8" />;
  }
  
  const chartData = data.map(price => ({ price }));
  const gradientId = `color-${color.replace('#', '')}`;

  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <YAxis hide={true} domain={['dataMin', 'dataMax']} />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="natural"
            dataKey="price" 
            stroke={color} 
            strokeWidth={2} 
            fillOpacity={1} 
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndexRow = ({ symbol, data, sparklineData }: { symbol: string; data: AlpacaSnapshot, sparklineData: number[] }) => {
    const [highlightClass, setHighlightClass] = useState('');
    const price = data.latestTrade?.p ?? data.dailyBar?.c ?? 0;
    const prevPrice = usePrevious(price);
  
    const prevClose = data.prevDailyBar?.c ?? 0;
    const changePercent = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;
    const isPositive = changePercent >= 0;
    const chartColor = isPositive ? '#22c55e' : '#ef4444';
    const companyName = indexNames[symbol] || symbol;
  
    useEffect(() => {
      if (prevPrice !== undefined && price !== prevPrice) {
        setHighlightClass(price > prevPrice ? 'highlight-green' : 'highlight-red');
      }
      if (highlightClass) {
        const timer = setTimeout(() => setHighlightClass(''), 1000);
        return () => clearTimeout(timer);
      }
    }, [price, prevPrice, highlightClass]);
  
    return (
      <tr className="border-b border-border/50 last:border-b-0">
        <td className="py-2 px-2 font-semibold truncate">{companyName}</td>
        <td className="py-2 px-2"><Sparkline data={sparklineData} color={chartColor} /></td>
        <td className="py-2 px-2 text-right font-mono whitespace-nowrap">
          <span className={`inline-block px-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
            {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </td>
        <td className={`py-2 px-2 text-right font-semibold whitespace-nowrap ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span className={`inline-block px-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </td>
      </tr>
    );
};

const IndicesTable = ({ title, tickers }: { title: string; tickers: string[] }) => {
    const trpc = useTRPC();
    
    const { data: snapshots, isLoading: isLoadingSnapshots } = useQuery({
      ...trpc.AlpacaData.fetchMarketDataByTickers.queryOptions({ tickers }),
      refetchInterval: 300,
    });
    
    const { data: sparklineData, isLoading: isLoadingSparklines } = useQuery({
        ...trpc.AlpacaData.fetchSparklineData.queryOptions({ tickers }),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });

    const isLoading = isLoadingSnapshots || isLoadingSparklines;
    
    if (isLoading) {
      return <div className="h-[280px] bg-card rounded-lg border border-border animate-pulse" />;
    }
    if (!snapshots) {
      return (
        <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="font-bold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm">Could not load market data.</p>
        </div>
      );
    }
  
    return (
      <div className="bg-card p-4 rounded-lg border border-border">
        <h3 className="font-bold mb-2 text-foreground">{title}</h3>
        <table className="w-full table-auto text-sm text-foreground">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-1 px-2 font-normal">Symbol</th>
              <th className="py-1 px-2 font-normal">Chart</th>
              <th className="py-1 px-2 font-normal text-right">Price</th>
              <th className="py-1 px-2 font-normal text-right whitespace-nowrap">Change %</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker, index) => {
              const snapshotData = snapshots[index];
              const singleSparklineData = sparklineData?.[ticker] ?? [];

              return snapshotData ? (
                <IndexRow 
                    key={ticker} 
                    symbol={ticker} 
                    data={snapshotData}
                    sparklineData={singleSparklineData}
                />
              ) : null;
            })}
          </tbody>
        </table>
      </div>
    );
};

// ========================================================================
// 4. Main Exported Component (WITH FINAL FIX)
// ========================================================================
export const WorldIndices = () => {
  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          World Indices <ArrowRight size={22} />
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        
        {/* --- THE ONLY CHANGE IS HERE --- */}
        {/* Increased the minimum width from 1200px to 1350px */}
        <div className="grid grid-cols-3 gap-6 min-w-[1350px]">
            <IndicesTable title={indicesData.americas.title} tickers={indicesData.americas.tickers} />
            <IndicesTable title={indicesData.europe.title} tickers={indicesData.europe.tickers} />
            <IndicesTable title={indicesData.asia.title} tickers={indicesData.asia.tickers} />
        </div>

      </div>
    </div>
  );
};