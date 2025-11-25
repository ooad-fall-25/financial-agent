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

type WatchlistData = {
  id: string;
  symbol: string;
  marketData: {
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    prevClose: number;
    lastUpdated: string;
  };
};

interface WatchlistTableProps {
  data: WatchlistData[];
  onDelete: (id: string) => void;
}

export const WatchlistTable = ({ data, onDelete }: WatchlistTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Open</TableHead>
            <TableHead className="text-right">High</TableHead>
            <TableHead className="text-right">Low</TableHead>
            <TableHead className="text-right">Prev Close</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <TableRow>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell>USD</TableCell>
                    <TableCell className="text-right font-bold">
                      ${item.marketData.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.marketData.open.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.marketData.high.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.marketData.low.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.marketData.prevClose.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.marketData.volume.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Data Updated:{" "}
                    {new Date(item.marketData.lastUpdated).toLocaleString()}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
           {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center h-24">
                Watchlist is empty.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};