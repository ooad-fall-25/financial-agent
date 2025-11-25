import { type AppRouter } from "@/trpc/routers/_app"; // Adjust path to your appRouter
import { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type HoldingItem = RouterOutputs["portfolio"]["getHoldings"][number];
export type WatchlistItem = RouterOutputs["portfolio"]["getWatchlist"][number];

// Definition for our Generic Table Columns
export interface TableColumn<T> {
  header: string;
  // Function to render the cell content
  cell: (item: T) => React.ReactNode; 
  className?: string; // For alignment (text-right, etc)
}

// Definition for our Generic Dialog Fields
export interface DialogField {
  name: string;
  label: string;
  type: "text" | "number";
  placeholder?: string;
  step?: string;
  required?: boolean;
}