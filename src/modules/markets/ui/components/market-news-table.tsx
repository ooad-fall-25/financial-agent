"use client"

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader } from "lucide-react";

interface Props {
    marketCategory: string;
    provider: string;
}
export const MarketNewsTable = ({ marketCategory, provider }: Props) => {
    if (provider === "finnhub") {
        return (
            <FinnhubNewsTable marketCategory={marketCategory}/>
        )
    } else if (provider === "polygon") {
        return (
            <PolygonNewsTable />
        )
    } else {
        return (
            <FinnhubNewsTable marketCategory={marketCategory}/>
        )
    }
}

const FinnhubNewsTable = ({ marketCategory }: { marketCategory: string }) => {
    const trpc = useTRPC();
    const { data: marketNews, isLoading } = useQuery(trpc.marketssssss.getMarketNews.queryOptions(
        {
            category: marketCategory,
        }
    ));

    return (
        <div className="w-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 p-3 bg-background border-none font-semibold text-sm text-muted-foreground">
                <div className="col-span-4">Headline</div>
                <div className="col-span-5">Summary</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-1">Link</div>
            </div>

            {/* Content */}
            {isLoading ? (
                <Loader className="animate-spin mx-auto bg-none" />
            ) : (
                <div className="divide-y divide-border">
                    {marketNews?.map((news) => (
                        <div key={news.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="col-span-4">
                                <div className="font-medium text-foreground leading-tight">
                                    <p>{news.headline}</p>
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
                                <Link
                                    href={news.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

const PolygonNewsTable = () => {
    const trpc = useTRPC();
    const { data: marketNews, isLoading } = useQuery(trpc.marketssssss.getPolygonStockNews.queryOptions());

    return (
        <div className="w-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 p-3 bg-background border-none font-semibold text-sm text-muted-foreground">
                <div className="col-span-4">Headline</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Related</div>
                <div className="col-span-1">Link</div>
            </div>

            {/* Content */}
            {isLoading ? (
                <Loader className="animate-spin mx-auto bg-none"/>
            ) : (
            <div className="divide-y divide-border">
                {marketNews?.map((news) => (
                    <div key={news.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="col-span-4">
                            <div className="font-medium text-foreground leading-tight">
                                <p>{news.title}</p>
                            </div>
                        </div>
                        <div className="col-span-5">
                            <div className="text-sm text-muted-foreground leading-relaxed">
                                {news.description}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-sm text-muted-foreground truncate">
                                {news.tickers.join("  ")}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <Link
                                href={news.article_url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ExternalLink size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            )}

        </div>
    );
}