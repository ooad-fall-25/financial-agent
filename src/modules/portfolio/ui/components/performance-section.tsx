"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Skeleton } from "@/components/ui/skeleton";
import { calculatePortfolioStats } from "@/lib/portfolio-math";
import { AllocationChart, MoversList, TopPerformersList } from "./performance-cards";
import { DollarSign, TrendingUp, TrendingDown, Percent, RefreshCw, Wallet } from "lucide-react"; // Added Wallet icon
import { Button } from "@/components/ui/button";

export const PerformanceSection = () => {
  const trpc = useTRPC();
  
  const { data: holdingsData, isLoading, refetch, isRefetching } = useQuery({
    ...trpc.portfolio.getHoldings.queryOptions(),
    refetchInterval: 60000,
  });

  const safeHoldings = holdingsData ?? [];
  const stats = safeHoldings.length > 0 ? calculatePortfolioStats(safeHoldings) : null;

  if (isLoading) {
    return <PerformanceSkeleton />;
  }

  if (!stats || safeHoldings.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No holdings data available to calculate performance.</p>
            <Button onClick={() => refetch()}>Refresh Data</Button>
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
            className="text-muted-foreground"
            onClick={() => refetch()}
            disabled={isRefetching}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh Data
        </Button>
      </div>

      {/* TOP ROW: KPI CARDS (Now 5 Columns on Large Screens) */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard 
          title="Total Value" 
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          value={`$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Real-time Value"
        />

        {/* NEW CARD: Cost Basis */}
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
        
        {/* PIE CHART (4/7 width) */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            {/* ADDED DESCRIPTION */}
            <p className="text-sm text-muted-foreground">Market value percentages of your holdings.</p>
          </CardHeader>
          <CardContent className="pl-2">
            <AllocationChart data={stats.allocation} />
          </CardContent>
        </Card>

        {/* DAILY MOVERS (3/7 width) */}
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

function PerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
         {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
         <Skeleton className="md:col-span-4 h-[350px] rounded-xl" />
         <Skeleton className="md:col-span-3 h-[350px] rounded-xl" />
      </div>
    </div>
  )
}