import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState, useEffect } from 'react';
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueries } from "@tanstack/react-query";
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
        isLoading: isSymbolsLoading, 
        isError: isSymbolsError 
    } = useQuery({
        ...trpc.HomeData.fetchYahooTrendingTicker.queryOptions({}),
        refetchInterval: 60000,
    });
    
    const symbols: string[] = trendingSymbols?.body ?? [];
    const alpacaCompatibleTickers = symbols.filter(ticker => !ticker.includes('.') && !ticker.includes('-') && !ticker.includes('=') && !ticker.includes('^'));
    const symbolsFinal = alpacaCompatibleTickers.slice(0, 10) 


    const { 
        data: snapshotQueries, 
        isLoading: isSnapshotLoading, 
        isError: isSnapshotError 
    } = useQuery({
        ...trpc.HomeData.fetchMarketDataByTickers.queryOptions({tickers: symbolsFinal}),
        refetchOnReconnect: false,
    });

    const snapshotQueriesFinal = snapshotQueries ?? [];


    const {
        data: companyNameData,
        isLoading: isNameLoading,
        isError: isNameError,
    } = useQuery({
        ...trpc.HomeData.fetchCompanyNames.queryOptions({tickers: symbolsFinal}),
        refetchOnReconnect: false,
    });

    const companyNameDataFinal = companyNameData ?? []

        const cleanCompanyData: CleanCompanyInfo[] = companyNameDataFinal.map(company => {
        const companyName = typeof company.name === 'string'
            ? company.name 
            : company.name.companyName;

        return {
            ticker: company.ticker,
            name: companyName
        };
    });


    const activesData: TickerData[] = cleanCompanyData.map((company, index) => {

        const snapshot = snapshotQueriesFinal[index];
        const currentPrice = snapshot.dailyBar.c;
        const previousClose = snapshot.prevDailyBar.c;
        const change = currentPrice - previousClose;
        const percentChange = previousClose !== 0 ? (change / previousClose) * 100 : 0;
        
        
        const combinedObject: TickerData = {
            symbol: company.ticker,
            companyName: company.name,
            price: currentPrice,
            change: change,
            percentChange: percentChange,
        };
    
    return combinedObject;
});


    const portfolioData: TickerData[] = [
        { symbol: 'GOOGL', companyName: 'Alphabet Inc.', price: 179.22, change: 1.88, percentChange: 1.06 },
        { symbol: 'MSFT', companyName: 'Microsoft Corporation', price: 447.67, change: -2.11, percentChange: -0.47 },
        { symbol: 'KEVIN', companyName: 'Kevin Borgar Shop', price: 420.69, change: -9.11, percentChange: -0.47 },
        { symbol: 'BOB', companyName: 'Bobbington', price: 420.69, change: -9.11, percentChange: -0.47 },
    ];

    if (isNameLoading || isSnapshotLoading || isSymbolsLoading) {
        return (
            <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (isNameError || isSnapshotError || isSymbolsError) {
        return (
            <div className="p-6 text-center text-red-500 bg-card rounded-lg border">
                <p>Failed to load ticker data.</p>
            </div>
        );
    }
  
    if (!activesData || activesData.length === 0) {
        return (
            <div className="p-6 text-center text-muted-foreground bg-card rounded-lg border">
                <p>No trending data available.</p>
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
                    <div className="space-y-2">
                        {activesData.map((item) => (
                            <AnimatedTickerItem key={item.symbol} item={item} />
                        ))}
                    </div>
                </CardContent>
            </Card>
      
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">My Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {portfolioData.map((item) => (
                            <AnimatedTickerItem key={item.symbol} item={item} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}