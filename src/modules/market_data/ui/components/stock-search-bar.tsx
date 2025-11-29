"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useDebounce } from "@/lib/use-debounce";
import { useQuery } from "@tanstack/react-query";

interface StockSearchBarProps {
  onSelect: (ticker: string) => void;
  activeTab: "stocks" | "crypto";
}

interface SearchResult {
  symbol: string | null;
  description: string | null;
  type: string | null;
}

export function StockSearchBar({ onSelect, activeTab }: StockSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const trpc = useTRPC();

  const { data: searchResults, isLoading } = useQuery({
    ...trpc.AlpacaData.searchSymbols.queryOptions({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  const processAndSelectTicker = (ticker: string) => {
    let finalTicker = ticker.toUpperCase();
    
    if (activeTab === 'crypto') {
      // Remove /USD if it exists, then add it back
      finalTicker = finalTicker.replace('/USD', '');
      finalTicker = `${finalTicker}/USD`;
    }
    
    onSelect(finalTicker);
    setQuery("");
    setIsFocused(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query) {
      event.preventDefault();
      
      const upperQuery = query.toUpperCase();
      
      // FIX: For crypto tab, prioritize crypto-related matches
      if (activeTab === 'crypto') {
        // First, check if user typed a crypto symbol directly (e.g., "DOGE", "BTC")
        const cryptoSymbols = ['BTC', 'ETH', 'DOGE', 'XRP', 'SOL', 'USDC', 'USDT'];
        if (cryptoSymbols.includes(upperQuery)) {
          processAndSelectTicker(upperQuery);
          return;
        }
        
        // Check if any result matches common crypto symbols
        const cryptoMatch = searchResults?.result?.find(
          (stock) => cryptoSymbols.includes(stock.symbol?.toUpperCase() || '')
        );
        
        if (cryptoMatch) {
          processAndSelectTicker(cryptoMatch.symbol!);
          return;
        }
      }
      
      // For stocks or if no crypto match found, use the original logic
      const exactMatch = searchResults?.result?.find(
        (stock) => stock.symbol?.toUpperCase() === upperQuery
      );
      
      if (exactMatch) {
        processAndSelectTicker(exactMatch.symbol!);
        return;
      }
      
      if (searchResults?.result && searchResults.result.length > 0) {
        processAndSelectTicker(searchResults.result[0].symbol!);
        return;
      }
      
      console.log("No valid ticker found for:", query);
    }
  };

  const isDropdownOpen = isFocused && query.length > 0;

  return (
    <Command className="relative w-full max-w-sm overflow-visible">
      <CommandInput
        placeholder={activeTab === 'stocks' ? "Search for stocks..." : "Search for crypto..."}
        value={query}
        onValueChange={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        onKeyDown={handleKeyDown}
      />
      
      {isDropdownOpen && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <CommandList>
            {isLoading && <CommandEmpty>Searching...</CommandEmpty>}
            {!isLoading && (!searchResults || searchResults.result.length === 0) && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {searchResults && searchResults.result.length > 0 && (
              <CommandGroup heading="Symbols">
                {(searchResults.result as SearchResult[]).map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    value={stock.symbol!}
                    onSelect={() => processAndSelectTicker(stock.symbol || "")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <span className="font-semibold text-sm">{stock.symbol}</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {stock.description}
                        </span>
                      </div>
                      {stock.type && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          {stock.type.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </div>
      )}
    </Command>
  );
}