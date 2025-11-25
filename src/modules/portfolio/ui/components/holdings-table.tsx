"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
// 1. Import AppRouter and inference helpers
import { type AppRouter } from "@/trpc/routers/_app"; 
import { inferRouterOutputs } from "@trpc/server";

// 2. Infer the type directly from the backend router
// This ensures the Table ALWAYS matches what the API returns
type RouterOutputs = inferRouterOutputs<AppRouter>;
type HoldingData = RouterOutputs["portfolio"]["getHoldings"][number];

interface HoldingsTableProps {
  data: HoldingData[];
  onDelete: (id: string) => void;
}

export const HoldingsTable = ({ data, onDelete }: HoldingsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Cost Basis</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Total P/L</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((holding) => {
            const costBasis = holding.quantity * holding.avgCost;
            const marketValue = holding.quantity * holding.marketData.price;
            const profitLoss = marketValue - costBasis;
            const isProfit = profitLoss >= 0;

            // 3. Handle Date parsing safely
            // If you don't use 'superjson', Dates arrive as strings. 
            // The constructor new Date() handles both Date objects and strings.
            const createdDate = new Date(holding.createdAt);
            const updatedDate = new Date(holding.marketData.lastUpdated);

            return (
              <TooltipProvider key={holding.id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{holding.symbol}</TableCell>
                      <TableCell className="text-right">
                        ${holding.marketData.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{holding.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${holding.avgCost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${costBasis.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${marketValue.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          isProfit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isProfit ? "+" : ""}
                        ${profitLoss.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(holding.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created: {createdDate.toLocaleString()}</p>
                    <p>
                      Last Fetched:{" "}
                      {updatedDate.toLocaleString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                No holdings found. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};