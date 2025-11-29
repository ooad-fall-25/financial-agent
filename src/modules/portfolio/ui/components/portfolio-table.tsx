"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TableColumn } from "@/lib/portfolio-types";

interface PortfolioTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onDelete: (id: string) => void;
  emptyMessage?: string;
  getTooltipContent?: (item: T) => React.ReactNode;
}

export function PortfolioTable<T extends { id: string }>({
  data,
  columns,
  onDelete,
  emptyMessage = "No data available.",
  getTooltipContent,
}: PortfolioTableProps<T>) {
  // State to track cursor position
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<T | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border relative">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              // Update state on mouse interactions
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              onMouseMove={handleMouseMove}
              className="group cursor-default relative"
            >
              {columns.map((col, index) => (
                <TableCell key={index} className={col.className}>
                  {col.cell(item)}
                </TableCell>
              ))}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click events if you add them later
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* THE CURSOR TOOLTIP */}
      {hoveredItem && getTooltipContent && (
        <div
          className="fixed pointer-events-none z-50 rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          style={{
            // Position slightly offset from the cursor so it doesn't block the view
            top: cursorPos.y + 15,
            left: cursorPos.x + 15,
          }}
        >
          {getTooltipContent(hoveredItem)}
        </div>
      )}
    </div>
  );
}