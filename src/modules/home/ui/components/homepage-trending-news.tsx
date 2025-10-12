"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function TrendingNews() {
  const trpc = useTRPC();
  const { 
    data: news, 
    isLoading, 
    isError 
  } = useQuery({
      ...trpc.HomeData.fetchStockNews.queryOptions({ limit: 5 }),
      refetchOnWindowFocus: false, 
    });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card>
          <div className="w-full h-64 bg-muted rounded-t-lg"></div>
          <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card><div className="w-full h-48 bg-muted rounded-lg"></div></Card>
          <Card><div className="w-full h-48 bg-muted rounded-lg"></div></Card>
        </div>
      </div>
    );
  }

  if (isError || !news || news.length < 3) {
    return <Card className="p-4"><p className="text-red-500">Could not load trending news.</p></Card>;
  }

  const topStory = news[0];
  const subStories = news.slice(1, 3); // Get the next two stories
  const firstImage = topStory.images.find(img => img.size === 'thumb');
  

  return (
    <div className="space-y-6">
      {/* Top Story with Big Picture */}
      <Card>
        <a href={topStory.url} target="_blank" rel="noopener noreferrer">
          <div className="relative w-full h-64 bg-muted rounded-t-lg">
            {firstImage && (
               <img 
                  src={firstImage.url} 
                  alt={topStory.headline} 
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-lg"
               />
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-2xl hover:underline">{topStory.headline}</CardTitle>
            <CardDescription>{topStory.source} • {new Date(topStory.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
        </a>
      </Card>

      {/* Two Smaller Stories Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subStories.map((story) => (
          <Card key={story.id}>
             <a href={story.url} target="_blank" rel="noopener noreferrer">
              <div className="relative w-full h-32 bg-muted rounded-t-lg">
                 { story.images.find(img => img.size === 'thumb') && (
                    <img 
                      src={story.images.find(img => img.size === 'thumb')?.url} 
                      alt={story.headline} 
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg"
                    />
                 )}
              </div>
              <CardHeader>
                <CardTitle className="text-md leading-tight hover:underline">{story.headline}</CardTitle>
                <CardDescription className="text-xs pt-2">{story.source} • {new Date(story.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
             </a>
          </Card>
        ))}
      </div>
    </div>
  );
}