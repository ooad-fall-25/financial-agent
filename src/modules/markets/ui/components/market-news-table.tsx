"use client"

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Category } from "@/lib/finnhub";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Props {
    marketCategory: string;
}
export const MarketNewsTable = ({ marketCategory }: Props) => {
    const trpc = useTRPC();
    const { data: marketNews } = useQuery(trpc.marketssssss.getMarketNews.queryOptions(
        {
            category: marketCategory,
        }
    ));

    const {data: users} = useQuery(trpc.marketssssss.getAllUsers.queryOptions()); 

    return (
        <div className="w-full">
            <>
                {users?.map((user) => (
                    <p key={user.id}>{user.firstName}</p>
                ))}
            </>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 p-4 bg-background border-none font-semibold text-sm text-muted-foreground">
                <div className="col-span-4">Headline</div>
                <div className="col-span-5">Summary</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-1">Link</div>
            </div>

            {/* Content */}
            <div className="divide-y divide-border">
                {marketNews?.map((news) => (
                    <div key={news.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="col-span-4">
                            <div className="font-medium text-foreground leading-tight">
                                {news.headline}
                            </div>
                        </div>
                        <div className="col-span-5">
                            <div className="text-sm text-muted-foreground leading-relaxed">
                                {news.summary}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-sm text-muted-foreground truncate">
                                {news.source}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <a
                                href={news.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}