"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from 'next/image';

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
    return (
      <div className="space-y-4 px-2"> 
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
            <div className="w-24 h-20 bg-muted rounded-md animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse mt-2" />
            </div>
          </div>
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
  
  const validNews = latestNews || [];

  return (
    <div className="space-y-4 px-2">
      {validNews
        .filter(item => item && item.url && item.img) 
        .map((item) => (
          <a 
            key={item.title} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block outline-none focus:outline-none"
          >
            <div
              className="group overflow-hidden rounded-lg border-border bg-card p-4
                         transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary"
            >
              {/* --- THIS IS THE MODIFIED LINE --- */}
              <div className="flex items-center gap-4 transition-transform duration-300 ease-in-out group-hover:scale-[1.03] ml-2">
                
                <div className="relative h-20 w-24 flex-shrink-0">
                  <Image
                    src={item.img}
                    alt={item.title}
                    className="rounded-md object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold leading-tight">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.source} • {item.ago}
                  </p>
                </div>

              </div>
            </div>
          </a>
      ))}
    </div>
  );
}