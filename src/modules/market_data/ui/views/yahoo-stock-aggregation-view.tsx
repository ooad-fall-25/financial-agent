    "use client";

    import { useState } from "react";
    import { Card, CardContent } from "@/components/ui/card";
    import { Button } from "@/components/ui/button"; 

    // --- 1. IMPORT ALL YOUR COMPONENTS ---
    import { StockHeader } from "../components/yahoo-stock-header";
    import { CryptoStockHeader } from "../components/crypto-header";  
    import { StockChart } from "../components/yahoo-stock-graph"; 
    import { StockSearchBar } from "../components/stock-search-bar"; 
    import { PerformanceOverview } from "../components/yahoo-performance-overview"; // <-- ADD THIS IMPORT
    import { CompareComponent } from "../components/yahoo-compare"; // <-- ADD THIS IMPORT
    import { StockNews } from "../components/yahoo-stock-news"; // <-- ADD THIS IMPORT
    import { CryptoStockChart } from "../components/crypto-graph"; // <-- ADD THIS IMPORT
    import { AssetSelector, AssetCategory } from "../components/asset-selector"; // <-- Import AssetSelector

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
        // --- 2. ADD STATE FOR THE ASSET SELECTOR ---
        const [selectedAsset, setSelectedAsset] = useState<AssetCategory>("stocks");

        const [submittedTickerStock, setSubmittedTickerStock] = useState(ticker || 'AAPL');
        const [submittedTickerCrypto, setSubmittedTickerCrypto] = useState('BTC/USD');
        const [selectedRange, setSelectedRange] = useState<RangeOption>(rangeOptions[0]);

        const handleStockSelectStock = (newTicker: string) => {
            setSubmittedTickerStock(newTicker.toUpperCase());
        };
        
         const handleStockSelectCrypto = (newTicker: string) => {
            setSubmittedTickerCrypto(newTicker.toUpperCase());
        };
        return (
            <div className="w-full h-screen min-h-0 flex flex-col overflow-y-auto pb-16">
                <Card className="w-full bg-transparent">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
                            
                            {/* 3. ADD THE ASSET SELECTOR TO THE UI */}
                            <AssetSelector 
                                defaultValue={selectedAsset}
                                onValueChange={setSelectedAsset}
                            />
                            
                            {/* Conditionally show the stock search bar only for the stocks view */}
                            {selectedAsset === 'stocks' && (
                                <div className="w-full md:w-2/3 lg:w-1/2 relative z-50">
                                    <StockSearchBar onSelect={handleStockSelectStock} />
                                </div>
                            )}

                            {selectedAsset === 'crypto' && (
                            <div className="w-full md:w-2/3 lg:w-1/2 relative z-50">
                                <StockSearchBar onSelect={handleStockSelectCrypto} />
                            </div>
                            )}
                            
                            {/* Conditionally show the range selector only for the stocks view */}
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
                        
                        {/* --- 4. CONDITIONALLY RENDER THE MAIN CONTENT --- */}
                        
                        {/* This block renders when "Stocks" is selected */}
                        {selectedAsset === 'stocks' && (
                            <>
                                <div className="mt-8">
                                    {submittedTickerStock  && <StockHeader Ticker={submittedTickerStock} />}
                                    {submittedTickerStock && (
                                        <StockChart 
                                            Ticker={submittedTickerStock} 
                                            Range={selectedRange.range}
                                            Interval={selectedRange.interval}
                                        />
                                    )}
                                </div>
                                <div className="mt-12">
                                    {submittedTickerStock && <PerformanceOverview Ticker={submittedTickerStock} />}
                                </div>
                                <div className="mt-12">
                                    {submittedTickerStock && <CompareComponent Ticker={submittedTickerStock} />}
                                </div>
                                <div className="mt-12">
                                    {submittedTickerStock && <StockNews Ticker={submittedTickerStock} />}
                                </div>
                            </>
                        )}

                        {/* This block renders when "Crypto" is selected */}


                        {selectedAsset === 'crypto' && (
                            <div className="mt-8">
                                {submittedTickerCrypto && <CryptoStockHeader Ticker={submittedTickerCrypto} />}
                                {submittedTickerCrypto && (
                                    <CryptoStockChart 
                                        Ticker={submittedTickerCrypto} 
                                        Range={selectedRange.range}
                                        Interval={selectedRange.interval}
                                    />
                                )}

                                <div className="mt-12">
                                    {submittedTickerCrypto && <StockNews Ticker={submittedTickerCrypto} />}
                                </div>

                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        );
    };