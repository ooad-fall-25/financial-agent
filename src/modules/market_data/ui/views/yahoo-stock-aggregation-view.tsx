"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 

// --- 1. IMPORT ALL YOUR COMPONENTS ---
import { StockHeader } from "../components/yahoo-stock-header"; 
import { StockChart } from "../components/yahoo-stock-graph"; 
import { StockSearchBar } from "../components/stock-search-bar"; 
import { PerformanceOverview } from "../components/yahoo-performance-overview"; // <-- ADD THIS IMPORT
import { CompareComponent } from "../components/yahoo-compare"; // <-- ADD THIS IMPORT
import { StockNews } from "../components/yahoo-stock-news"; // <-- ADD THIS IMPORT
interface RangeOption {
    label: string;
    range: string;
    interval: string;
}

const rangeOptions: RangeOption[] = [
    { label: "1D", range: "1d", interval: "1Min" },
    { label: "5D", range: "5d", interval: "15Min" },
    { label: "1M", range: "1mo", interval: "15Min" },
    { label: "6M", range: "6mo", interval: "1D" },
    { label: "YTD", range: "ytd", interval: "1D" },
    { label: "1Y", range: "1y", interval: "1D" },
    { label: "5Y", range: "5y", interval: "1W" },
    { label: "All", range: "max", interval: "1M" },
];

type YahooStockViewProps = {
    ticker?: string; 
};

export const YahooStockView = ({ ticker }: YahooStockViewProps) => {
    const [submittedTicker, setSubmittedTicker] = useState(ticker || 'AAPL');
    const [selectedRange, setSelectedRange] = useState<RangeOption>(rangeOptions[0]);

    const handleStockSelect = (newTicker: string) => {
        setSubmittedTicker(newTicker.toUpperCase());
    };

    return (
        <div className="w-full h-screen min-h-0 flex flex-col overflow-y-auto pb-16">
            <Card className="w-full bg-transparent">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
                         <div className="w-full md:w-2/3 lg:w-1/2 relative z-50">
                                    <StockSearchBar onSelect={handleStockSelect} />
                        </div>
                        
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
                           {rangeOptions.map((option) => (
                                <Button
                                    key={option.label}
                                    variant={selectedRange.label === option.label ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedRange(option)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        {submittedTicker && <StockHeader Ticker={submittedTicker} />}
                        
                        {submittedTicker && (
                            <StockChart 
                                Ticker={submittedTicker} 
                                Range={selectedRange.range}
                                Interval={selectedRange.interval}
                            />
                        )}
                    </div>

                    {/* --- 2. ADD THE PERFORMANCEOVERVIEW COMPONENT HERE --- */}
                    <div className="mt-12">
                        {submittedTicker && <PerformanceOverview Ticker={submittedTicker} />}
                    </div>

                    <div className="mt-12">
                        {submittedTicker && <CompareComponent Ticker={submittedTicker} />}
                    </div>

                    <div className="mt-12">
                        {submittedTicker && <StockNews Ticker={submittedTicker} />}
                    </div>


                </CardContent>
            </Card>
        </div>
    );
};