"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from 'next/image';

export function TrendingNews() {
  const trpc = useTRPC();
  const { 
    data: news, 
    isLoading, 
    isError 
  } = useQuery({
      ...trpc.HomeData.fetchYahooFinanceNews.queryOptions({ limit: 3 }),
      refetchOnWindowFocus: false, 
    });

    
  if (isLoading) {
    return <div>Loading Trending News...</div>;
  }

  const validNews = (news || []).filter(item => item && item.url && item.img && item.title);

  if (isError || validNews.length < 3) {
    return <Card className="p-4"><p className="text-red-500">Could not load trending news.</p></Card>;
  }

  const topStory = validNews[0];
  const subStories = validNews.slice(1, 3);
  
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
            <CardDescription className="text-center pt-2">{topStory.source} • {topStory.ago}</CardDescription>
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
                <CardDescription className="text-xs pt-2">{story.source} • {story.ago}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}