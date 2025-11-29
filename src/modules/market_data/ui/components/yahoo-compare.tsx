"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react"; // <-- IMPORT ADDED HERE

interface Props {
  Ticker: string;
}

interface CompetitorData {
  ticker: string;
  companyName: string;
  industry: string;
  marketCap: number; // in millions
  price: number;
  percentChange: number;
}

// Helper function to format large numbers for Market Cap
const formatMarketCap = (mktCap: number): string => {
  if (!mktCap || mktCap === 0) return 'N/A';
  if (mktCap >= 1000) {
    return `${(mktCap / 1000).toFixed(2)}B`;
  }
  return `${mktCap.toFixed(2)}M`;
};

const CompetitorCard = ({ data, mainTicker }: { data: CompetitorData; mainTicker: string }) => {
  const isPositive = data.percentChange >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const changeSign = isPositive ? '+' : '';

  return (
    <div className="p-4 bg-card rounded-lg border border-border flex-shrink-0 w-64 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-lg">{data.ticker}</p>
            <p className="text-sm text-muted-foreground truncate">{data.companyName}</p>
          </div>
          <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${data.ticker === mainTicker ? 'border-primary bg-primary/10' : 'border-border'}`}>
            {data.ticker === mainTicker ? <Check className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
        
        <div className="mb-4">
          <span className="font-semibold text-lg">{data.price.toFixed(2)}</span>
          <span className={`ml-2 text-sm font-semibold ${changeColor}`}>
            {changeSign}{data.percentChange.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="pt-2 border-t border-border/50 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mkt Cap</span>
          <span className="font-medium text-foreground">{formatMarketCap(data.marketCap)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Industry</span>
          <span className="truncate text-right font-medium text-foreground">{data.industry}</span>
        </div>
      </div>
    </div>
  );
};

export const CompareComponent = ({ Ticker }: Props) => {
  const trpc = useTRPC();

  const { data: competitors, isLoading, isError } = useQuery({
    ...trpc.AlpacaData.fetchCompetitors.queryOptions({ ticker: Ticker }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true
  });

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse bg-muted rounded-lg" />;
  }

  if (isError || !competitors || competitors.length === 0) {
    return <p className="text-muted-foreground">Could not load competitor data.</p>;
  }

  // FIX: Deduplicate competitors by ticker
  const uniqueCompetitors = competitors.reduce((acc: CompetitorData[], competitor) => {
    // Only add if ticker doesn't already exist
    if (!acc.find(c => c.ticker === competitor.ticker)) {
      acc.push(competitor);
    }
    return acc;
  }, []);

  return (
    <div>
      <h3 className="text-xl font-bold">Compare To: {Ticker}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Select to analyze similar companies using key performance metrics.
      </p>
      <div className="flex gap-4 mt-4 pb-4 overflow-x-auto">
        {uniqueCompetitors.map((competitor) => (
          <CompetitorCard 
            key={competitor.ticker} 
            data={competitor}
            mainTicker={Ticker} 
          />
        ))}
      </div>
    </div>
  );
};