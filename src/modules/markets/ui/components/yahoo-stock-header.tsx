"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePrevious } from "@/lib/use-previous"; // Import the custom hook

interface Props {
    Ticker: string;
}

export const YahooStockHeader = ({ Ticker }: Props) => {
    const trpc = useTRPC();

    // State to hold the CSS class for the highlight animation
    const [priceChangeEffect, setPriceChangeEffect] = useState('');

    // Query #1: Fetch the historical stock data with a refetch interval
    const { 
        data: stockData, 
        isLoading: isPriceLoading,
        isError: isPriceError 
    } = useQuery({
        ...trpc.YahooMarket.fetchStockData.queryOptions({
            ticker: Ticker,
            range: "5d",
            interval: "1d",
        }),
        // Refetch data every 30 seconds. Adjust as needed.
        refetchInterval: 500, 
    });

    // Query #2: Fetch the company name
    const { 
        data: companyName, 
        isLoading: isNameLoading,
        isError: isNameError 
    } = useQuery(
        trpc.YahooMarket.fetchCompanyName.queryOptions({
            ticker: Ticker,
        })
    );

    // Get the most recent data point from the array
    const latestData = stockData && stockData.length > 0 ? stockData[stockData.length - 1] : undefined;
    
    // Get the previous closing price using our custom hook
    const prevClose = usePrevious(latestData?.close);

    // This effect runs when the price changes to trigger the animation
    useEffect(() => {
        // Ensure we have both a previous and a current price to compare
        if (prevClose !== undefined && latestData?.close !== undefined) {
            if (latestData.close > prevClose) {
                setPriceChangeEffect('highlight-green'); // Price went up
            } else if (latestData.close < prevClose) {
                setPriceChangeEffect('highlight-red'); // Price went down
            }
            
            // Remove the class after the animation finishes (1000ms)
            // This allows the animation to re-trigger on the next price change
            const timer = setTimeout(() => setPriceChangeEffect(''), 1000);
            return () => clearTimeout(timer);
        }
    }, [latestData?.close, prevClose]); // Dependency array ensures this runs only when the price changes

    // Handle the combined loading and error states
    if (isPriceLoading || isNameLoading) {
        return (
            <div className="mb-6 animate-pulse">
                <div className="h-7 w-1/2 bg-muted rounded-md mb-2" /> 
                <div className="flex items-end gap-4">
                    <div className="h-10 w-1/3 bg-muted rounded-md" /> 
                    <div className="h-8 w-1/2 bg-muted rounded-md" />
                </div>
            </div>
        );
    }

    if (isPriceError || isNameError || !latestData) {
        return null; 
    }

    // Determine colors and signs based on daily change
    const isPositive = latestData.daily_change >= 0;
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    const changeSign = isPositive ? '+' : '';

    return (
        <div className="mb-6">
            <h1 className="text-2xl font-semibold text-muted-foreground">
                {companyName}
            </h1>

            <div className="flex items-baseline gap-4 mt-1">
                <h2 className="text-4xl font-bold">
                    {/* The `inline-block` class is key to making the highlight wrap the content perfectly */}
                    <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${priceChangeEffect}`}>
                        {latestData.close.toFixed(2)}
                    </span>
                </h2>

                <div className={`flex items-end gap-2 text-xl font-semibold ${changeColor}`}>
                    <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${priceChangeEffect}`}>
                        {changeSign}{latestData.daily_change.toFixed(2)}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${priceChangeEffect}`}>
                        ({changeSign}{latestData.percentage_change.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
};