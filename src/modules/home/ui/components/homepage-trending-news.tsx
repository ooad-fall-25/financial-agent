"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Star } from "lucide-react";
import Image from 'next/image';
import { useMemo } from "react";

export function TrendingNews() {
  const trpc = useTRPC();
  const query = useQueryClient();
  const { 
    data: news, 
    isLoading, 
    isError 
  } = useQuery({
      ...trpc.HomeData.fetchYahooFinanceNews.queryOptions({ limit: 3 }),
      refetchOnWindowFocus: false, 
  });

  const { data: pinnedNews } = useQuery({
    ...trpc.HomeData.getAllPinnedNews.queryOptions(),
    refetchOnWindowFocus: false,
  });

  const pinnedNewsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (pinnedNews) {
      for (const item of pinnedNews) {
        map.set(item.url, item.id);
      }
    }
    return map;
  }, [pinnedNews]);

  const pinMutation = useMutation({
    ...trpc.HomeData.pinNews.mutationOptions(),
    onSuccess: () => {
      query.invalidateQueries(trpc.HomeData.getAllPinnedNews.queryOptions());
    },
  });

  const unpinMutation = useMutation({
    ...trpc.HomeData.unpinNews.mutationOptions(),
    onSuccess: () => {
      query.invalidateQueries(trpc.HomeData.getAllPinnedNews.queryOptions());
    },
  });

  const handlePinToggle = (e: React.MouseEvent, story: any) => {
    e.preventDefault(); // Prevents navigating to the article URL
    e.stopPropagation(); // Stops event from bubbling up

    const pinnedItemId = pinnedNewsMap.get(story.url);
    if (pinnedItemId) {
      unpinMutation.mutate({ newsId: pinnedItemId });
    } else {
      pinMutation.mutate({
        title: story.title,
        source: story.source,
        url: story.url,
        time: story.ago, 
      });
    }
  };
    
  if (isLoading) {
    return <div>Loading Trending News...</div>;
  }

  const validNews = (news || []).filter(item => item && item.url && item.img && item.title);

  if (isError || validNews.length < 3) {
    return <Card className="p-4"><p className="text-red-500">Could not load trending news.</p></Card>;
  }

  const topStory = validNews[0];
  const subStories = validNews.slice(1, 3);

  const PinButton = ({ story }: { story: any }) => {
    const isPinned = pinnedNewsMap.has(story.url);
    return (
      <button
        onClick={(e) => handlePinToggle(e, story)}
        className="p-1 rounded-full hover:bg-muted-foreground/20 transition-colors"
        aria-label={isPinned ? "Unpin news" : "Pin news"}
      >
        <Star className={`h-4 w-4 ${isPinned ? 'text-yellow-500 fill-yellow-400' : 'text-muted-foreground'}`} />
      </button>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Top Story with Big Picture */}
      <a 
        href={topStory.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block outline-none focus:outline-none" 
      >
        <Card className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
          <div className="relative w-full aspect-video bg-muted">
            <Image 
                src={topStory.img} 
                alt={topStory.title} 
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <CardHeader className="pt-4">
            <CardTitle className="text-2xl text-center">{topStory.title}</CardTitle>
            <CardDescription className="text-center pt-2">
              <div className="text-sm text-muted-foreground text-center pt-2 flex items-center justify-center gap-2">
                <span>{topStory.source} • {topStory.ago}</span>
                <PinButton story={topStory} />
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </a>

      {/* Two Smaller Stories Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subStories.map((story) => (
          <a 
            key={story.title} 
            href={story.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block h-full outline-none focus:outline-none" 
          >
            <Card className="group h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
              <div className="relative w-full aspect-video bg-muted">
                <Image 
                  src={story.img} 
                  alt={story.title} 
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-md leading-tight">{story.title}</CardTitle>
                <div className="text-xs text-muted-foreground pt-2 flex items-center gap-2">
                  <span>{story.source} • {story.ago}</span>
                  <PinButton story={story} />
                </div>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}