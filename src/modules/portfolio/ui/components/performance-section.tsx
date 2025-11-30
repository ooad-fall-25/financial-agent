"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculatePortfolioStats } from "@/lib/portfolio-math";
import { AllocationChart, MoversList, TopPerformersList } from "./performance-cards";
import { DollarSign, TrendingUp, TrendingDown, Percent, RefreshCw, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PerformanceSection = () => {
  const trpc = useTRPC();
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  
  const { data: holdingsData, isLoading, refetch, isRefetching } = useQuery({
    ...trpc.portfolio.getHoldings.queryOptions(),
    refetchInterval: 60000,
  });

  const handleRefresh = async () => {
    setIsManualRefresh(true);
    
    // 1. Force a minimum loading time (e.g., 500ms) so the user sees the spinner
    const minLoadTime = new Promise((resolve) => setTimeout(resolve, 500));
    const dataFetch = refetch();

    await Promise.all([minLoadTime, dataFetch]);
    
    setIsManualRefresh(false);
  };

  // 2. Determine if we should show the "Whole Tab" loader
  // We show it on Initial Load OR when the user manually refreshes.
  // We do NOT show it on background (60s) refetches.
  const showLoader = isLoading || isManualRefresh;

  if (showLoader) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  // --- DATA PROCESSING ---
  const safeHoldings = holdingsData ?? [];
  const stats = safeHoldings.length > 0 ? calculatePortfolioStats(safeHoldings) : null;

  if (!stats || safeHoldings.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No holdings data available to calculate performance.</p>
            <Button onClick={handleRefresh} disabled={isRefetching}>
              Refresh Data
            </Button>
        </div>
    )
  }

  const isDailyPos = stats.dailyValueChange >= 0;
  const isTotalPos = stats.totalUnrealizedPL >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER / REFRESH */}
      <div className="flex justify-start">
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground pl-0 hover:pl-2 transition-all"
            onClick={handleRefresh}
            disabled={isRefetching || isManualRefresh}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh Data
        </Button>
      </div>

      {/* TOP ROW: KPI CARDS */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard 
          title="Total Value" 
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          value={`$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Real-time Value"
        />

        <StatsCard 
          title="Cost Basis" 
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          value={`$${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Total Invested"
        />
        
        <StatsCard 
          title="Day's Change" 
          icon={isDailyPos ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          value={`$${Math.abs(stats.dailyValueChange).toFixed(2)}`}
          valueColor={isDailyPos ? "text-green-500" : "text-red-500"}
          subValue={`${isDailyPos ? '+' : ''}${stats.dailyReturnPct.toFixed(2)}% vs Prev Close`}
        />

        <StatsCard 
          title="Total Unrealized P/L" 
          icon={isTotalPos ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          value={`$${Math.abs(stats.totalUnrealizedPL).toFixed(2)}`}
          valueColor={isTotalPos ? "text-green-500" : "text-red-500"}
          subValue={isTotalPos ? "Profit" : "Loss"}
        />

        <StatsCard 
          title="Total Return" 
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          value={`${stats.totalReturnPct.toFixed(2)}%`}
          valueColor={isTotalPos ? "text-green-500" : "text-red-500"}
          subValue="All-time Weighted"
        />
      </div>

      {/* MIDDLE ROW: CHARTS & MOVERS */}
      <div className="grid gap-4 md:grid-cols-7">
        
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Market value percentages of your holdings.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <AllocationChart data={stats.allocation} />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Daily Movers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MoversList title="Top Gainers" items={stats.topGainers} type="gainers" />
            <MoversList title="Top Losers" items={stats.topLosers} type="losers" />
            
            {safeHoldings.length <= 1 && (
                 <p className="text-xs text-muted-foreground italic text-center mt-4">Add more holdings to see comparative data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM ROW: TOP PERFORMERS */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
             <CardTitle>All-Time Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
             <TopPerformersList items={stats.topPerformers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Helper Components ---

function StatsCard({ title, icon, value, subValue, valueColor }: { title: string, icon: React.ReactNode, value: string, subValue: string, valueColor?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{subValue}</p>
      </CardContent>
    </Card>
  );
}