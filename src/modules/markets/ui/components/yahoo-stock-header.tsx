"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
    Ticker: string;
}

export const YahooStockHeader = ({ Ticker }: Props) => {
    // Step 1: Initialize tRPC client
    const trpc = useTRPC();

    // --- We will now have TWO useQuery hooks running in parallel ---

    // Query #1: Fetch the historical stock data (this is your existing query)
    const { 
        data: stockData, 
        isLoading: isPriceLoading, // Rename for clarity
        isError: isPriceError 
    } = useQuery(
        // IMPORTANT: Adjust this path to match your actual router setup.
        // It might be trpc.YahooFinanceRouter.fetchStockData.queryOptions
        trpc.YahooMarket.fetchStockData.queryOptions({
            ticker: Ticker,
            range: "5d",
            interval: "1d",
        })
    );

    // Query #2: Fetch the company name (this is the new query)
    const { 
        data: companyName, 
        isLoading: isNameLoading, // Rename for clarity
        isError: isNameError 
    } = useQuery(
        // Use the new endpoint you created
        trpc.YahooMarket.fetchCompanyName.queryOptions({
            ticker: Ticker,
        })
    );

    // Step 3: Get the latest data point from the stock data array
    const latestData = stockData && stockData.length > 0 ? stockData[stockData.length - 1] : undefined;
    
    // Step 4: Handle the COMBINED loading and error states
    // Show loader if EITHER query is still loading
    if (isPriceLoading || isNameLoading) {
        return (
            <div className="mb-6 animate-pulse">
                {/* Skeleton for Company Name */}
                <div className="h-7 w-1/2 bg-muted rounded-md mb-2" /> 
                <div className="flex items-end gap-4">
                    {/* Skeleton for Price */}
                    <div className="h-10 w-1/3 bg-muted rounded-md" /> 
                    {/* Skeleton for Change */}
                    <div className="h-8 w-1/2 bg-muted rounded-md" />
                </div>
            </div>
        );
    }

    // Don't render anything if EITHER query fails or we have no price data
    if (isPriceError || isNameError || !latestData) {
        return null; 
    }

    // Step 5: Render the JSX with ALL the data
    const isPositive = latestData.daily_change >= 0;
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    const changeSign = isPositive ? '+' : '';

    return (
        <div className="mb-6">
            {/* --- DISPLAY THE COMPANY NAME HERE --- */}
            <h1 className="text-2xl font-semibold text-muted-foreground">
                {companyName}
            </h1>

            {/* Price and change information */}
            <div className="flex items-baseline gap-4 mt-1">
                <h2 className="text-4xl font-bold">{latestData.close.toFixed(2)}</h2>
                <div className={`flex items-end gap-2 text-xl font-semibold ${changeColor}`}>
                    <span>
                        {changeSign}{latestData.daily_change.toFixed(2)}
                    </span>
                    <span>
                        ({changeSign}{latestData.percentage_change.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
};