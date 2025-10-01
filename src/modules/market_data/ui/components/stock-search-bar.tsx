"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useDebounce } from "@/lib/use-debounce";
import { useQuery } from "@tanstack/react-query";

interface StockSearchBarProps {
  onSelect: (ticker: string) => void;
}

// Define a type for the stock object from your search results
interface SearchResult {
  symbol: string | null;
  description: string | null;
  type: string | null;
}

export function StockSearchBar({ onSelect }: StockSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const trpc = useTRPC();

  const { data: searchResults, isLoading } = useQuery({
    ...trpc.AlpacaData.searchSymbols.queryOptions({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  // --- 1. NEW: Unified function to process and select the ticker ---
  const processAndSelectTicker = (ticker: string, assetType?: string | null) => {
    let finalTicker = ticker.toUpperCase();

    // Heuristic: Check if the asset type is crypto from the search results,
    // OR if the typed text looks like a common crypto symbol (e.g., BTC, ETH).
    const isCrypto = assetType === 'crypto';
    const looksLikeCrypto = /^[A-Z]{3,5}$/.test(finalTicker);

    // If it's likely a crypto symbol and doesn't already have a '/', append '/USD'.
    if ((isCrypto || looksLikeCrypto) && !finalTicker.includes('/')) {
      finalTicker = `${finalTicker}/USD`;
    }

    onSelect(finalTicker); // Call the parent function with the formatted ticker
    setQuery("");          // Clear the input
    setIsFocused(false);   // Hide the dropdown
  };

  // --- 2. NEW: Function to handle the "Enter" key press ---
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query) {
      event.preventDefault(); // Prevent default form submission
      
      // Pass the raw query to our new processing function
      processAndSelectTicker(query);
    }
  };

  const isDropdownOpen = isFocused && query.length > 0;

  return (
    <Command className="relative w-full max-w-sm overflow-visible">
      <CommandInput
        placeholder="Search for stocks & more..."
        value={query}
        onValueChange={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        // --- ADD THIS onKeyDown prop ---
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
                    // --- 3. MODIFIED: Use the processing function on select ---
                    onSelect={() => processAndSelectTicker(stock.symbol || "", stock.type)}
                    className="cursor-pointer"
                  >
                    <div className="flex w-full justify-between items-center">
                      <div>
                        <p className="font-bold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{stock.description}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{stock.type}</p>
                      </div>
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