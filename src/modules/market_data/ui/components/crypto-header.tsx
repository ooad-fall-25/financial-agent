"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePrevious } from "@/lib/use-previous";

interface Props {
  Ticker: string;
}

export const CryptoStockHeader = ({ Ticker }: Props) => {
  const trpc = useTRPC();
  const [priceChangeEffect, setPriceChangeEffect] = useState('');

  const {
    data: snapshotData,
    isLoading: isSnapshotLoading,
    isError: isSnapshotError,
  } = useQuery({
    ...trpc.AlpacaData.fetchCryptoSnapshot.queryOptions({ ticker: Ticker }),
    // After-hours data can be volatile, maybe refetch less often or only on focus
    refetchInterval: 300,
    refetchIntervalInBackground: true 
  });


  // --- CORRECTED DATA CALCULATIONS ---
  // Get the definitive closing price for today from the dailyBar
  const todayClose = snapshotData?.dailyBar?.c ?? 0;
  
  // Get the definitive closing price for the previous day
  const prevDayClose = snapshotData?.prevDailyBar?.c ?? 0;

  // The calculation is now clean and direct, matching the "At close" convention
  const dailyChange = todayClose - prevDayClose;
  const percentageChange = prevDayClose !== 0 ? (dailyChange / prevDayClose) * 100 : 0;

  // Animation effect can be based on the closing price
  const prevPrice = usePrevious(todayClose);

  useEffect(() => {
    // This effect is for visual flair and its logic is secondary
    if (prevPrice !== undefined && todayClose !== undefined) {
      if (todayClose > prevPrice) {
        setPriceChangeEffect('highlight-green');
      } else if (todayClose < prevPrice) {
        setPriceChangeEffect('highlight-red');
      }
      const timer = setTimeout(() => setPriceChangeEffect(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [todayClose, prevPrice]);


  // --- Loading and Error State Handling (No changes needed) ---
  if (isSnapshotLoading) {
    return (
      <div className="mb-6 animate-pulse">
        {/* ... loading skeleton ... */}
      </div>
    );
  }

  if (isSnapshotError || !snapshotData ) {
    return (
      <div className="mb-6 text-red-500">
        Could not load header data for {Ticker}.
      </div>
    );
  }

  // --- Final Display Logic (with one key change) ---
  const isPositive = dailyChange >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const changeSign = isPositive ? '+' : '';

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-muted-foreground">
        {Ticker}
      </h1>

      <div className="flex items-baseline gap-4 mt-1">
        <h2 className="text-4xl font-bold">
          <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${priceChangeEffect}`}>
            {/* --- DISPLAY THE CORRECT PRICE --- */}
            {/* We now explicitly display today's closing price */}
            {todayClose.toFixed(2)}
          </span>
        </h2>

        <div className={`flex items-end gap-2 text-xl font-semibold ${changeColor}`}>
          <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${priceChangeEffect}`}>
            {changeSign}{dailyChange.toFixed(2)}
          </span>
          <span className={`inline-block px-2 py-1 rounded-md transition-colors duration-1000 ${priceChangeEffect}`}>
            ({changeSign}{percentageChange.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};