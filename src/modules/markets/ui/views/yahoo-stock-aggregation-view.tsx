"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 

// Component Imports
import { YahooStockHeader } from "../components/yahoo-stock-header";
import { YahooStockChart } from "../components/yahoo-stock-graph";
import { YahooPerformanceOverview } from "../components/yahoo-performance-overview";
import { YahooCompare } from "../components/yahoo-compare";
import { YahooStockNews } from "../components/yahoo-stock-news";
import { YahooSymbolSearch } from "../components/yahoo-symbol-search"; 

interface RangeOption {
    label: string;
    range: string;
    interval: string;
}

const rangeOptions: RangeOption[] = [
    { label: "1D", range: "1d", interval: "5m" },
    { label: "5D", range: "5d", interval: "15m" },
    { label: "1M", range: "1mo", interval: "1h" },
    { label: "6M", range: "6mo", interval: "1d" },
    { label: "YTD", range: "ytd", interval: "1d" },
    { label: "1Y", range: "1y", interval: "1d" },
    { label: "5Y", range: "5y", interval: "1wk" },
    { label: "All", range: "max", interval: "1mo" },
];

export const YahooStockView = () => {
    const [searchInput, setSearchInput] = useState("AAPL");
    const [submittedTicker, setSubmittedTicker] = useState("AAPL");
    const [selectedRange, setSelectedRange] = useState<RangeOption>(rangeOptions[2]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (searchInput) {
            setSubmittedTicker(searchInput.toUpperCase());
            // Clear the search results dropdown after searching
            setSearchInput(""); 
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Stock Analysis</CardTitle>
                    <CardDescription>Enter a stock ticker to view its performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <form onSubmit={handleSearch} className="flex items-end gap-4">
                            <div className="grid w-full max-w-lg items-center gap-1.5">
                                <label htmlFor="ticker-search" className="text-sm font-medium">Stock Ticker</label>
                                <YahooSymbolSearch
                                    value={searchInput}
                                    onChange={setSearchInput}
                                    onSelect={(ticker) => {
                                        setSearchInput(ticker);
                                        setSubmittedTicker(ticker);
                                    }}
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>
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
                        {submittedTicker && <YahooStockHeader Ticker={submittedTicker} />}
                        {submittedTicker && (
                            <YahooStockChart 
                                Ticker={submittedTicker} 
                                Range={selectedRange.range}
                                Interval={selectedRange.interval}
                            />
                        )}
                    </div>
                    <div className="mt-12">
                        {submittedTicker && <YahooPerformanceOverview Ticker={submittedTicker} />}
                    </div>
                    <div className="mt-12">
                        {submittedTicker && <YahooCompare Ticker={submittedTicker} />}
                    </div>
                    <div className="mt-12">
                        {submittedTicker && (<YahooStockNews Ticker={submittedTicker} />)}
                    </div>      
                </CardContent>
            </Card>
        </div>
    );
};