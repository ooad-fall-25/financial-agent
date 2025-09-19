// src/app/discovery/page.tsx
// This file is now the "view". It assembles the components.

// Since this page uses client components, we need a client-side entry point.
// We can wrap the components in a single client component or make the page itself one.
// For simplicity, let's make the page the client entry point.
'use client';

import React from 'react';


import { MarketScreener, TrendingSection } from "../components/discovery-page"; 

// This is the main view component for the /discovery route.
export default function DiscoveryPage() {
  return (
    <main className="bg-gray-900 text-white p-4 md:p-8 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Stocks</h1>
        
        {/* Render the Trending Section component */}
        <TrendingSection />
        
        {/* Render the Market Screener component */}
        <MarketScreener />
        
      </div>
    </main>
  );
}