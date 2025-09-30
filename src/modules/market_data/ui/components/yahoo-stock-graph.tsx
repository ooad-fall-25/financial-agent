"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo } from 'react';

// ========================================================================
// 1. Types and Props (CORRECTED)
// ========================================================================
interface Props {
    Ticker: string;
    Range: string;
    Interval: string;
}

// CORRECTION: This interface now exactly matches the raw data from your API.
// Alpaca uses lowercase, single-letter keys.
interface AlpacaBar {
    t: string; // Timestamp
    o: number; // OpenPrice
    h: number; // HighPrice
    l: number; // LowPrice
    c: number; // ClosePrice
    v: number; // Volume
}

// This interface is fine as it's the target for our transformation.
interface ChartDataPoint {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}


// ========================================================================
// 2. Custom Tooltip (No changes needed)
// ========================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-4 bg-background border border-border rounded-lg shadow-lg text-sm">
                <p className="font-bold">{`Date: ${data.date}`}</p>
                <p>{`Open: $${data.open.toFixed(2)}`}</p>
                <p>{`Close: $${data.close.toFixed(2)}`}</p>
                <p>{`High: $${data.high.toFixed(2)}`}</p>
                <p>{`Low: $${data.low.toFixed(2)}`}</p>
                <p>{`Volume: ${data.volume.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};


// ========================================================================
// 3. The Main Chart Component (With CORRECTED Data Transformation)
// ========================================================================
export const StockChart = ({ Ticker, Range, Interval }: Props) => {
    const trpc = useTRPC();

    // --- Step 1: Fetch the Raw Data (No change needed here) ---
    const { data: rawStockData, isLoading, isError } = useQuery({ 
        ...trpc.AlpacaData.fetchStockData.queryOptions({ 
            ticker: Ticker, 
            range: Range, 
            interval: Interval, 
        }), 
        refetchInterval: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000 
    });

    // --- Step 2: Transform the Data (CORRECTED) ---
    const chartData = useMemo(() => {
        if (!rawStockData) return [];

        // CORRECTION: We now map from the correct source properties (t, o, c, h, l, v).
        return rawStockData.map((bar: AlpacaBar) => {
            const date = new Date(bar.t); // Use bar.t instead of bar.Timestamp
            let formattedDate = '';

            if (['1d', '5d'].includes(Range)) {
                formattedDate = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date);
            } else {
                formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
            }

            return {
                date: formattedDate,
                open: bar.o,   // Use bar.o
                close: bar.c,  // Use bar.c
                high: bar.h,   // Use bar.h
                low: bar.l,    // Use bar.l
                volume: bar.v, // Use bar.v
            };
        });
    }, [rawStockData, Range]);

    // The rest of your component logic from here down is perfectly fine and needs no changes.
    const customTicks = useMemo(() => {
        if (!chartData || !['1y', '5y', 'max', 'ytd'].includes(Range)) return undefined;
        const ticks = [];
        const years = new Set<string>();
        for (const dataPoint of chartData) {
            const year = dataPoint.date.slice(-4);
            if (!years.has(year)) {
                years.add(year);
                ticks.push(dataPoint.date);
            }
        }
        return ticks;
    }, [chartData, Range]);

    const getXAxisTickFormatter = () => {
        if (['1y', '5y', 'max', 'ytd'].includes(Range)) return (dateStr: string) => dateStr.slice(-4);
        return (dateStr: string) => dateStr;
    };
    const xAxisTickFormatter = getXAxisTickFormatter();

    if (isLoading) return <div className="h-96 flex items-center justify-center">Loading chart data...</div>;
    if (isError || !chartData || chartData.length === 0) return <div className="h-96 flex items-center justify-center text-red-500">Error or no data available for chart.</div>;

    // --- Step 3: Display the Transformed Data (No change needed here) ---
    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        ticks={customTicks}
                        tickFormatter={xAxisTickFormatter}
                    />
                    <YAxis 
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                        tick={{ fontSize: 12 }}
                        domain={['dataMin', 'dataMax']}
                        orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="close" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}