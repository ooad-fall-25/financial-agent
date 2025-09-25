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
import { StarsIcon } from "lucide-react";
import { AskAINewsSheet } from "../components/ask-ai-news-sheet";

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
    const [isSheetOpen, setIsSheetOpen] = useState(false); 

    const handleSetProvider = (value: string) => {
        if (value === "polygon") {
            setCategoryMarketItems(polygonItems);
            setActiveTab(polygonItems[0].type);
        } else {
            setCategoryMarketItems(finnhubItems);
            setActiveTab(finnhubItems[0].type);
        }
        setProvider(value);
    }   

    return (
        <div className="h-screen max-w-8xl mx-auto flex flex-col w-full">
            <AskAINewsSheet isOpen={isSheetOpen} setIsOpen={setIsSheetOpen}/>
            {/* Fixed Header with Tabs */}
            <div className="flex-shrink-0 bg-background border-none  pt-6 pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between px-6 border-b border-border border-dashed pb-6">

                        <TabsList className="">
                            {categoryMarketItems.map((item) => (
                                <TabsTrigger className="max-w-32 w-24" key={item.type} value={item.type}>{item.name}</TabsTrigger>
                            ))}
                        </TabsList>


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
                                    <MarketNewsTable marketCategory={item.type} provider={provider || ""} />
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}