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
import { TableColumn } from "@/lib/portfolio-types";

interface PortfolioTableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  onDelete: (id: string) => void;
  // Optional function to return content for the tooltip
  getTooltipContent?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export const PortfolioTable = <T extends { id: string }>({
  data,
  columns,
  onDelete,
  getTooltipContent,
  emptyMessage = "No items found.",
}: PortfolioTableProps<T>) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <TableRow className="hover:bg-muted/50">
                    {columns.map((col, idx) => (
                      <TableCell key={idx} className={col.className}>
                        {col.cell(item)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                {getTooltipContent && (
                  <TooltipContent>{getTooltipContent(item)}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-center h-24"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};