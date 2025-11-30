"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoldingsSection } from "../components/holdings-section";
import { WatchlistSection } from "../components/watchlist-section";

export function PortfolioView() {
  return (
    <div className="w-full h-screen min-h-0 flex flex-col overflow-y-auto p-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Manager</h1>
      </div>

      <Tabs defaultValue="holdings" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="holdings" className="space-y-4">
          <HoldingsSection />
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <WatchlistSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}