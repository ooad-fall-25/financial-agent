"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { PortfolioTable } from "./portfolio-table";
import { AddAssetDialog } from "./add-asset-dialog";
import { HoldingItem, TableColumn } from "@/lib/portfolio-types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

// --- CONFIG ---
const MAX_HOLDINGS = 20;

export const HoldingsSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<HoldingItem | null>(null);

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

  // Calculate limit
  const currentCount = holdingsData?.length ?? 0;
  const isLimitReached = currentCount >= MAX_HOLDINGS;

  const columns: TableColumn<HoldingItem>[] = [
    {
      header: "Ticker",
      cell: (item) => <span className="font-medium">{item.symbol}</span>,
    },
    {
      header: "Name",
      className: "hidden md:table-cell text-muted-foreground text-sm",
      cell: (item) => (
        item.name ? (
            <div 
            className="truncate font-medium max-w-[200px] lg:max-w-[300px] xl:max-w-[400px]" 
            title={item.name}
            >
            {item.name}
            </div>
        ) : (
            // UPDATED MESSAGE HERE
            <span className="text-xs italic text-muted-foreground opacity-50">Couldn't fetch name</span>
        )
      ),
    },
    {
      header: "Price",
      className: "text-right",
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
            minute: '2-digit'
        });
      },
    },
    {
      header: "Quantity",
      className: "text-right",
      cell: (item) => item.quantity.toString(),
    },
    {
      header: "Avg Cost",
      className: "text-right",
      cell: (item) => `$${item.avgCost.toFixed(2)}`,
    },
    {
      header: "Cost Basis",
      className: "text-right",
      cell: (item) => `$${(item.quantity * item.avgCost).toFixed(2)}`,
    },
    {
      header: "Market Value",
      className: "text-right",
      cell: (item) =>
        `$${(item.quantity * item.marketData.price).toFixed(2)}`,
    },
    {
      header: "Total P/L",
      className: "text-right",
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

        {/* LIMIT CHECK HERE */}
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
            onSubmit={(values) => {
                addMutation.mutate({
                symbol: values.symbol,
                quantity: Number(values.quantity),
                avgCost: Number(values.avgCost),
                });
            }}
            />
        ) : (
            <Button disabled variant="outline" className="opacity-75 cursor-not-allowed">
                Limit Reached ({MAX_HOLDINGS})
            </Button>
        )}
      </div>

      <PortfolioTable
        data={(holdingsData as HoldingItem[]) ?? []}
        columns={columns}
        onEdit={(item) => setEditingItem(item)}
        onDelete={(id) => deleteMutation.mutate({ id })}
        emptyMessage="No holdings found. Add one to get started."
        getTooltipContent={(item) => (
          <div className="space-y-1">
            <p className="font-semibold text-xs border-b pb-1 mb-1">Entry Details</p>
            <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
            <p>Last Edited: {new Date(item.updatedAt).toLocaleString()}</p>
          </div>
        )}
      />

      {/* Edit dialog */}
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
    </div>
  );
};