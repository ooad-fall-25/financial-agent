"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CompetitorsData } from "@/lib/yahoo"; // Adjust path if needed
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { usePrevious } from "@/lib/use-previous";

// ========================================================================
// CompetitorCard component with the corrected type handling
// ========================================================================
const CompetitorCard = ({ data }: { data: CompetitorsData }) => {
  const [highlightClass, setHighlightClass] = useState('');

  // --- THIS IS THE FIX ---
  // The type system knows `data.price` is a number, so we use it directly.
  // The complex and incorrect string parsing has been removed.
  const currentPrice = data.price;
  const prevPrice = usePrevious(currentPrice);

  // The effect logic remains the same, as it correctly handles numbers.
  useEffect(() => {
    if (prevPrice !== undefined && currentPrice !== prevPrice) {
      if (currentPrice > prevPrice) {
        setHighlightClass('highlight-green');
      } else if (currentPrice < prevPrice) {
        setHighlightClass('highlight-red');
      }
    }
    
    if (highlightClass) {
      const timer = setTimeout(() => {
        setHighlightClass('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPrice, prevPrice, highlightClass]);

  const isPositive = data.changePercent && !String(data.changePercent).startsWith('-');

  return (
    <div className="p-4 bg-card rounded-lg border border-border flex-shrink-0 w-64 relative">
      <button className="absolute top-3 right-3 p-1 bg-muted rounded-full hover:bg-primary/20">
        <Plus className="h-4 w-4" />
      </button>
      
      <p className="font-bold text-lg">{data.ticker}</p>
      <p className="text-sm text-muted-foreground truncate">{data.companyName}</p>
      
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-semibold text-lg">
          <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
            {/* Displaying the price might require formatting if it's a raw number */}
            {typeof currentPrice === 'number' ? currentPrice.toFixed(2) : currentPrice}
          </span>
        </p>
        <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
            {data.changePercent}
          </span>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Industry</span>
          <span className="truncate text-right">&nbsp;{data.industry}</span>
        </div>
      </div>
    </div>
  );
};

// ========================================================================
// The parent component remains the same
// ========================================================================
interface Props {
  Ticker: string;
}

export const YahooCompare = ({ Ticker }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading, isError } = useQuery({
    ...trpc.YahooMarket.fetchCompCompetitors.queryOptions({ ticker: Ticker }),
    refetchInterval: 500,
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return <div className="p-4 bg-card rounded-lg h-48 animate-pulse" />;
  }

  if (isError || !data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Compare To: {Ticker}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Select to analyze similar companies using key performance metrics.
      </p>
      <div className="flex gap-4 mt-4 pb-4 overflow-x-auto">
        {data.map((competitor) => (
          <CompetitorCard key={competitor.ticker} data={competitor} />
        ))}
      </div>
    </div>
  );
};