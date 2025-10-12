"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date); // We pass the Date object directly
};

export function LatestNews() {
  const trpc = useTRPC();
  const { 
    data: latestNews, 
    isLoading, 
    isError 
  } = useQuery({
      ...trpc.HomeData.fetchYahooFinanceNews.queryOptions({ limit: 10 }),
      refetchOnWindowFocus: false,
    });
    
  if (isLoading) {
    // A simple loading skeleton, inspired by your StockNews component
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 bg-card rounded-lg border">
        <p>Failed to load news.</p>
      </div>
    );
  }
  
  if (!latestNews || latestNews.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-card rounded-lg border">
        <p>No news available.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {latestNews.map((item) => (
        <li key={item.title}>
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            {/* Using a more semantic heading for the title */}
            <h4 className="font-semibold leading-tight">{item.title}</h4>
            <p className="text-xs text-muted-foreground mt-2">
              {/* Using the new date formatting function */}
              {"Yahoo Finance"} • {formatDate(item.pubDate)}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}