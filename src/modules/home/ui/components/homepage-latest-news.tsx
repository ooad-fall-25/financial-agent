"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client"; 
import { useQuery } from "@tanstack/react-query";


export function LatestNews() {
  const trpc = useTRPC();
  const { 
    data: latestNews, 
    isLoading, 
    isError 
  } = useQuery({
      ...trpc.HomeData.fetchYahooFinanceNews.queryOptions({ limit: 10 }),
      refetchOnWindowFocus: false, // News doesn't need to be refetched constantly
    });
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading news...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Failed to load news.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!latestNews || latestNews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No news available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {latestNews.map((item) => (
          // Use item.url for the key as it's guaranteed to be unique
          <div key={item.link} className="border-b pb-3 last:border-b-0">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold leading-tight hover:underline cursor-pointer">
              {item.title} {/* CHANGED from item.headline */}
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              {/* CHANGED to access nested source name and use publishedAt */}
              {new Date(item.pubDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}