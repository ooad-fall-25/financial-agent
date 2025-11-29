"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { PortfolioTable } from "./portfolio-table";
import { AddAssetDialog } from "./add-asset-dialog";
import { WatchlistItem, TableColumn } from "@/lib/portfolio-types";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";

export const WatchlistSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { 
    data: watchlistData, 
    isLoading, 
    refetch, 
    isRefetching 
  } = useQuery({
    ...trpc.portfolio.getWatchlist.queryOptions(),
    refetchInterval: 60000, 
  });

  const addMutation = useMutation({
    ...trpc.portfolio.addToWatchlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getWatchlist.queryOptions().queryKey,
      });
      toast.success("Added to watchlist");
    },
    onError: (error) => {
      console.error("Failed to add:", error);
      toast.error(`Error: ${error.message}`); 
    }
  });

  const deleteMutation = useMutation({
    ...trpc.portfolio.removeFromWatchlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getWatchlist.queryOptions().queryKey,
      });
    },
  });

  const columns: TableColumn<WatchlistItem>[] = [
    {
      header: "Ticker",
      cell: (item) => <span className="font-medium">{item.symbol}</span>,
    },
    // --- REPLACED CURRENCY WITH NAME ---
    {
      header: "Name",
      className: "hidden md:table-cell text-muted-foreground text-sm",
      cell: (item) => <span className="truncate max-w-[150px] block" title={item.name}>{item.name}</span>,
    },
    {
      header: "Price",
      className: "text-right",
      cell: (item) => <span className="font-bold">${item.marketData.price.toFixed(2)}</span>,
    },
    {
      header: "Last Trade",
      className: "text-right text-xs text-muted-foreground",
      cell: (item) => new Date(item.marketData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short'}),
    },
    {
      header: "Open",
      className: "text-right",
      cell: (item) => `$${item.marketData.open.toFixed(2)}`,
    },
    {
      header: "High",
      className: "text-right",
      cell: (item) => `$${item.marketData.high.toFixed(2)}`,
    },
    {
      header: "Low",
      className: "text-right",
      cell: (item) => `$${item.marketData.low.toFixed(2)}`,
    },
    {
      header: "Prev Close",
      className: "text-right",
      cell: (item) => `$${item.marketData.prevClose.toFixed(2)}`,
    },
    {
      header: "Volume",
      className: "text-right",
      cell: (item) => item.marketData.volume.toLocaleString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span>Live Data • Auto-refreshes every 60s</span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-1" 
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh Data Now"
          >
             <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <AddAssetDialog
            title="Add to Watchlist"
            triggerLabel="Add to Watchlist"
            isPending={addMutation.isPending}
            fields={[
              { name: "symbol", label: "Ticker Symbol", type: "text", placeholder: "TSLA", required: true },
            ]}
            onSubmit={(values) => {
              if(!values.symbol) return;
              addMutation.mutate({ symbol: values.symbol });
            }}
          />
      </div>

      <PortfolioTable
        data={(watchlistData as WatchlistItem[]) ?? []}
        columns={columns}
        onDelete={(id) => deleteMutation.mutate({ id })}
        emptyMessage="Watchlist is empty."
        getTooltipContent={(item) => (
           <div className="space-y-1">
             <p className="font-semibold text-xs border-b pb-1 mb-1">Entry Details</p>
             <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
           </div>
        )}
      />
    </div>
  );
};