"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { PortfolioTable, SortConfig } from "./portfolio-table"; // Import SortConfig
import { AddAssetDialog } from "./add-asset-dialog";
import { HoldingItem, TableColumn } from "@/lib/portfolio-types";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
const MAX_HOLDINGS = 20;

interface MergeState {
    symbol: string;
    existing: { quantity: number; avgCost: number };
    incoming: { quantity: number; avgCost: number };
    result: { quantity: number; avgCost: number };
}

export const HoldingsSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<HoldingItem | null>(null);
  const [mergeConfirmation, setMergeConfirmation] = useState<MergeState | null>(null);

  // --- SORT STATE ---
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const { 
    data: holdingsData, 
    isLoading, 
    refetch, 
    isRefetching 
  } = useQuery({
    ...trpc.portfolio.getHoldings.queryOptions(),
    refetchInterval: 60000,
  });

  const addMutation = useMutation({
    ...trpc.portfolio.addHolding.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getHoldings.queryOptions().queryKey,
      });
      setEditingItem(null); 
      setMergeConfirmation(null); 
      toast.success("Holding saved successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    ...trpc.portfolio.deleteHolding.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getHoldings.queryOptions().queryKey,
      });
      toast.success("Holding deleted");
    },
  });

  const currentCount = holdingsData?.length ?? 0;
  const isLimitReached = currentCount >= MAX_HOLDINGS;

  const handleAddSubmit = (values: Record<string, string>) => {
    // ... (Your existing logic) ...
    const symbol = values["symbol"].toUpperCase();
    const newQty = Number(values["quantity"]);
    const newCost = Number(values["avgCost"]);

    const existingHolding = holdingsData?.find((h) => h.symbol === symbol);

    if (existingHolding) {
        const oldQty = existingHolding.quantity;
        const oldCost = existingHolding.avgCost;
        const totalQty = oldQty + newQty;
        const weightedAvgCost = ((oldQty * oldCost) + (newQty * newCost)) / totalQty;

        setMergeConfirmation({
            symbol: symbol,
            existing: { quantity: oldQty, avgCost: oldCost },
            incoming: { quantity: newQty, avgCost: newCost },
            result: { quantity: totalQty, avgCost: weightedAvgCost }
        });
    } else {
        addMutation.mutate({
            symbol: symbol,
            quantity: newQty,
            avgCost: newCost,
        });
    }
  };

  const columns: TableColumn<HoldingItem>[] = [
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
      cell: (item) => `$${item.marketData.price.toFixed(2)}`,
    },
    {
      header: "Last Trade",
      className: "text-right text-xs text-muted-foreground",
      cell: (item) => {
        if (!item.marketData.lastUpdated) {
             return <span className="italic opacity-50">Date not found</span>;
        }
        return new Date(item.marketData.lastUpdated).toLocaleString([], { 
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
      },
    },
    {
      header: "Shares Qty",
      className: "text-right",
      sortValue: (item) => item.quantity,
      cell: (item) => item.quantity.toString(),
    },
    {
      header: "Avg Cost",
      className: "text-right",
      sortValue: (item) => item.avgCost,
      cell: (item) => `$${item.avgCost.toFixed(2)}`,
    },
    {
      header: "Cost Basis",
      className: "text-right",
      sortValue: (item) => item.quantity * item.avgCost,
      cell: (item) => `$${(item.quantity * item.avgCost).toFixed(2)}`,
    },
    {
      header: "Market Value",
      className: "text-right",
      sortValue: (item) => item.quantity * item.marketData.price,
      cell: (item) =>
        `$${(item.quantity * item.marketData.price).toFixed(2)}`,
    },
    {
      header: "Total P/L",
      className: "text-right",
      sortValue: (item) => (item.quantity * item.marketData.price) - (item.quantity * item.avgCost),
      cell: (item) => {
        const costBasis = item.quantity * item.avgCost;
        const marketValue = item.quantity * item.marketData.price;
        const pl = marketValue - costBasis;
        const isProfit = pl >= 0;
        return (
          <span className={isProfit ? "text-green-600" : "text-red-600"}>
            {isProfit ? "+" : ""}
            ${pl.toFixed(2)}
          </span>
        );
      },
    },
  ];

  // --- SORTING LOGIC ---
  const sortedData = useMemo(() => {
    const data = (holdingsData as HoldingItem[]) ?? [];
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
  }, [holdingsData, sortConfig, columns]);

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
                title="Add New Holding"
                triggerLabel="Add Holding"
                isPending={addMutation.isPending}
                fields={[
                    { name: "symbol", label: "Ticker Symbol", type: "text", placeholder: "AAPL", required: true },
                    { name: "quantity", label: "Quantity", type: "number", step: "any", required: true },
                    { name: "avgCost", label: "Avg Cost per Share", type: "number", step: "any", required: true },
                ]}
                onSubmit={handleAddSubmit}
                />
            ) : (
                <Button disabled variant="outline" className="opacity-75 cursor-not-allowed">
                    Limit Reached ({MAX_HOLDINGS})
                </Button>
            )}
        </div>
      </div>

      <PortfolioTable
        data={sortedData} // Pass Sorted Data
        columns={columns}
        onEdit={(item) => setEditingItem(item)}
        onDelete={(id) => deleteMutation.mutate({ id })}
        sortConfig={sortConfig} // Pass Config so headers show arrows
        onSort={handleSort} // Pass handler so clicking headers works
        emptyMessage="No holdings found. Add one to get started."
        getTooltipContent={(item) => (
          <div className="space-y-1">
            <p className="font-semibold text-xs border-b pb-1 mb-1">Entry Details</p>
            <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
            <p>Last Edited: {new Date(item.updatedAt).toLocaleString()}</p>
          </div>
        )}
      />
      
      {/* ... (Keep your Edit Dialog and Merge Dialog code here) ... */}
       <AddAssetDialog
        title="Edit Holding"
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        isPending={addMutation.isPending}
        defaultValues={editingItem ? {
            symbol: editingItem.symbol,
            quantity: editingItem.quantity,
            avgCost: editingItem.avgCost
        } : undefined}
        fields={[
          { name: "symbol", label: "Ticker", type: "text", required: true },
          { name: "quantity", label: "Quantity", type: "number", step: "any", required: true },
          { name: "avgCost", label: "Avg Cost", type: "number", step: "any", required: true },
        ]}
        onSubmit={(values) => {
          addMutation.mutate({
            symbol: values.symbol,
            quantity: Number(values.quantity),
            avgCost: Number(values.avgCost),
          });
        }}
      />

      <AlertDialog open={!!mergeConfirmation} onOpenChange={(open) => !open && setMergeConfirmation(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Merge Holding: {mergeConfirmation?.symbol}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="space-y-3 pt-2 text-sm">
                        <p>This ticker already exists in your portfolio. Would you like to merge the new shares and update the average cost?</p>
                        
                        <div className="grid grid-cols-3 gap-2 bg-muted/50 p-3 rounded-md text-center">
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase">Current</div>
                                <div className="font-semibold">{mergeConfirmation?.existing.quantity} shares</div>
                                <div className="text-xs text-muted-foreground">@ ${mergeConfirmation?.existing.avgCost.toFixed(2)}</div>
                            </div>
                            <div className="space-y-1 border-l border-r border-border/50">
                                <div className="text-xs text-blue-500 uppercase font-bold">+ Adding</div>
                                <div className="font-semibold text-blue-600">{mergeConfirmation?.incoming.quantity} shares</div>
                                <div className="text-xs text-muted-foreground">@ ${mergeConfirmation?.incoming.avgCost.toFixed(2)}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-green-600 uppercase font-bold">= Result</div>
                                <div className="font-semibold text-green-600">{mergeConfirmation?.result.quantity} shares</div>
                                <div className="text-xs text-muted-foreground">@ ${mergeConfirmation?.result.avgCost.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    if (mergeConfirmation) {
                        addMutation.mutate({
                            symbol: mergeConfirmation.symbol,
                            quantity: mergeConfirmation.result.quantity,
                            avgCost: mergeConfirmation.result.avgCost,
                        });
                    }
                }}>
                    Confirm Merge
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};