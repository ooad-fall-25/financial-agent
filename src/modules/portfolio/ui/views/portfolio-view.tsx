"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoldingsSection } from "../components/holdings-section";
import { WatchlistSection } from "../components/watchlist-section";
import { PerformanceSection } from "../components/performance-section";

export function PortfolioView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Get the tab from the URL, or default to "holdings"
  const tabFromUrl = searchParams.get("tab");
  
  // We use a local state to manage the tab visually to ensure immediate UI response,
  // while we sync with the URL in the background.
  // Priority: URL Param -> Default "holdings"
  const [activeTab, setActiveTab] = useState(tabFromUrl || "holdings");

  // 2. Sync State with URL on Mount/Update
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      // 3. Fallback: If URL has no tab (e.g. clicked generic sidebar link), 
      // check LocalStorage to restore user's last preference.
      const savedTab = localStorage.getItem("portfolio-tab");
      if (savedTab && ["holdings", "watchlist", "performance"].includes(savedTab)) {
        setActiveTab(savedTab);
        // Optional: Update the URL to match the restored state
        router.replace(`${pathname}?tab=${savedTab}`, { scroll: false });
      }
    }
  }, [tabFromUrl, pathname, router]);

  // 4. Handle Tab Change
  const handleTabChange = (value: string) => {
    setActiveTab(value); // Update UI immediately
    
    // Save to LocalStorage
    localStorage.setItem("portfolio-tab", value);

    // Update URL query param
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    
    // Use 'replace' to update URL without adding a new history entry (cleaner back button behavior)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full h-screen min-h-0 flex flex-col overflow-y-auto p-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Manager</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="holdings" className="space-y-4">
          <HoldingsSection />
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <WatchlistSection />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}