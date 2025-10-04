// In: modules/market_data/ui/views/yahoo-stock-aggregation-view.tsx (This code is correct)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockHeader } from "../components/yahoo-stock-header";
import { CryptoStockHeader } from "../components/crypto-header";
import { StockChart } from "../components/yahoo-stock-graph";
import { StockSearchBar } from "../components/stock-search-bar";
import { PerformanceOverview } from "../components/yahoo-performance-overview";
import { CompareComponent } from "../components/yahoo-compare";
import { StockNews } from "../components/yahoo-stock-news";
import { CryptoStockChart } from "../components/crypto-graph";
import { AssetSelector, AssetCategory } from "../components/asset-selector";

// (Interface and constant array for rangeOptions)
interface RangeOption { label: string; range: string; interval: string; }
const rangeOptions: RangeOption[] = [ { label: "1D", range: "1d", interval: "1Min" }, { label: "5D", range: "5d", interval: "15Min" }, { label: "1M", range: "1mo", interval: "15Min" }, { label: "6M", range: "6mo", interval: "1D" }, { label: "YTD", range: "ytd", interval: "1D" }, { label: "1Y", range: "1y", interval: "1D" }, { label: "5Y", range: "5y", interval: "1W" }, { label: "All", range: "max", interval: "1M" }, ];

type YahooStockViewProps = {
    ticker?: string; 
};

const isCryptoTicker = (ticker = ''): boolean => ticker.includes('/');

export const YahooStockView = ({ ticker }: YahooStockViewProps) => {
    const router = useRouter();
    const [selectedAsset, setSelectedAsset] = useState<AssetCategory>("stocks");
    const [submittedTickerStock, setSubmittedTickerStock] = useState('AAPL');
    const [submittedTickerCrypto, setSubmittedTickerCrypto] = useState('BTC/USD');
    const [selectedRange, setSelectedRange] = useState<RangeOption>(rangeOptions[0]);
    
    useEffect(() => {
        // This logic is now correct because the `ticker` prop it receives
        // will be "BTC/USD", not "BTC%2FUSD".
        if (ticker) {
            if (isCryptoTicker(ticker)) {
                setSelectedAsset("crypto");
                setSubmittedTickerCrypto(ticker);
            } else {
                setSelectedAsset("stocks");
                setSubmittedTickerStock(ticker);
            }
        }
    }, [ticker]);

    const handleSelectAndNavigate = (newTicker: string) => {
        const encodedTicker = encodeURIComponent(newTicker);
        router.push(`/market-data/${encodedTicker}`);
    };

    return (
        <div className="w-full h-screen min-h-0 flex flex-col overflow-y-auto pb-16">
            <Card className="w-full bg-transparent">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
                        <AssetSelector 
                            value={selectedAsset}
                            onValueChange={setSelectedAsset}
                        />
                        
                        {(selectedAsset === 'stocks' || selectedAsset === 'crypto') && (
                             <div className="w-full md:w-2/3 lg:w-1/2 relative z-50">
                            <StockSearchBar 
                                onSelect={handleSelectAndNavigate} 
                                activeTab={selectedAsset}  />
                                </div>      
                        )}
                        
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
                            {rangeOptions.map((option) => (
                                <Button key={option.label} variant={selectedRange.label === option.label ? "secondary" : "ghost"} size="sm" onClick={() => setSelectedRange(option)}>
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    {selectedAsset === 'stocks' && (
                        <>
                            <div className="mt-8">
                                <StockHeader Ticker={submittedTickerStock} />
                                <StockChart Ticker={submittedTickerStock} Range={selectedRange.range} Interval={selectedRange.interval} />
                            </div>
                            <div className="mt-12"><PerformanceOverview Ticker={submittedTickerStock} /></div>
                            <div className="mt-12"><CompareComponent Ticker={submittedTickerStock} /></div>
                            <div className="mt-12"><StockNews Ticker={submittedTickerStock} /></div>
                        </>
                    )}

                    {selectedAsset === 'crypto' && (
                        <div className="mt-8">
                            <CryptoStockHeader Ticker={submittedTickerCrypto} />
                            <CryptoStockChart Ticker={submittedTickerCrypto} Range={selectedRange.range} Interval={selectedRange.interval} />
                            <div className="mt-12"><StockNews Ticker={submittedTickerCrypto} /></div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};