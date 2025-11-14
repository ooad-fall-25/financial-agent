"use client"

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { StarsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AskAINewsLinkDialog } from "./ask-ai-news-link-dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MarketNews } from "@/lib/news-summary";
import { Spinner } from "@/components/ui/spinner";

interface Props {
    marketCategory: string;
    marketType: string;
    ticker?: string;
}
interface DialogDataProps {
    marketType: string;
    url: string;
    category: string;
    headline: string;
    summary: string;
}

export const MarketNewsTable = ({ marketCategory, marketType, ticker }: Props) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<DialogDataProps | null>(null);

    const openDialog = (data: DialogDataProps) => {
        setDialogData(data);
        setIsDialogOpen(true);
    };

    return (
        <>
            <NewsTable marketCategory={marketCategory} openDialog={openDialog} ticker={ticker} marketType={marketType} />
            <AskAINewsLinkDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                marketType={dialogData?.marketType || ""}
                url={dialogData?.url || ""}
                category={dialogData?.category || ""}
                headline={dialogData?.headline || ""}
                summary={dialogData?.summary || ""}
            />

        </>
    )
}

interface NewsProps {
    marketCategory: string;
    openDialog: (data: DialogDataProps) => void;
    ticker?: string;
    marketType: string;
}

const NewsTable = ({ marketCategory, openDialog, ticker, marketType }: NewsProps) => {
    const trpc = useTRPC();
    const [marketNews, setMarketNews] = useState<MarketNews[]>();


    const { data: News, isLoading } = useQuery(trpc.marketNews.getMarketNews.queryOptions({
        category: marketCategory, marketType: marketType
    },
    ))

    const { data: USCompanyNews, isLoading: isCompanyLoading } = useQuery(trpc.marketNews.getUSCompanyNews.queryOptions({
        ticker: ticker || ""
    },
        {
            enabled: (marketCategory === "company" && !!ticker)
        }
    ))

    useEffect(() => {
        if (marketCategory === "company") {
            setMarketNews(USCompanyNews)
        } else {
            setMarketNews(News)
        }
    }, [marketCategory, News, USCompanyNews])


    if (marketCategory === "company" && !ticker) {
        return <div className="text-center p-10 translate-y-50">Search a Company!</div>;
    }

    if (!isCompanyLoading && USCompanyNews?.length === 0) {
        return <div className="text-center p-10 translate-y-50">Sorry, result not found~</div>;
    }

    return (
        <div className="w-full">

            {/* Content */}
            {isLoading ? (
                <Spinner className="mx-auto bg-none" />
            ) : (
                <div className="divide-y divide-border">
                    {marketNews?.map((news) => (
                        <div key={news.id} className="grid grid-cols-28 gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="col-span-5 flex items-center justify-center">
                                <Link
                                    href={news.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block overflow-hidden rounded-md"
                                >
                                    <Image
                                        src={news.imageUrl || "/logo.png"}
                                        alt="News Image"
                                        width={180}
                                        height={120}
                                        className="object-cover rounded-md aspect-video transition-transform duration-300 ease-out group-hover:scale-105"
                                    />
                                </Link>
                            </div>
                            <div className="col-span-9">
                                <div className="font-medium text-sm text-foreground leading-tight">
                                    <Link
                                        href={news.url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-500 transition-colors"
                                    >
                                        <p>{news.headline}</p>
                                    </Link>
                                </div>
                                {/* Badge for Finnhub Company News */}
                                {marketCategory === "company" && ticker && (
                                    <div className="mt-2">
                                        <Link href={`market-data/${ticker}`}>
                                            <Badge variant="secondary" className="transition-transform hover:scale-110 cursor-pointer">
                                                {ticker}
                                            </Badge>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-10">
                                <div className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                                    {news.summary}
                                </div>
                            </div>
                            <div className="col-span-3">
                                <div className="text-sm text-muted-foreground truncate">
                                    {news.source}
                                </div>
                            </div>
                            <div className="col-span-1">
                                <Button
                                    onClick={() => openDialog({
                                        marketType: marketType,
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