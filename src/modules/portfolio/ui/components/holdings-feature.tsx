"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
// 1. Import useQueryClient
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { HoldingsTable } from "./holdings-table"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";

export const HoldingsFeature = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient(); // 2. Initialize QueryClient
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch Data
  const holdingsQuery = useQuery(trpc.portfolio.getHoldings.queryOptions());

  // Mutations
  const addHoldingMutation = useMutation({
    ...trpc.portfolio.addHolding.mutationOptions(),
    onSuccess: () => {
      // 3. Invalidate using the specific key from the options
      // This grabs the exact Key tRPC uses (e.g., [['portfolio', 'getHoldings']])
      queryClient.invalidateQueries({ 
        queryKey: trpc.portfolio.getHoldings.queryOptions().queryKey 
      });
      setIsAddOpen(false);
    },
  });

  const deleteHoldingMutation = useMutation({
    ...trpc.portfolio.deleteHolding.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.portfolio.getHoldings.queryOptions().queryKey 
      });
    },
  });

  const handleAddHolding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addHoldingMutation.mutate({
      symbol: formData.get("symbol") as string,
      quantity: Number(formData.get("quantity")),
      avgCost: Number(formData.get("avgCost")),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Holding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Holding</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHolding} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Ticker Symbol</Label>
                <Input id="symbol" name="symbol" placeholder="AAPL" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" step="any" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgCost">Avg. Cost per Share</Label>
                <Input id="avgCost" name="avgCost" type="number" step="any" required />
              </div>
              <Button type="submit" className="w-full" disabled={addHoldingMutation.isPending}>
                {addHoldingMutation.isPending ? "Adding..." : "Add Holding"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {holdingsQuery.isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        <HoldingsTable
          data={holdingsQuery.data || []}
          onDelete={(id) => deleteHoldingMutation.mutate({ id })}
        />
      )}
    </div>
  );
};