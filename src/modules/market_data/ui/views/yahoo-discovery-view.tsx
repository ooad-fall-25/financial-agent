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
  const router = useRouter();

  const handleStockSelect = (newTicker: string) => {
    if (newTicker) {
      router.push(`/market-data/${newTicker.toUpperCase()}`);
    }
  };

  return (
    <main className="p-4 md:p-8 min-h-0 h-screen flex flex-col overflow-y-auto">
      <div className="container mx-auto">
        {/* Search bar at the top */}
        <div className="mb-6 w-full max-w-md">
          <StockSearchBar 
            onSelect={handleStockSelect} 
            activeTab="stocks" 
          />
        </div>

        {/* World Indices */}
        <WorldIndices />

        {/* Stocks title above the screener */}
        <div className="mb-6 mt-8">
          <h1 className="text-4xl font-bold">Stocks</h1>
        </div>

        {/* Market Screener with Most Active tabs */}
        <MarketScreener />
        
        {/* Crypto Dashboard */}
        <CryptoDashboard />
      </div>
    </main>
  );
}