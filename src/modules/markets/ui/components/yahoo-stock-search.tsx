'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { YahooSymbolSearch } from "./yahoo-symbol-search";

interface StockSearchBarProps {
  onSearch?: (ticker: string) => void; // Optional callback for search
  onSelect?: (ticker: string) => void; // Optional callback for selection
  useNavigation?: boolean; // Whether to use router navigation (default true)
  initialValue?: string; // Initial search value
}

export function StockSearchBar({ 
  onSearch, 
  onSelect, 
  useNavigation = true,
  initialValue = ''
}: StockSearchBarProps) {
  const [searchInput, setSearchInput] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchInput) {
      const upperTicker = searchInput.toUpperCase();
      
      // Call the callback if provided
      if (onSearch) {
        onSearch(upperTicker);
      }
      
      // Navigate if useNavigation is true
      if (useNavigation) {
        router.push(`/market-data/${upperTicker}`);
      }
    }
  };

  const handleSelect = (ticker: string) => {
    setSearchInput(ticker);
    const upperTicker = ticker.toUpperCase();
    
    // Call the callback if provided
    if (onSelect) {
      onSelect(upperTicker);
    }
    
    // Navigate if useNavigation is true
    if (useNavigation) {
      router.push(`/market-data/${upperTicker}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-end gap-3 w-full max-w-lg">
      {/* Flexible input area: takes remaining space and is allowed to shrink */}
      <div className="flex-1 min-w-0">
        <label htmlFor="ticker-search" className="text-sm font-medium block mb-1">
          Stock Ticker
        </label>

        <YahooSymbolSearch
          value={searchInput}
          onChange={setSearchInput}
          onSelect={handleSelect} 
        />
      </div>

      {/* Prevent the button from growing or being pushed away */}
      <div className="flex-shrink-0">
        <Button type="submit" className="whitespace-nowrap">
          Search
        </Button>
      </div>
    </form>
  );
}