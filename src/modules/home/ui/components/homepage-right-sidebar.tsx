import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState, useEffect } from 'react';
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrevious } from '@/lib/use-previous';
import Link from 'next/link'; 

interface TickerData {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    percentChange: number;
}

interface CleanCompanyInfo {
    ticker: string;
    name: string;
}

interface AlpacaSnapshot {
  latestTrade: { p: number; t: string };
  dailyBar: { o: number; h: number; l: number; c: number; v: number };
  prevDailyBar: { o: number; h: number; l: number; c: number; v: number };
}

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
    const trendingSymbolsFinal = trendingSymbolsRaw.filter(ticker => !ticker.includes('.') && !ticker.includes('-') && !ticker.includes('=') && !ticker.includes('^')).slice(0, 10);
    
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
        <div className="space-y-8">
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
      
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">My Portfolio</CardTitle>
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
        </div>
    );
}