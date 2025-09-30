"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
  Ticker: string;
}

// Interface for a single news article, matching the backend
interface AlpacaNewsArticle {
  id: number;
  headline: string;
  summary: string;
  created_at: string;
  source: string;
  url: string;
  images: { size: 'thumb' | 'small' | 'large'; url: string }[];
}

// Helper to format the date string into a more readable format
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(new Date(dateString));
};


export const StockNews = ({ Ticker }: Props) => {
  const trpc = useTRPC();

  const { data: news, isLoading, isError } = useQuery({
    ...trpc.AlpacaData.fetchStockNews.queryOptions({ ticker: Ticker }),
    refetchOnWindowFocus: false, // News doesn't need to be refetched constantly
  });

  if (isLoading) {
    // A simple loading skeleton
    return (
      <div>
        <div className="h-6 w-1/3 bg-muted rounded-md animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 w-full bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !news || news.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold">Recent News</h3>
        <p className="text-muted-foreground mt-2">No news available for {Ticker}.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Recent News</h3>
      <ul className="mt-4 space-y-4">
        {news.map((article: AlpacaNewsArticle) => {
          const thumbImage = article.images.find(img => img.size === 'thumb');
          return (
            <li key={article.id}>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                {thumbImage && (
                  <img
                    src={thumbImage.url}
                    alt={article.headline}
                    className="w-24 h-24 object-cover rounded-md flex-shrink-0 bg-muted"
                  />
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{article.source} &bull; {formatDate(article.created_at)}</p>
                  <h4 className="font-semibold mt-1">{article.headline}</h4>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.summary}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};