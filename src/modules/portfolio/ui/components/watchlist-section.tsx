"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortfolioTable } from "./portfolio-table";
import { AddAssetDialog } from "./add-asset-dialog";
import { WatchlistItem, TableColumn } from "@/lib/portfolio-types";

export const WatchlistSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery(trpc.portfolio.getWatchlist.queryOptions());

  const addMutation = useMutation({
    ...trpc.portfolio.addToWatchlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getWatchlist.queryOptions().queryKey,
      });
    },
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
    {
      header: "Currency",
      cell: () => "USD",
    },
    {
      header: "Price",
      className: "text-right",
      cell: (item) => <span className="font-bold">${item.marketData.price.toFixed(2)}</span>,
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

  if (watchlistQuery.isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
        data={(watchlistQuery.data as WatchlistItem[]) ?? []}
        columns={columns}
        onDelete={(id) => deleteMutation.mutate({ id })}
        emptyMessage="Watchlist is empty."
        getTooltipContent={(item) => (
           <p>Data Updated: {new Date(item.marketData.lastUpdated).toLocaleString()}</p>
        )}
      />
    </div>
  );
};