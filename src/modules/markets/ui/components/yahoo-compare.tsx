// In components/yahoo-compare.tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CompetitorsData } from "@/lib/yahoo"; // Adjust path if needed
import { Plus } from "lucide-react";

// Helper component for a single competitor card
const CompetitorCard = ({ data }: { data: CompetitorsData }) => {
  // Determine if the change is positive or negative from the string
  const isPositive = data.changePercent && !String(data.changePercent).startsWith('-');

  return (
    <div className="p-4 bg-card rounded-lg border border-border flex-shrink-0 w-64 relative">
      <button className="absolute top-3 right-3 p-1 bg-muted rounded-full hover:bg-primary/20">
        <Plus className="h-4 w-4" />
      </button>
      
      <p className="font-bold text-lg">{data.ticker}</p>
      <p className="text-sm text-muted-foreground truncate">{data.companyName}</p>
      
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-semibold text-lg">{data.price}</p>
        <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {data.changePercent}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-xs">
        {/* Market Cap is missing from your Python response, so we'll add it later if needed */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Industry</span>
          <span className="truncate text-right">&nbsp;{data.industry}</span>
        </div>
      </div>
    </div>
  );
};

interface Props {
  Ticker: string;
}

export const YahooCompare = ({ Ticker }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading, isError } = useQuery(
    // Ensure this path matches your tRPC router structure
    trpc.YahooMarket.fetchCompCompetitors.queryOptions({ ticker: Ticker })
  );

  if (isLoading) {
    return <div className="p-4 bg-card rounded-lg h-48 animate-pulse" />;
  }

  if (isError || !data || data.length === 0) {
    return null; // Don't show the component if there's an error or no competitors
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Compare To: {Ticker}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Select to analyze similar companies using key performance metrics.
      </p>
      {/* This div makes the cards scroll horizontally on small screens */}
      <div className="flex gap-4 mt-4 pb-4 overflow-x-auto">
        {data.map((competitor) => (
          <CompetitorCard key={competitor.ticker} data={competitor} />
        ))}
      </div>
    </div>
  );
};