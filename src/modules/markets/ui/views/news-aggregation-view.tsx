"use client";

import { useState } from "react";
import { MarketNewsTable } from "../components/market-news-table"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button";
import { Search, StarsIcon } from "lucide-react";
import { AskAINewsSheet } from "../components/ask-ai-news-sheet";
import { Input } from "@/components/ui/input"; 

interface ItemType {
    type: string;
    name: string;
}

const finnhubItems = [
    {
        type: "general",
        name: "Top"
    },
    {
        type: "crypto",
        name: "Crypto"
    },
    {
        type: "merger",
        name: "Merger"
    },
    {
        type: "company", // New section for company news
        name: "Company"
    }
]

const polygonItems = [
    {
        type: "stock",
        name: "Stock"
    },
    {
        type: "company", // New section for company news
        name: "Company"
    }
]
export const NewsAggregationView = () => {
    const [provider, setProvider] = useState<string | null>(null);
    const [categoryMarketItems, setCategoryMarketItems] = useState<ItemType[]>(finnhubItems);
    const [activeTab, setActiveTab] = useState<string>(finnhubItems[0].type);
    const [isSheetOpen, setIsSheetOpen] = useState(false); 
    const [tickerSearchInput, setTickerSearchInput] = useState(""); // State for search bar input
    const [searchedTicker, setSearchedTicker] = useState(""); // State for the actual ticker to search

    const handleSetProvider = (value: string) => {
        setTickerSearchInput(""); // Clear search input when provider changes
        setSearchedTicker(""); // Clear searched ticker
        if (value === "polygon") {
            setCategoryMarketItems(polygonItems);
            setActiveTab(polygonItems[0].type);
        } else {
            setCategoryMarketItems(finnhubItems);
            setActiveTab(finnhubItems[0].type);
        }
        setProvider(value);
    }   

    const handleTickerSearch = () => {
        setSearchedTicker(tickerSearchInput.toUpperCase()); // Set the ticker to search, usually uppercase
    };

    return (
        <div className="h-screen max-w-8xl mx-auto flex flex-col w-full">
            <AskAINewsSheet isOpen={isSheetOpen} setIsOpen={setIsSheetOpen}/>
            {/* Fixed Header with Tabs */}
            <div className="flex-shrink-0 bg-background sticky top-0 z-20">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between p-4 border-b border-border border-dashed">
                        <div className="flex items-center gap-x-4"> {/* Group TabsList and potential search bar */}

                            <TabsList className="bg-secondary">
                                {categoryMarketItems.map((item) => (
                                    <TabsTrigger className="max-w-32 w-24" key={item.type} value={item.type}>{item.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {activeTab === "company" && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter ticker (e.g., AAPL)"
                                        value={tickerSearchInput}
                                        onChange={(e) => setTickerSearchInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleTickerSearch();
                                            }
                                        }}
                                        className="w-[200px]"
                                    />
                                    <Button onClick={handleTickerSearch} size="icon" variant="secondary">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                        </div>

                        <div className="flex gap-x-4">
                            <Select onValueChange={(value) => handleSetProvider(value)} defaultValue="finnhub">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Providers</SelectLabel>
                                        <SelectItem value="finnhub" className="cursor-pointer" >FinnHub</SelectItem>
                                        <SelectItem value="polygon" className="cursor-pointer">Polygon</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Button
                                    variant="outline"
                                    className="!border-none !shadow-none transition-all duration-300 group relative overflow-hidden"
                                    onClick={() => setIsSheetOpen(true)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
                                    <StarsIcon className="h-4 w-4 text-gray-600 group-hover:text-white relative z-10 transition-colors duration-300" />
                                    Ask AI
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Content Area with fixed height */}
                    <div className="mt-4 px-6" style={{ height: 'calc(100vh - 180px)' }}>
                        {categoryMarketItems.map((item) => (
                            <TabsContent key={item.type} value={item.type} className="h-full overflow-y-auto">
                                <div className="bg-background rounded-lg border-none shadow-none">
                                    {/* Fixed Title Section */}
                                    <div className="sticky top-0 z-10 bg-background border-b border-border">
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-foreground">
                                                {item.name} Market News {item.type === "company" && searchedTicker && `for ${searchedTicker}`}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {item.type === "company"
                                                    ? "Latest news and updates for the specified company."
                                                    : "Latest news and updates from the market"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <MarketNewsTable 
                                        marketCategory={item.type} 
                                        provider={provider || ""} 
                                        ticker={item.type === "company" ? searchedTicker : undefined} // Pass ticker if "company" tab
                                    />
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}