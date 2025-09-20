// src/app/discovery/page.tsx
'use client';

import React from 'react';
import { MarketScreener, TrendingSection } from "../components/discovery-page";
import {StockSearchBar} from '../components/yahoo-stock-search';
import {WorldIndices} from '../components/world-indices';
import { AssetsDashboard } from '../components/asset-indices';
import { CryptoDashboard } from '../components/crypto-indices';

export default function DiscoveryPage() {
  return (
    <main className="bg-gray-900 text-white p-4 md:p-8 min-h-screen">
      <div className="container mx-auto">

        <WorldIndices />
        <AssetsDashboard />
         {/* Stack vertically: title above search */}
        <div className="flex flex-col items-start mb-8 gap-4">
          <h1 className="text-4xl font-bold">Stocks</h1>
          
          {/* Constrain the search bar width */}
          <div className="w-full md:w-2/3 lg:w-1/2">
            <StockSearchBar />
          </div>
        </div>
        
        <TrendingSection />
        <MarketScreener />
        <CryptoDashboard/>
      </div>
    </main>
  );
}