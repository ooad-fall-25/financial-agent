"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { usePrevious } from '@/lib/use-previous';

// --- Interface for a single stock in the screener table ---
interface ScreenerStock {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

// --- Helper functions for formatting numbers ---
const formatPercentage = (num: number): string => `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
const formatPriceChange = (num: number): string => `${num > 0 ? '+' : ''}${num.toFixed(2)}`;

// --- Child Component: Renders a single row in the table ---
const ScreenerTableRow = ({ stock }: { stock: ScreenerStock }) => {
  const [highlightClass, setHighlightClass] = useState('');
  const prevPrice = usePrevious(stock.price);

  useEffect(() => {
    if (prevPrice !== undefined && stock.price !== prevPrice) {
      setHighlightClass(stock.price > prevPrice ? 'highlight-green' : 'highlight-red');
    }
    if (highlightClass) {
      const timer = setTimeout(() => setHighlightClass(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [stock.price, prevPrice, highlightClass]);

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="px-4 py-4 font-bold text-primary">
        <Link href={`/market-data/${stock.symbol}`}
         className="text-blue-400 hover:underline">{stock.symbol}
        </Link>
      </td>
      <td className="px-4 py-4 text-right font-semibold">
        <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
          ${stock.price?.toFixed(2)}
        </span>
      </td>
      <td className={`px-4 py-4 text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
          {formatPriceChange(stock.change)}
        </span>
      </td>
      <td className={`px-4 py-4 text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${highlightClass}`}>
          {formatPercentage(stock.percentChange)}
        </span>
      </td>
    </tr>
  );
};

// --- Main Component: The Market Screener ---
export const MarketScreener = () => {
  const trpc = useTRPC();
  const screenerTabs = [
    { id: 'most_actives', label: 'Most Active' },
    { id: 'day_gainers', label: 'Top Gainers' },
    { id: 'day_losers', label: 'Top Losers' },
  ] as const;
  
  const [activeTab, setActiveTab] = useState<(typeof screenerTabs)[number]['id']>('most_actives');

  // --- Query #1: Fetches the combined Gainers & Losers data ---
  const { 
    data: moversData, 
    isLoading: isLoadingMovers, 
    isError: isErrorMovers 
  } = useQuery({
    ...trpc.AlpacaData.fetchMarketMovers.queryOptions(),
    // Only run this query if one of the mover tabs is selected
    enabled: activeTab === 'day_gainers' || activeTab === 'day_losers',
    refetchInterval: 300,
  });

  // --- Query #2: Fetches the Most Actives data ---
  const { 
    data: activesData, 
    isLoading: isLoadingActives, 
    isError: isErrorActives 
  } = useQuery({
    ...trpc.AlpacaData.fetchMarketScreener.queryOptions({ screenerType: 'most_actives' }),
    // Only run this query if the 'most_actives' tab is selected
    enabled: activeTab === 'most_actives',
    refetchInterval: 60000,
  });

  // --- Combine the loading and error states from both queries ---
  const isLoading = isLoadingMovers || isLoadingActives;
  const isError = isErrorMovers || isErrorActives;
  
  // --- Use `useMemo` to select the correct data source based on the active tab ---
  // This is very efficient as it doesn't trigger re-renders or API calls.
  const screenerData = useMemo(() => {
    if (activeTab === 'day_gainers') return moversData?.gainers || [];
    if (activeTab === 'day_losers') return moversData?.losers || [];
    if (activeTab === 'most_actives') return activesData || [];
    return []; // Default to an empty array
  }, [activeTab, moversData, activesData]);

  return (
    <div>
      <div className="flex border-b border-border mb-4">
        {screenerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === tab.id ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-foreground">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 w-[25%]">Symbol</th>
              <th scope="col" className="px-4 py-3 text-right w-[25%]">Price</th>
              <th scope="col" className="px-4 py-3 text-right w-[25%]">Change</th>
              <th scope="col" className="px-4 py-3 text-right w-[25%]">Change %</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">Loading data...</td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-red-500">Error loading screener data.</td>
              </tr>
            )}
            {!isLoading && !isError && screenerData.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No data available.</td>
                </tr>
            )}
            {!isLoading && !isError && screenerData.map((stock) => (
              <ScreenerTableRow key={stock.symbol} stock={stock} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};