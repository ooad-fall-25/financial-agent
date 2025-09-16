"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { YahooStockTable } from "../components/yahoo-stock-graph"; // Adjust this path to where your component is located

export const YahooStockView = () => {
    // State to hold the value of the input field
    const [tickerInput, setTickerInput] = useState("BTC-USD");
    
    // State to hold the ticker that has been submitted for fetching
    // This prevents fetching data on every keystroke
    const [submittedTicker, setSubmittedTicker] = useState("BTC-USD");

    // This function runs when the form is submitted
    const handleSearch = (event: React.FormEvent) => {
        // Prevent the page from reloading on form submission
        event.preventDefault();
        // Set the submitted ticker to trigger a re-fetch in the table component
        setSubmittedTicker(tickerInput);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Yahoo Stock Data</CardTitle>
                    <CardDescription>
                        Enter a stock ticker (e.g., AAPL, GOOGL, TSLA) to view its recent performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Form to handle user input and submission */}
                    <form onSubmit={handleSearch} className="flex items-end gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="ticker">Stock Ticker</Label>
                            <Input
                                id="ticker"
                                type="text"
                                placeholder="e.g., AAPL"
                                value={tickerInput}
                                // Update the input state on every change, and convert to uppercase
                                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>

                    {/* --- Display the Table --- */}
                    {/* This section will only render the table if a ticker has been submitted */}
                    <div className="mt-8">
                        {submittedTicker && (
                            <YahooStockTable Ticker={submittedTicker} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};