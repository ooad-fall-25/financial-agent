import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState, useEffect } from 'react';
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { usePrevious } from '@/lib/use-previous';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { calculatePortfolioStats } from "@/lib/portfolio-math";
import Link from 'next/link'; 

interface TickerData {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    percentChange: number;
}

interface AlpacaSnapshot {
  latestTrade: { p: number; t: string };
  dailyBar: { o: number; h: number; l: number; c: number; v: number };
  prevDailyBar: { o: number; h: number; l: number; c: number; v: number };
}

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", 
  "#14b8a6", "#d946ef", "#eab308", "#64748b", "#a855f7", 
  "#fb7185", "#22c55e", "#0ea5e9", "#f43f5e", "#a3a3a3"
];

const AnimatedTickerItem = ({ item }: { item: TickerData }) => {
    const [highlightClass, setHighlightClass] = useState('');
    const prevPrice = usePrevious(item.price);

    useEffect(() => {
        if (prevPrice !== undefined && item.price !== prevPrice) {
            setHighlightClass(item.price > prevPrice ? 'highlight-green' : 'highlight-red');
        }

        if (highlightClass) {
            const timer = setTimeout(() => setHighlightClass(''), 1000);
            return () => clearTimeout(timer);
        }
    }, [item.price, prevPrice, highlightClass]);

    return (
        <Link href={`/market-data/${item.symbol}`} className="block">
            <div
                className={`flex justify-between items-center border-b pb-3 last:border-b-0 rounded-md p-2 
                           transition-all duration-300 ease-in-out cursor-pointer 
                           hover:scale-[1.03] hover:shadow-lg hover:bg-muted/50 
                           ${highlightClass}`}
            >
                <div>
                    <div className="font-bold">{item.symbol}</div>
                    <div className="text-xs text-muted-foreground">{item.companyName}</div>
                </div>
                <div className="text-right">
                    <div className="font-semibold">${item.price.toFixed(2)}</div>
                    <div className={`text-xs ${item.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {item.percentChange > 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                    </div>
                </div>
            </div>
        </Link>
    );
};

const PortfolioOverview = () => {
    const trpc = useTRPC();

    const { data: holdingsData, isLoading: isHoldingsLoading } = useQuery({
        ...trpc.portfolio.getHoldings.queryOptions(),
        refetchInterval: 10000,
    });

    if (isHoldingsLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Portfolio Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    const safeHoldings = holdingsData ?? [];
    const stats = safeHoldings.length > 0 ? calculatePortfolioStats(safeHoldings) : null;

    if (!stats || safeHoldings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">My Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm">No holdings data available</p>
                        <Link href="/portfolio?tab=holdings" className="text-primary text-sm hover:underline mt-2 inline-block">
                            Add holdings to get started
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isDailyPos = stats.dailyValueChange >= 0;
    const isTotalPos = stats.totalUnrealizedPL >= 0;
    const totalValue = stats.allocation.reduce((sum, item) => sum + item.value, 0);
    const sortedAllocation = [...stats.allocation].sort((a, b) => b.value - a.value);

    return (
        <Card>
            <CardHeader>
                <Link href="/portfolio?tab=performance" className="block hover:opacity-80 transition-opacity">
                    <CardTitle className="text-2xl font-bold text-center">My Holdings</CardTitle>
                </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="space-y-3">
                    {/* Total Value */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Total Value</span>
                        </div>
                        <span className="text-lg font-bold">
                            ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Day's Change & Total P/L - Side by Side Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Day's Change - Centered */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                {isDailyPos ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-xs font-medium text-muted-foreground">Today</span>
                            </div>
                            <div className="text-center">
                                <div className={`text-sm font-bold ${isDailyPos ? 'text-green-500' : 'text-red-500'}`}>
                                    ${Math.abs(stats.dailyValueChange).toFixed(2)}
                                </div>
                                <div className={`text-[10px] ${isDailyPos ? 'text-green-500' : 'text-red-500'}`}>
                                    {isDailyPos ? '+' : ''}{stats.dailyReturnPct.toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        {/* Total Unrealized P/L - Centered */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                {isTotalPos ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-xs font-medium text-muted-foreground">P/L</span>
                            </div>
                            <div className="text-center">
                                <div className={`text-sm font-bold ${isTotalPos ? 'text-green-500' : 'text-red-500'}`}>
                                    ${Math.abs(stats.totalUnrealizedPL).toFixed(2)}
                                </div>
                                <div className={`text-[10px] ${isTotalPos ? 'text-green-500' : 'text-red-500'}`}>
                                    {stats.totalReturnPct.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allocation Chart */}
                <div className="pt-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Allocation</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={sortedAllocation}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {sortedAllocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                formatter={(value: number) => {
                                    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
                                    return [
                                        `$${value.toFixed(2)} (${percent.toFixed(1)}%)`, 
                                        "Value"
                                    ];
                                }}
                                contentStyle={{ 
                                    backgroundColor: "#1f2937", 
                                    borderColor: "#374151", 
                                    borderRadius: "8px" 
                                }}
                                itemStyle={{ color: "#f9fafb" }} 
                                labelStyle={{ color: "#e5e7eb", fontWeight: "bold" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend - Responsive 2 Columns */}
                    <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-2">
                        {sortedAllocation.slice(0, 6).map((item, index) => {
                            const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                            // Logic: Show first 3 always. Show next 3 only on XL screens (2-col mode).
                            const visibilityClass = index < 3 ? "flex" : "hidden xl:flex";
                            
                            return (
                                <div key={item.name} className={`${visibilityClass} items-center justify-between text-xs p-1 rounded hover:bg-muted/50 transition-colors w-full`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div 
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="font-medium truncate">{item.name}</span>
                                    </div>
                                    <span className="text-muted-foreground flex-shrink-0 ml-2">{percent.toFixed(1)}%</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* "More" text for Mobile/1-col view (shows if > 3 items) */}
                    {sortedAllocation.length > 3 && (
                        <div className="text-xs text-muted-foreground italic text-center pt-1 block xl:hidden">
                            + {sortedAllocation.length - 3} more
                        </div>
                    )}

                    {/* "More" text for Desktop/2-col view (shows if > 6 items) */}
                    {sortedAllocation.length > 6 && (
                        <div className="text-xs text-muted-foreground italic text-center pt-1 hidden xl:block">
                            + {sortedAllocation.length - 6} more
                        </div>
                    )}
                </div>

                {/* View Full Details Link */}
                <Link 
                    href="/portfolio?tab=performance" 
                    className="block text-center text-sm text-primary hover:underline pt-2"
                >
                    View Full Performance →
                </Link>
            </CardContent>
        </Card>
    );
};

export function RightSidebar() {
    const trpc = useTRPC();

    const { 
        data: trendingSymbols, 
        isLoading: isTrendingLoading, 
    } = useQuery({
        ...trpc.HomeData.fetchYahooTrendingTicker.queryOptions({}),
        refetchInterval: 15000,
    });
    
    const { 
        data: userWatchlist, 
        isLoading: isWatchlistLoading,
    } = useQuery({
        ...trpc.HomeData.getUserWatchlist.queryOptions(),
        refetchOnWindowFocus: false,
    });

    const trendingSymbolsRaw: string[] = trendingSymbols?.body ?? [];
    const trendingSymbolsFinal = trendingSymbolsRaw.filter(ticker => !ticker.includes('.') && !ticker.includes('-') && !ticker.includes('=') && !ticker.includes('^')).slice(0, 5);
    
    const watchlistSymbols = userWatchlist?.map(item => item.symbol) ?? [];
    const watchlistSymbolsFinal = watchlistSymbols.filter(ticker => !ticker.includes('.') && !ticker.includes('-') && !ticker.includes('=') && !ticker.includes('^'));

    // Combine into a single list of unique symbols to make one API call
    const allUniqueSymbols = Array.from(new Set([...trendingSymbolsFinal, ...watchlistSymbolsFinal]));

    const { 
        data: snapshotData, 
        isLoading: isSnapshotLoading, 
        isError: isSnapshotError 
    } = useQuery({
        ...trpc.HomeData.fetchMarketDataByTickers.queryOptions({tickers: allUniqueSymbols}),
        enabled: allUniqueSymbols.length > 0, 
        refetchOnReconnect: false,
    });

    const {
        data: companyNameData,
        isLoading: isNameLoading,
        isError: isNameError,
    } = useQuery({
        ...trpc.HomeData.fetchCompanyNames.queryOptions({tickers: allUniqueSymbols}),
        enabled: allUniqueSymbols.length > 0, 
        refetchOnReconnect: false,
    });
    
    const companyNameMap = new Map<string, string>();
    companyNameData?.forEach(company => {
        const name = typeof company.name === 'string' ? company.name : company.name.companyName;
        companyNameMap.set(company.ticker, name);
    });

    const snapshotMap = new Map<string, AlpacaSnapshot>();
    snapshotData?.forEach((snapshot, index) => {
        const symbol = allUniqueSymbols[index];
        if (symbol) {
            snapshotMap.set(symbol, snapshot);
        }
    });
    
    const buildTickerData = (symbol: string): TickerData | null => {
        const companyName = companyNameMap.get(symbol);
        const snapshot = snapshotMap.get(symbol);

        if (!companyName || !snapshot || !snapshot.dailyBar || !snapshot.prevDailyBar) {
            return null; 
        }
        
        const currentPrice = snapshot.dailyBar.c;
        const previousClose = snapshot.prevDailyBar.c;
        const change = currentPrice - previousClose;
        const percentChange = previousClose !== 0 ? (change / previousClose) * 100 : 0;
        
        return {
            symbol: symbol,
            companyName: companyName,
            price: currentPrice,
            change: change,
            percentChange: percentChange,
        };
    };

    const activesData: TickerData[] = trendingSymbolsFinal.map(buildTickerData).filter((item): item is TickerData => item !== null);
    const portfolioData: TickerData[] = watchlistSymbolsFinal.map(buildTickerData).filter((item): item is TickerData => item !== null);

    const isLoading = isTrendingLoading || isWatchlistLoading || (allUniqueSymbols.length > 0 && (isSnapshotLoading || isNameLoading));
    const isError = isSnapshotError || isNameError;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 text-center text-red-500 bg-card rounded-lg border">
                <p>Failed to load market data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            <PortfolioOverview />    

            <Card>
                <CardHeader>
                    <Link href="/portfolio?tab=watchlist" className="block hover:opacity-80 transition-opacity">
                        <CardTitle className="text-2xl font-bold text-center">My Watchlist</CardTitle>
                    </Link>    
                </CardHeader>
                <CardContent>
                    {portfolioData.length > 0 ? (
                        <div className="space-y-2">
                            {portfolioData.map((item) => (
                                <AnimatedTickerItem key={item.symbol} item={item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">Your watchlist is empty.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Trending Tickers</CardTitle>
                </CardHeader>
                <CardContent>
                    {activesData.length > 0 ? (
                        <div className="space-y-2">
                            {activesData.map((item) => (
                                <AnimatedTickerItem key={item.symbol} item={item} />
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-muted-foreground">No trending data available.</p>
                    )} 
                </CardContent>
            </Card> 
        </div>
    );
}