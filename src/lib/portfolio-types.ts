import { type AppRouter } from "@/trpc/routers/_app"; 
import { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type HoldingItem = RouterOutputs["portfolio"]["getHoldings"][number];
export type WatchlistItem = RouterOutputs["portfolio"]["getWatchlist"][number];

export interface TableColumn<T> {
  header: string;
  cell: (item: T) => React.ReactNode; 
  className?: string;
  sortValue?: (item: T) => string | number; 
}

export interface DialogField {
  name: string;
  label: string;
  type: "text" | "number";
  placeholder?: string;
  step?: string;
  required?: boolean;
}

// Performance Statistics Types
export interface AllocationItem {
  name: string;
  value: number;
  symbol: string;
}

export interface MoverItem {
  symbol: string;
  changePct: number;
  price: number;
}

export interface PerformerItem {
  symbol: string;
  returnPct: number;
  totalPL: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPL: number;
  totalReturnPct: number;
  dailyValueChange: number;
  dailyReturnPct: number;
  allocation: AllocationItem[];
  topGainers: MoverItem[];
  topLosers: MoverItem[];
  topPerformers: PerformerItem[];
}