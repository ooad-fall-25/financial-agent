"use client"

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader, StarsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AskAINewsLinkDialog } from "./ask-ai-news-link-dialog";

interface Props {
    marketCategory: string;
    provider: string;
}
interface DialogDataProps {
    providerName: string;
    url: string;
    category: string;
    headline: string;
    summary: string;
}

export const MarketNewsTable = ({ marketCategory, provider }: Props) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<DialogDataProps | null>(null);

    const openDialog = (data: DialogDataProps) => {
        setDialogData(data);
        setIsDialogOpen(true);
    };

    return (
        <>
            {provider === "polygon" ? (
                <PolygonNewsTable openDialog={openDialog} />

            ) : (
                <FinnhubNewsTable marketCategory={marketCategory} openDialog={openDialog} />

            )}
            <AskAINewsLinkDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                providerName={dialogData?.providerName || ""}
                url={dialogData?.url || ""}
                category={dialogData?.category || ""}
                headline={dialogData?.headline || ""}
                summary={dialogData?.summary || ""}
            />

        </>
    )
}

interface FinnhubProps {
    marketCategory: string;
    openDialog: (data: DialogDataProps) => void;
}

const FinnhubNewsTable = ({ marketCategory, openDialog }: FinnhubProps) => {
    const trpc = useTRPC();
    const { data: marketNews, isLoading } = useQuery(trpc.marketssssss.getMarketNews.queryOptions(
        {
            category: marketCategory,
        }
    ));

    return (
        <div className="w-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 grid grid-cols-13 gap-4 p-3 bg-background border-none font-semibold text-sm text-muted-foreground">
                <div className="col-span-4">Headline</div>
                <div className="col-span-5">Summary</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-1">Link</div>
                <div className="col-span-1">Ask</div>
            </div>

            {/* Content */}
            {isLoading ? (
                <Loader className="animate-spin mx-auto bg-none" />
            ) : (
                <div className="divide-y divide-border">
                    {marketNews?.map((news) => (
                        <div key={news.id} className="grid grid-cols-13 gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="col-span-4">
                                <div className="font-medium text-sm text-foreground leading-tight">
                                    <p>{news.headline}</p>
                                </div>
                            </div>
                            <div className="col-span-5">
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                    {news.summary}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-xs text-muted-foreground truncate">
                                    {news.source}
                                </div>
                            </div>
                            <div className="col-span-1">
                                <Button
                                    variant="ghost"
                                    className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group"
                                    size="icon"
                                >
                                    <Link
                                        href={news.url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink
                                            size={16}
                                            className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out"
                                        />
                                    </Link>
                                </Button>
                            </div>
                            <div className="col-span-1">
                                <Button
                                    onClick={() => openDialog({
                                        providerName: "Finnhub",
                                        url: news.url || "#",
                                        category: news.category || "",
                                        headline: news.headline || "",
                                        summary: news.summary || "",
                                    })}
                                    variant="ghost"
                                    className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group"
                                    size="icon"
                                >
                                    <StarsIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

interface PolygonProps {
    openDialog: (data: DialogDataProps) => void;
}

const PolygonNewsTable = ({ openDialog }: PolygonProps) => {
    const trpc = useTRPC();
    const { data: marketNews, isLoading } = useQuery(trpc.marketssssss.getPolygonStockNews.queryOptions());

    return (
        <div className="w-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 grid grid-cols-13 gap-4 p-3 bg-background border-none font-semibold text-sm text-muted-foreground">
                <div className="col-span-4">Headline</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Related</div>
                <div className="col-span-1">Link</div>
                <div className="col-span-1">Ask</div>
            </div>

            {/* Content */}
            {isLoading ? (
                <Loader className="animate-spin mx-auto bg-none" />
            ) : (
                <div className="divide-y divide-border">
                    {marketNews?.map((news) => (
                        <div key={news.id} className="grid grid-cols-13 gap-4 p-4 hover:bg-muted/50 transition-colors">
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
                                <Button
                                    variant="ghost"
                                    className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group"
                                    size="icon"
                                >
                                    <Link
                                        href={news.article_url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink
                                            size={16}
                                            className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out"
                                        />
                                    </Link>
                                </Button>
                            </div>
                            <div className="col-span-1">
                                <Button
                                    onClick={() => openDialog({
                                        providerName: "Polygon",
                                        url: news.article_url || "#",
                                        category: "Stock",
                                        headline: news.title || "",
                                        summary: news.description || "",
                                    })}
                                    variant="ghost"
                                    className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group"
                                    size="icon"
                                >
                                    <StarsIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}