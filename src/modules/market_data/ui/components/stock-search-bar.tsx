"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useDebounce } from "@/lib/use-debounce";
import { useQuery } from "@tanstack/react-query";

// --- 1. UPDATE THE PROPS INTERFACE ---
// It now requires an 'activeTab' to know its context.
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

  // The search query to the API remains the same, it's just for displaying results.
  const { data: searchResults, isLoading } = useQuery({
    ...trpc.AlpacaData.searchSymbols.queryOptions({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  // --- 2. THE NEW, SIMPLIFIED LOGIC ---
  // This function now uses the 'activeTab' prop to decide how to format the ticker.
  const processAndSelectTicker = (ticker: string) => {
    let finalTicker = ticker.toUpperCase();

    if (activeTab === 'crypto') {
      // If we are on the crypto tab, ALWAYS format as a crypto pair.
      if (!finalTicker.includes('/')) {
        finalTicker = `${finalTicker}/USD`;
      }
    }
    // If activeTab is 'stocks', we do nothing and use the ticker as is (e.g., "OPEN").

    // Pass the correctly formatted ticker to the parent.
    onSelect(finalTicker);
    setQuery("");
    setIsFocused(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query) {
      event.preventDefault();
      // The logic is now simple: just process whatever the user typed.
      processAndSelectTicker(query);
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
                    // When clicking an item, use the same simple logic.
                    onSelect={() => processAndSelectTicker(stock.symbol || "")}
                    className="cursor-pointer"
                  >
                    {/* ... (Your UI for rendering the item) ... */}
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