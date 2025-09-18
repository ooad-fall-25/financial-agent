"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PerformanceData } from "@/lib/yahoo"; // Adjust this import path if needed

// ========================================================================
// This is like your SINGLE OBJECT example.
// It takes ONE object (`data`) and correctly renders its properties.
// ========================================================================
const PerformanceCard = ({ data, ticker }: { data: PerformanceData; ticker: string }) => {
  const isStockPositive = data.stock_return >= 0;
  const isBenchmarkPositive = data.benchmark_return >= 0;

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      {/* Accessing a property: data.period */}
      <h4 className="font-bold text-lg mb-3">{data.period}</h4>
      <div className="flex justify-between items-center text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">{ticker}</p>
          {/* Accessing a property: data.stock_return */}
          <p className={`font-semibold ${isStockPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isStockPositive ? '+' : ''}{data.stock_return.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">S&P 500 (^GSPC)</p>
          {/* Accessing a property: data.benchmark_return */}
          <p className={`font-semibold ${isBenchmarkPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isBenchmarkPositive ? '+' : ''}{data.benchmark_return.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

interface Props {
  Ticker: string;
}

export const YahooPerformanceOverview = ({ Ticker }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading, isError } = useQuery(
    trpc.YahooMarket.fetchStockPerformance.queryOptions({ ticker: Ticker })
  );

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
        {/* ============================================================ */}
        {/* This is your ARRAY example. */}
        {/* We use .map() to loop through the 'data' array. */}
        {/* For each item, we render the PerformanceCard component. */}
        {/* ============================================================ */}
        {data.map((performanceItem) => (
          <PerformanceCard key={performanceItem.period} data={performanceItem} ticker={Ticker} />
        ))}
      </div>
    </div>
  );
};