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
        type: "forex",
        name: "Forex"
    },
    {
        type: "crypto",
        name: "Crypto"
    },
    {
        type: "merger",
        name: "Merger"
    }
]

const polygonItems = [
    {
        type: "stock", 
        name: "Stock"
    }
]
export const NewsAggregationView = () => {
    const [provider, setProvider] = useState<string | null>(null);
    const [categoryMarketItems, setCategoryMarketItems] = useState<ItemType[]>(finnhubItems); 
    const [activeTab, setActiveTab] = useState<string>(finnhubItems[0].type); 

    const handleSetProvider = (value: string) => {
        if (value === "finnhub") {
            setCategoryMarketItems(finnhubItems);
            setActiveTab(finnhubItems[0].type);
        } else if (value === "polygon") {
            setCategoryMarketItems(polygonItems); 
            setActiveTab(polygonItems[0].type); 
        } else {
            setCategoryMarketItems(finnhubItems);
            setActiveTab(finnhubItems[0].type);
        }
        setProvider(value);
    }

    return (
        <div className="h-screen max-w-7xl mx-auto flex flex-col w-full">
            {/* Fixed Header with Tabs */}
            <div className="flex-shrink-0 bg-background border-none  pt-6 pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between px-6 border-b border-border border-dashed pb-6">

                        <TabsList className="">
                            {categoryMarketItems.map((item) => (
                                <TabsTrigger className="max-w-32 w-24" key={item.type} value={item.type}>{item.name}</TabsTrigger>
                            ))}
                        </TabsList>

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
                    </div>

                    {/* Scrollable Content Area with fixed height */}
                    <div className="mt-4 px-6" style={{ height: 'calc(100vh - 140px)' }}>
                        {categoryMarketItems.map((item) => (
                            <TabsContent key={item.type} value={item.type} className="h-full overflow-y-auto">
                                <div className="bg-background rounded-lg border-none shadow-none">
                                    {/* Fixed Title Section */}
                                    <div className="sticky top-0 z-10 bg-background border-b border-border">
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-foreground">
                                                {item.name} Market News
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Latest news and updates from the market
                                            </p>
                                        </div>
                                    </div>
                                    <MarketNewsTable marketCategory={item.type} provider={provider || ""}/>
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}