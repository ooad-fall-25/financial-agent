"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortfolioTable } from "./portfolio-table";
import { AddAssetDialog } from "./add-asset-dialog";
import { HoldingItem, TableColumn } from "@/lib/portfolio-types";

export const HoldingsSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // --- 1. Data Fetching ---
  const holdingsQuery = useQuery(trpc.portfolio.getHoldings.queryOptions());

  // --- 2. Mutations ---
  const addMutation = useMutation({
    ...trpc.portfolio.addHolding.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getHoldings.queryOptions().queryKey,
      });
    },
  });

  const deleteMutation = useMutation({
    ...trpc.portfolio.deleteHolding.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.portfolio.getHoldings.queryOptions().queryKey,
      });
    },
  });

  // --- 3. Configuration ---

  // Define Columns with Logic specific to Holdings
  const columns: TableColumn<HoldingItem>[] = [
    {
      header: "Ticker",
      cell: (item) => <span className="font-medium">{item.symbol}</span>,
    },
    {
      header: "Price",
      className: "text-right",
      cell: (item) => `$${item.marketData.price.toFixed(2)}`,
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

  if (holdingsQuery.isLoading) {
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
      </div>

      <PortfolioTable
        data={(holdingsQuery.data as HoldingItem[]) ?? []}
        columns={columns}
        onDelete={(id) => deleteMutation.mutate({ id })}
        emptyMessage="No holdings found. Add one to get started."
        getTooltipContent={(item) => (
          <>
            <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(item.marketData.lastUpdated).toLocaleString()}</p>
          </>
        )}
      />
    </div>
  );
};