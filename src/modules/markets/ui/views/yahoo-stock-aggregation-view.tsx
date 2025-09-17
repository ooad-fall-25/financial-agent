"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { YahooStockTable } from "../components/yahoo-stock-graph"; // Adjust path

// Define the structure for our range options
interface RangeOption {
    label: string;
    range: string;
    interval: string;
}

// Define the available range options
const rangeOptions: RangeOption[] = [
    { label: "1D", range: "1d", interval: "1m" },
    { label: "5D", range: "5d", interval: "15m" },
    { label: "1M", range: "1mo", interval: "1d" },
    { label: "6M", range: "6mo", interval: "1d" },
    { label: "YTD", range: "ytd", interval: "1d" },
    { label: "1Y", range: "1y", interval: "1d" },
    { label: "5Y", range: "5y", interval: "1wk" },
    { label: "All", range: "max", interval: "1mo" },
];

export const YahooStockView = () => {
    const [tickerInput, setTickerInput] = useState("BTC-USD");
    const [submittedTicker, setSubmittedTicker] = useState("BTC-USD");
    
    // --- NEW STATE for the selected range option ---
    const [selectedRange, setSelectedRange] = useState<RangeOption>(rangeOptions[2]); // Default to 1M

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmittedTicker(tickerInput);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Yahoo Stock Data</CardTitle>
                    <CardDescription>
                        Enter a stock ticker to view its recent performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="flex items-end gap-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="ticker">Stock Ticker</Label>
                                <Input
                                    id="ticker"
                                    type="text"
                                    placeholder="e.g., AAPL"
                                    value={tickerInput}
                                    onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>

                        {/* --- NEW: Range Selector Buttons --- */}
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

                    {/* --- Display the Table --- */}
                    <div className="mt-8">
                        {submittedTicker && (
                            <YahooStockTable 
                                Ticker={submittedTicker} 
                                // Pass the selected range and interval to the table
                                Range={selectedRange.range}
                                Interval={selectedRange.interval}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};