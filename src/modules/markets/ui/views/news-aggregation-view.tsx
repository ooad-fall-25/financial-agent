import { AppWindowIcon, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { MarketNewsTable } from "../components/market-news-table"


const categoryMarketItems = [
    {
        type: "general",
        name: "General"
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
export const NewsAggregationView = () => {
    return (
        <div className="h-screen max-w-7xl mx-auto flex flex-col">
            {/* Fixed Header with Tabs */}
            <div className="flex-shrink-0 bg-background border-none px-6 pt-6 pb-4">
                <Tabs defaultValue={categoryMarketItems[0].type} className="w-full">
                    <TabsList className="grid w-fit grid-cols-4">
                        {categoryMarketItems.map((item) => (
                            <TabsTrigger key={item.type} value={item.type}>{item.name}</TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Scrollable Content Area with fixed height */}
                    <div className="mt-4" style={{ height: 'calc(100vh - 140px)' }}>
                        {categoryMarketItems.map((item) => (
                            <TabsContent key={item.type} value={item.type} className="h-full overflow-y-auto">
                                <div className="bg-background rounded-lg border-none shadow-sm">
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
                                    <MarketNewsTable marketCategory={item.type} />
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}