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
import Link from 'next/link'; 

interface TickerData {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    percentChange: number;
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
        data: activesData, 
        isLoading, 
        isError 
    } = useQuery({
        ...trpc.HomeData.fetchMarketScreener.queryOptions({ screenerType: 'most_actives' }),
        refetchInterval: 60000,
    });

    const portfolioData: TickerData[] = [
        { symbol: 'GOOGL', companyName: 'Alphabet Inc.', price: 179.22, change: 1.88, percentChange: 1.06 },
        { symbol: 'MSFT', companyName: 'Microsoft Corporation', price: 447.67, change: -2.11, percentChange: -0.47 },
        { symbol: 'KEVIN', companyName: 'Kevin Borgar Shop', price: 420.69, change: -9.11, percentChange: -0.47 },
        { symbol: 'BOB', companyName: 'Bobbington', price: 420.69, change: -9.11, percentChange: -0.47 },


    ];

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
                <p>Failed to load data.</p>
            </div>
        );
    }
  
    if (!activesData || activesData.length === 0) {
        return (
            <div className="p-6 text-center text-muted-foreground bg-card rounded-lg border">
                <p>No data available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Trending Tickers Card */}
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
      
            {/* My Portfolio Card */}
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