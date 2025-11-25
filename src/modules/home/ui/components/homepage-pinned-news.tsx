"use client"

import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import Link from 'next/link'; 
import { toast } from "sonner";


export function PinnedNews() {
  const trpc = useTRPC();
  const query = useQueryClient();

  const { 
    data: pinnedNewsData, 
    isLoading,
    isError
  } = useQuery({
    ...trpc.HomeData.getAllPinnedNews.queryOptions(),
    refetchOnWindowFocus: false,
  });

  const unpinMutation = useMutation({
    ...trpc.HomeData.unpinNews.mutationOptions(),
    onSuccess: () => {
      query.invalidateQueries(trpc.HomeData.getAllPinnedNews.queryOptions());
      toast.success("News unpinned");
    },
  });

  const handleUnpin = (e: React.MouseEvent, newsId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    unpinMutation.mutate({ newsId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !pinnedNewsData || pinnedNewsData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No news pinned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        {pinnedNewsData.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="block relative group outline-none focus:outline-none" 
          >
            <div
              className="group overflow-hidden rounded-lg p-3
                         transition-all duration-300 ease-in-out hover:bg-muted/50"
            >
              <div className="transition-transform duration-300 ease-in-out group-hover:scale-[1.03]">
                <h3 className="font-semibold leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{item.source} • {item.time}</p>
              </div>
              <button
                onClick={(e) => handleUnpin(e, item.id)}
                className="absolute top-1/2 -translate-y-10 right-0 p-1.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none hover:bg-muted"
                aria-label="Unpin news"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}