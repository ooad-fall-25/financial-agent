"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoldingsFeature } from "../components/holdings-feature";
import { WatchlistFeature } from "../components/watchlist-feature";

export default function PortfolioView() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Manager</h1>
      </div>

      <Tabs defaultValue="holdings" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>
        </div>

        {/* The Tabs only mount the "Smart" Feature Components */}
        
        <TabsContent value="holdings">
          <HoldingsFeature />
        </TabsContent>

        <TabsContent value="watchlist">
          <WatchlistFeature />
        </TabsContent>
      </Tabs>
    </div>
  );
}