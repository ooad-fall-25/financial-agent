// src/app/discovery/page.tsx
'use client';

import React from 'react';
import { useState } from "react";
import { useRouter } from 'next/navigation'; 
import { MarketScreener} from "../components/discovery-page";
import {StockSearchBar} from '../components/stock-search-bar';
import {WorldIndices} from '../components/world-indices';
import { CryptoDashboard } from '../components/crypto-indices';


export default function DiscoveryPage() {
  // 2. INITIALIZE THE ROUTER
  const router = useRouter();

  // 3. UPDATE THE HANDLER TO NAVIGATE
  const handleStockSelect = (newTicker: string) => {
    if (newTicker) {
      // This tells Next.js to navigate to the new page.
      // e.g., if newTicker is 'OPEN', it goes to '/market-data/OPEN'
      router.push(`/market-data/${newTicker.toUpperCase()}`);
    }
  };

  // The useState for 'submittedTicker' is no longer needed on this page.

  return (
    <main className=" p-4 md:p-8 min-h-0 h-screen flex flex-col overflow-y-auto">
      <div className="container mx-auto">
        <WorldIndices />
        <div className="flex flex-col items-start mb-8 gap-4">
          <h1 className="text-4xl font-bold">Stocks</h1>
            {/* The onSearch prop now triggers the navigation */}
            <div className="w-full md:w-2/3 lg:w-1/2 relative z-50">
            <StockSearchBar onSelect={handleStockSelect} />
          </div>
        </div>
        
        <MarketScreener />
        <CryptoDashboard />
      </div>
    </main>
  );
}