"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { PortfolioTable, SortConfig } from "./portfolio-table";
import { AddAssetDialog } from "./add-asset-dialog";
import { WatchlistItem, TableColumn } from "@/lib/portfolio-types";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
// IMPORT DROPDOWN
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// --- CONFIG ---
const MAX_WATCHLIST = 20;

// Helper to render value or error message
const renderFinancialValue = (
  value: number | null | undefined, 
  prefix = "$", 
  isVolume = false
) => {
  if (value === null || value === undefined) {
    return <span className="text-xs italic text-muted-foreground opacity-70">Data Unavailable</span>;
  }
  
  if (isVolume) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  return `${prefix}${value.toFixed(2)}`;
};

export const WatchlistSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // --- SORT STATE ---
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

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
      toast.error(error.message); 
    }
  });

  const deleteMutation = useMutation({
    ...trpc.portfolio.removeFromWatchlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getWatchlist.queryOptions().queryKey,
      });
      toast.success("Removed from watchlist");
    },
  });

  const currentCount = watchlistData?.length ?? 0;
  const isLimitReached = currentCount >= MAX_WATCHLIST;

  const columns: TableColumn<WatchlistItem>[] = [
    {
      header: "Ticker",
      sortValue: (item) => item.symbol,
      cell: (item) => <span className="font-medium">{item.symbol}</span>,
    },
    {
        header: "Name",
        className: "hidden md:table-cell text-muted-foreground text-sm",
        sortValue: (item) => item.name || "",
        cell: (item) => (
          item.name ? (
            <div 
                className="truncate font-medium max-w-[200px] lg:max-w-[300px] xl:max-w-[400px]" 
                title={item.name}
            >
                {item.name}
            </div>
          ) : (
            <span className="text-xs italic text-muted-foreground opacity-50">Couldn't fetch name</span>
          )
        ),
    },
    {
      header: "Price",
      className: "text-right",
      sortValue: (item) => item.marketData.price,
      cell: (item) => <span className="font-bold">${item.marketData.price.toFixed(2)}</span>,
    },
    {
      header: "Last Trade",
      className: "text-right text-xs text-muted-foreground",
      cell: (item) => {
        if (!item.marketData.lastUpdated) {
            return <span className="italic opacity-50">Time Unavailable</span>;
        }
        return new Date(item.marketData.lastUpdated).toLocaleString([], {
             month: 'numeric',
             day: 'numeric',
             hour: '2-digit', 
             minute: '2-digit',
             timeZoneName: 'short'
        });
      }
    },
    {
      header: "Open",
      className: "text-right",
      sortValue: (item) => item.marketData.open ?? 0,
      cell: (item) => renderFinancialValue(item.marketData.open),
    },
    {
      header: "High",
      className: "text-right",
      sortValue: (item) => item.marketData.high ?? 0,
      cell: (item) => renderFinancialValue(item.marketData.high),
    },
    {
      header: "Low",
      className: "text-right",
      sortValue: (item) => item.marketData.low ?? 0,
      cell: (item) => renderFinancialValue(item.marketData.low),
    },
    {
      header: "Prev Close",
      className: "text-right",
      sortValue: (item) => item.marketData.prevClose ?? 0,
      cell: (item) => renderFinancialValue(item.marketData.prevClose),
    },
    {
      header: "Volume",
      className: "text-right",
      sortValue: (item) => item.marketData.volume ?? 0,
      cell: (item) => renderFinancialValue(item.marketData.volume, "", true),
    },
  ];

  // --- SORTING LOGIC ---
  const sortedData = useMemo(() => {
    const data = (watchlistData as WatchlistItem[]) ?? [];
    if (!sortConfig) return data;

    const column = columns.find((c) => c.header === sortConfig.key);
    if (!column || !column.sortValue) return data;

    return [...data].sort((a, b) => {
      const valA = column.sortValue!(a);
      const valB = column.sortValue!(b);

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [watchlistData, sortConfig, columns]);

  const handleSort = (header: string) => {
    setSortConfig((current) => {
      if (current?.key === header) {
        return {
          key: header,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: header, direction: "asc" };
    });
  };

  const sortableColumns = columns.filter(col => !!col.sortValue);

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

        {/* --- RIGHT SIDE ACTIONS (Sort + Add) --- */}
        <div className="flex items-center gap-2">
            {/* SORT BUTTON */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 border-dashed text-xs md:text-sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortConfig ? (
                    <span className="hidden md:inline">
                      Sorted by {sortConfig.key} 
                    </span>
                  ) : (
                    "Sort"
                  )}
                   {sortConfig && (
                     <span className="ml-1 md:hidden">
                        {sortConfig.key.substring(0,3)}
                     </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortableColumns.map((col) => {
                  const isActive = sortConfig?.key === col.header;
                  return (
                    <DropdownMenuItem 
                      key={col.header} 
                      onClick={() => handleSort(col.header)}
                      className="cursor-pointer"
                    >
                      <span className={cn("flex-1", isActive && "font-bold")}>
                        {col.header}
                      </span>
                      {isActive && (
                        sortConfig?.direction === "asc" 
                          ? <ArrowUp className="ml-2 h-4 w-4 text-muted-foreground" /> 
                          : <ArrowDown className="ml-2 h-4 w-4 text-muted-foreground" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
                {sortConfig && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setSortConfig(null)}
                      className="justify-center text-muted-foreground"
                    >
                      Clear Sort
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ADD BUTTON */}
            {!isLimitReached ? (
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
            ) : (
                <Button disabled variant="outline" className="opacity-75 cursor-not-allowed">
                    Limit Reached ({MAX_WATCHLIST})
                </Button>
            )}
        </div>
      </div>

      <PortfolioTable
        data={sortedData}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
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