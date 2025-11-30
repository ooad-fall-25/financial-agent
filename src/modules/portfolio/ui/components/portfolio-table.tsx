"use client";

import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react"; 
import { TableColumn } from "@/lib/portfolio-types";

interface PortfolioTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onDelete: (id: string) => void;
  onEdit?: (item: T) => void; 
  emptyMessage?: string;
  getTooltipContent?: (item: T) => React.ReactNode;
}

export function PortfolioTable<T extends { id: string }>({
  data,
  columns,
  onDelete,
  onEdit, 
  emptyMessage = "No data available.",
  getTooltipContent,
}: PortfolioTableProps<T>) {
  const [hoveredItem, setHoveredItem] = useState<T | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Performance Optimization: Direct DOM manipulation prevents re-renders on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltipRef.current) {
      const x = e.clientX;
      const y = e.clientY;
      tooltipRef.current.style.top = `${y + 15}px`;
      tooltipRef.current.style.left = `${x + 15}px`;
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    // REMOVED: max-h-[600px], overflow-y-auto.
    // The table will now extend the full length of the page.
    <div className="rounded-md border relative bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {/* Actions Column */}
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              onMouseMove={handleMouseMove}
              className="group cursor-default relative hover:bg-muted/50 transition-colors"
            >
              {columns.map((col, index) => (
                <TableCell key={index} className={col.className}>
                  {col.cell(item)}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {/* EDIT BUTTON */}
                  {onEdit && (
                      <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 transition-colors"
                      onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                      }}
                      >
                      <Pencil className="h-4 w-4" />
                      </Button>
                  )}

                  {/* DELETE BUTTON */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Optimized Tooltip */}
      {hoveredItem && getTooltipContent && (
        <div
          ref={tooltipRef}
          className="fixed pointer-events-none z-50 rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          style={{ top: 0, left: 0 }}
        >
          {getTooltipContent(hoveredItem)}
        </div>
      )}
    </div>
  );
}