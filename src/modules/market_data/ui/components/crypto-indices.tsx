"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import React, { useState } from "react"; // Import useState
import Image from "next/image"; // Import the Next.js Image component

// ========================================================================
// 1. Types and Helpers
// ========================================================================

interface CryptoData {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  volume24h: number;
  sparklineData: number[];
}

// Helper to get crypto icon URLs from coincap.io
const getCryptoIconUrl = (ticker: string): string => {
  const symbol = ticker.split('/')[0].toLowerCase();
  return `https://static.coincap.io/assets/icons/${symbol}@2x.png`;
};

// Helper to format the 24h volume number
const formatVolume = (volume: number, price: number): string => {
  const dollarVolume = volume * price;
  if (!dollarVolume || dollarVolume === 0) return '$--';
  if (dollarVolume >= 1e9) return `$${(dollarVolume / 1e9).toFixed(3)}B`;
  if (dollarVolume >= 1e6) return `$${(dollarVolume / 1e6).toFixed(3)}M`;
  return `$${dollarVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ========================================================================
// 2. Internal Sub-Components
// ========================================================================

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) {
    return (
      <div className="w-24 h-10 flex items-center justify-center">
        <p className="text-xs text-muted-foreground/50">N/A</p>
      </div>
    );
  }
  const chartData = data.map(price => ({ price }));
  const gradientId = `color-${color.replace('#', '')}`;

  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <YAxis hide={true} domain={['dataMin', 'dataMax']} />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2} 
            fillOpacity={1} 
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Renders a single, simplified row in the crypto table, now with icons.
 */
const CryptoTableRow = ({ crypto, rank }: { crypto: CryptoData; rank: number }) => {
    const isPositive = crypto.percentChange >= 0;
    const chartColor = isPositive ? '#22c55e' : '#ef4444';
    
    // State to handle image loading errors and fallbacks
    const [imgSrc, setImgSrc] = useState(getCryptoIconUrl(crypto.symbol));
    const fallbackIconSrc = '/icons/fallback-crypto.svg'; 

    return (
    <tr key={crypto.symbol} className="border-b border-border last:border-b-0">
        <td className="py-4 px-4 text-muted-foreground">{rank}</td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <Image 
                    src={imgSrc} 
                    alt={`${crypto.symbol} logo`}
                    width={24} 
                    height={24} 
                    unoptimized 
                    onError={() => setImgSrc(fallbackIconSrc)} 
                />
                <span className="font-bold">{crypto.symbol}</span>
            </div>
        </td>
        <td className="py-4 px-4 text-right font-mono">${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
        <td className={`py-4 px-4 text-right font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{crypto.percentChange.toFixed(2)}%
        </td>
        <td className="py-4 px-4 text-right font-mono">{formatVolume(crypto.volume24h, crypto.price)}</td>
        
        {/* FIXED COLUMN BELOW: Added pl-8 and flex justify-end */}
        <td className="py-4 px-4 pl-8">
            <div className="flex justify-end">
                <Sparkline data={crypto.sparklineData} color={chartColor} />
            </div>
        </td>
    </tr>
  );
};

// ========================================================================
// 3. Main Exported Component
// ========================================================================
export const CryptoDashboard = () => {
  const trpc = useTRPC();
  const { data: cryptoList, isLoading, isError } = useQuery({
    ...trpc.AlpacaData.fetchCryptoList.queryOptions(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="h-96 w-full bg-muted rounded-lg animate-pulse my-8" />;
  }

  if (isError || !cryptoList) {
    return (
      <div className="my-8 p-4 bg-card border border-destructive/50 rounded-lg">
        <h2 className="text-xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">Could not load cryptocurrency data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Cryptocurrencies <ArrowRight className="inline" /></h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 px-4 font-normal text-left">#</th>
              <th className="py-2 px-4 font-normal text-left">Name</th>
              <th className="py-2 px-4 font-normal text-right">Price</th>
              <th className="py-2 px-4 font-normal text-right">24h %</th>
              <th className="py-2 px-4 font-normal text-right">24h Volume</th>
              {/* FIXED LINE BELOW: Added pl-8 and text-right */}
              <th className="py-2 px-4 pl-8 font-normal text-right">Last 24 Hours</th>
            </tr>
          </thead>
          <tbody>
            {cryptoList.map((crypto, index) => (
              <CryptoTableRow key={crypto.symbol} crypto={crypto} rank={index + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};