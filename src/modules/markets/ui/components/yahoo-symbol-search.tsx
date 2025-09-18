// In components/yahoo-symbol-search.tsx
"use client";

import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { SymbolSearchResult } from "@/lib/yahoo"; // Adjust path if needed
import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  onSelect: (ticker: string) => void;
}

export const YahooSymbolSearch = ({ value, onChange, onSelect }: Props) => {
  const [debouncedQuery, setDebouncedQuery] = useState(value);
  const trpc = useTRPC();

  // Debounce effect to prevent API calls on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(handler);
  }, [value]);

  const { data: searchResults, isLoading } = useQuery(
    trpc.YahooMarket.searchSymbols.queryOptions(
      { query: debouncedQuery },
      { enabled: debouncedQuery.length > 0 } // Only search when there's text
    )
  );

  const handleSelect = (ticker: string) => {
    onChange(ticker); // Set the input text to the selected ticker
    onSelect(ticker); // Tell the parent a selection was made
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id="ticker-search"
        type="text"
        placeholder="Search for a symbol (e.g., NVDA)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        autoComplete="off" // Prevent browser's default autocomplete
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* --- Results Dropdown --- */}
      {debouncedQuery.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-10">
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Searching...</div>}
          {!isLoading && searchResults && searchResults.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No results found.</div>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="max-h-72 overflow-y-auto">
              
              {/* --- START OF THE VISUAL UPDATE --- */}
              {searchResults.map((result) => (
                <button
                  key={result.ticker}
                  onClick={() => handleSelect(result.ticker)}
                  // Use Flexbox to create the two-column layout
                  className="w-full text-left p-3 hover:bg-muted/50 flex justify-between items-center"
                >
                  {/* Left Column: Ticker and Company Name */}
                  <div>
                    <p className="font-bold">{result.ticker}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                      {result.companyName}
                    </p>
                  </div>
                  
                  {/* Right Column: Asset Type and Exchange */}
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{result.assetType}</p>
                    <p>{result.exchange}</p>
                  </div>
                </button>
              ))}
              {/* --- END OF THE VISUAL UPDATE --- */}

            </div>
          )}
        </div>
      )}
    </div>
  );
};