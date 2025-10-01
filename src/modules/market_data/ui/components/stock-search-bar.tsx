"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useDebounce } from "@/lib/use-debounce";
import { useQuery } from "@tanstack/react-query";

// --- STEP 1: Add an optional 'placeholder' prop to the interface ---
interface StockSearchBarProps {
  onSelect: (ticker: string) => void;
  placeholder?: string; // <-- THE FIX IS HERE
}

// --- STEP 2: Accept the new 'placeholder' prop in the function signature ---
export function StockSearchBar({ onSelect, placeholder }: StockSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const trpc = useTRPC();

  const { data: searchResults, isLoading } = useQuery({
    ...trpc.AlpacaData.searchSymbols.queryOptions({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  const handleSelect = (ticker: string) => {
    onSelect(ticker);
    setQuery("");
    setIsFocused(false);
  };

  const isDropdownOpen = isFocused && query.length > 0;

  return (
    <Command className="relative w-full max-w-sm overflow-visible">
      <CommandInput
        // --- STEP 3: Use the placeholder prop OR a default value ---
        placeholder={placeholder || "Search for stocks & more..."} // <-- THE FIX IS HERE
        value={query}
        onValueChange={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
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
                {searchResults.result.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    value={stock.symbol}
                    onSelect={() => handleSelect(stock.symbol || "")}
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