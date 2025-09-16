"use client"
"use client"

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader } from "lucide-react";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Props {
    Ticker: string;
}

export const YahooStockTable = ({ Ticker }: Props) => {
    // 1. Get the tRPC client instance
    const trpc = useTRPC();

    // 2. Fetch the stock data using the correct tRPC procedure.
    //    We rename 'data' to 'stockData' for clarity.
    const { data: stockData, isLoading, isError } = useQuery(trpc.YahooMarket.fetchStockData.queryOptions(
        {
            ticker: Ticker,
        }
    ));;

    // Handle loading and error states for a better user experience
    if (isLoading) {
        return <div>Loading stock data...</div>;
    }

    if (isError) {
        return <div>Error fetching stock data.</div>;
    }

    return (
        <Table>
            <TableCaption>Daily stock data for {Ticker} over the last 10 days.</TableCaption>
            <TableHeader>
                {/* 3. Define the table headers to match your stock data */}
                <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Open</TableHead>
                    <TableHead>Close</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* 4. Map over the 'stockData' array to create a row for each day */}
                {stockData?.map((stock) => (
                    <TableRow key={stock.timestamp}>
                        {/* 5. Populate the cells with the correct data from the 'stock' object */}
                        <TableCell className="font-medium">{stock.date}</TableCell>
                        <TableCell>${stock.open.toFixed(2)}</TableCell>
                        <TableCell>${stock.close.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}