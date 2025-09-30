"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useDebounce } from "@/lib/use-debounce";
import { useQuery } from "@tanstack/react-query";

interface StockSearchBarProps {
  onSelect: (ticker: string) => void;
}

export function StockSearchBar({ onSelect }: StockSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const trpc = useTRPC();

  const { data: searchResults, isLoading } = useQuery({
    ...trpc.AlpacaData.searchSymbols.queryOptions({ query: debouncedQuery }),
    // Only run the query if the user has typed something
    enabled: debouncedQuery.length > 0,
  });

  const handleSelect = (ticker: string) => {
    onSelect(ticker); // Call the parent function to navigate
    setQuery("");     // Clear the input
    setIsFocused(false); // Hide the dropdown
  };

  // The dropdown should be open only when the input is focused and there's a query
  const isDropdownOpen = isFocused && query.length > 0;

  return (
    <Command className="relative w-full max-w-sm overflow-visible">
      {/* 
        THIS IS THE CORRECTED PART.
        We remove the wrapper <div> and the extra <Search /> icon.
        The CommandInput component handles its own icon and border.
      */}
      <CommandInput
        placeholder="Search for stocks & more..."
        value={query}
        onValueChange={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
      />

      {/* The dropdown logic below remains unchanged */}
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