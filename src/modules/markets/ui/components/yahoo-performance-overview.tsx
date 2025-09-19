"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PerformanceData } from "@/lib/yahoo"; // Adjust import path if needed
import { useState, useEffect } from "react";
import { usePrevious } from "@/lib/use-previous";

// ========================================================================
// The PerformanceCard component with the corrected className
// ========================================================================
const PerformanceCard = ({ data, ticker }: { data: PerformanceData; ticker: string }) => {
  const [highlightClass, setHighlightClass] = useState('');
  const prevStockReturn = usePrevious(data.stock_return);

  useEffect(() => {
    if (prevStockReturn !== undefined) {
      if (data.stock_return > prevStockReturn) {
        setHighlightClass('highlight-green');
      } else if (data.stock_return < prevStockReturn) {
        setHighlightClass('highlight-red');
      }
    }

    if (highlightClass) {
      const timer = setTimeout(() => {
        setHighlightClass('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data.stock_return, prevStockReturn, highlightClass]);

  const isStockPositive = data.stock_return >= 0;
  const isBenchmarkPositive = data.benchmark_return >= 0;

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h4 className="font-bold text-lg mb-3">{data.period}</h4>
      <div className="flex justify-between items-center text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">{ticker}</p>
          
          {/* --- THIS IS THE FIX --- */}
          {/* The text color is now ALWAYS set based on isStockPositive. */}
          {/* The `!highlightClass &&` condition has been removed. */}
          <p className={`font-semibold ${isStockPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
              {isStockPositive ? '+' : ''}{data.stock_return.toFixed(2)}%
            </span>
          </p>

        </div>
        <div className="text-center">
          <p className="text-muted-foreground">S&P 500 (^GSPC)</p>
          <p className={`font-semibold ${isBenchmarkPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isBenchmarkPositive ? '+' : ''}{data.benchmark_return.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

// ========================================================================
// The parent component remains the same (no changes needed here)
// ========================================================================
interface Props {
  Ticker: string;
}

export const YahooPerformanceOverview = ({ Ticker }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchStockPerformance.queryOptions({ ticker: Ticker }),
    refetchInterval: 500, 
    refetchIntervalInBackground: true
  });

  if (isLoading) {
    return <div className="p-4 bg-card rounded-lg h-40 animate-pulse" />;
  }

  if (isError || !data) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Performance Overview: {Ticker}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Trailing total returns. Benchmark is S&P 500 (^GSPC).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {data.map((performanceItem) => (
          <PerformanceCard 
            key={performanceItem.period} 
            data={performanceItem} 
            ticker={Ticker}
          />
        ))}
      </div>
    </div>
  );
};