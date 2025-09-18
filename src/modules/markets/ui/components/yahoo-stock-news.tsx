// In components/yahoo-stock-news.tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { NewsData } from "@/lib/yahoo"; // Adjust path if needed
import Image from "next/image";

// Helper component for a single news item
const NewsArticleCard = ({ article }: { article: NewsData }) => {
  return (
    <a 
      href={article.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50"
    >
      <div className="flex-grow">
        <h4 className="font-semibold leading-tight">{article.title}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {article.publisher} • {article.time_ago}
        </p>
      </div>
      {article.thumbnail_url && (
        <div className="flex-shrink-0 w-28 h-20 relative rounded-md overflow-hidden">
          <img
            src={article.thumbnail_url}
            alt={article.title}
            // Use Tailwind CSS for styling to match the old component
            className="w-full h-full object-cover" 
            // This prevents errors if an image fails to load
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
    </a>
  );
};

interface Props {
  Ticker: string;
}

export const YahooStockNews = ({ Ticker }: Props) => {
  const trpc = useTRPC();
  // NOTE: You will need to add `fetchStockNews` to your tRPC router first!
  const { data, isLoading, isError } = useQuery(
    trpc.YahooMarket.fetchCompNews.queryOptions({ ticker: Ticker })
  );

  if (isLoading) {
    return <div className="p-4 bg-card rounded-lg h-64 animate-pulse" />;
  }

  if (isError || !data || data.length === 0) {
    return null; // Don't show the component if there's an error or no news
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Recent News: {Ticker}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
        {data.map((article) => (
          <NewsArticleCard key={article.uuid} article={article} />
        ))}
      </div>
    </div>
  );
};