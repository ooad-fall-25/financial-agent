"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// --- IMPORTANT: We only import the components themselves ---
import { YahooStockHeader } from "../components/yahoo-stock-header";
import { YahooStockChart } from "../components/yahoo-stock-graph";
import { YahooPerformanceOverview } from "../components/yahoo-performance-overview"; // Make sure this is imported
import { YahooCompare } from "../components/yahoo-compare"; 
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
    const [tickerInput, setTickerInput] = useState("AAPL");
    const [submittedTicker, setSubmittedTicker] = useState("AAPL");
    const [selectedRange, setSelectedRange] = useState<RangeOption>(rangeOptions[2]);

    // --- CRITICAL FIX ---
    // There should be NO useQuery or useTRPC hooks in this file.
    // All data fetching is handled by the child components.

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmittedTicker(tickerInput.toUpperCase());
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <Card className="w-full">
                <CardHeader>
                    {/* This can be simple, as the header component will show the name */}
                    <CardTitle>
                        Stock Analysis
                    </CardTitle>
                    <CardDescription>
                        Enter a stock ticker to view its performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and range buttons section (no changes needed) */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <form onSubmit={handleSearch} className="flex items-end gap-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="ticker">Stock Ticker</Label>
                                <Input
                                    id="ticker"
                                    type="text"
                                    placeholder="e.g., AAPL"
                                    value={tickerInput}
                                    onChange={(e) => setTickerInput(e.target.value)}
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

                    {/* Header and Chart section */}
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

                    {/* Performance Overview section */}
                    <div className="mt-12">
                        {submittedTicker && <YahooPerformanceOverview Ticker={submittedTicker} />}
                    </div>
                    
                    <div className="mt-12">
                        {submittedTicker && <YahooCompare Ticker={submittedTicker} />}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};