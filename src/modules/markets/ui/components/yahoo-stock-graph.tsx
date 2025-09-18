"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo } from 'react'; // <-- Import useMemo for performance

interface Props {
    Ticker: string;
    Range: string;
    Interval: string;
}

// Custom Tooltip component remains the same
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


export const YahooStockChart = ({ Ticker, Range, Interval }: Props) => {
    const trpc = useTRPC();

    const { data: stockData, isLoading, isError } = useQuery(trpc.YahooMarket.fetchStockData.queryOptions(
        {
            ticker: Ticker,
            range: Range,
            interval: Interval,
        }
    ));

    // --- NEW LOGIC TO GENERATE UNIQUE YEAR TICKS ---
    // 1. We use `useMemo` so this calculation only runs when the data or range changes.
    const customTicks = useMemo(() => {
        if (!stockData || !['1y', '5y', 'max', 'ytd'].includes(Range)) {
            // If we don't have data or it's not a long-term view, let Recharts decide the ticks.
            return undefined;
        }

        const ticks = [];
        const years = new Set<number>(); // Use a Set to track which years we've already added a tick for.

        for (const dataPoint of stockData) {
            const date = new Date(dataPoint.date);
            const year = date.getFullYear();

            // If we haven't seen this year before, add its date to our ticks array.
            if (!years.has(year)) {
                years.add(year);
                ticks.push(dataPoint.date);
            }
        }
        return ticks;
    }, [stockData, Range]); // Dependency array


    // Dynamic formatter logic remains the same as before
    const getXAxisTickFormatter = () => {
        if (['1y', '5y', 'max', 'ytd'].includes(Range)) {
            return (dateStr: string) => new Date(dateStr).getFullYear().toString();
        }
        if (['1d', '5d'].includes(Range)) {
            return (dateStr: string) => dateStr.split(', ')[1];
        }
        return (dateStr: string) => {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
        };
    };
    const xAxisTickFormatter = getXAxisTickFormatter();


    if (isLoading) {
        return <div className="h-96 flex items-center justify-center">Loading chart data...</div>;
    }

    if (isError || !stockData || stockData.length === 0) {
        return <div className="h-96 flex items-center justify-center text-red-500">Error or no data available for chart.</div>;
    }

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <LineChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    
                    <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        // --- APPLY THE CUSTOM TICKS ---
                        // 2. Pass our generated array to the `ticks` prop.
                        //    Recharts will now ONLY show labels at these specific points.
                        ticks={customTicks}
                        // The formatter is still needed to turn the full date string into just the year.
                        tickFormatter={xAxisTickFormatter}
                        // Remove the old interval prop as `ticks` gives us full control.
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