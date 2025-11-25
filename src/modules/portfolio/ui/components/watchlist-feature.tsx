"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WatchlistTable } from "./watchlist-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export const WatchlistFeature = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [watchlistInput, setWatchlistInput] = useState("");

  const watchlistQuery = useQuery(trpc.portfolio.getWatchlist.queryOptions());

  const addToWatchlistMutation = useMutation({
    ...trpc.portfolio.addToWatchlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.portfolio.getWatchlist.queryOptions().queryKey 
      });
      setWatchlistInput("");
    },
  });

  const deleteWatchlistMutation = useMutation({
    ...trpc.portfolio.removeFromWatchlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.portfolio.getWatchlist.queryOptions().queryKey 
      });
    },
  });

  const handleAddWatchlist = () => {
    if (!watchlistInput) return;
    addToWatchlistMutation.mutate({ symbol: watchlistInput });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm">
        <Input
          placeholder="Enter ticker (e.g. TSLA)"
          value={watchlistInput}
          onChange={(e) => setWatchlistInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddWatchlist()}
        />
        <Button onClick={handleAddWatchlist} disabled={addToWatchlistMutation.isPending}>
          {addToWatchlistMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Add"}
        </Button>
      </div>

      {watchlistQuery.isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        <WatchlistTable
          data={watchlistQuery.data || []}
          onDelete={(id) => deleteWatchlistMutation.mutate({ id })}
        />
      )}
    </div>
  );
};