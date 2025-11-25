"use client"

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { StarsIcon, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AskAINewsLinkDialog } from "./ask-ai-news-link-dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MarketNews } from "@/lib/news-summary";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

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
    const query = useQueryClient();
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

    const { data: pinnedNewsData } = useQuery({
        ...trpc.HomeData.getAllPinnedNews.queryOptions(),
        refetchOnWindowFocus: false,
    });

    const pinMutation = useMutation({
        ...trpc.HomeData.pinNews.mutationOptions(),
        onSuccess: () => {
            query.invalidateQueries(trpc.HomeData.getAllPinnedNews.queryOptions());
            toast.success("News pinned successfully");
        },
    });

    const unpinMutation = useMutation({
        ...trpc.HomeData.unpinNews.mutationOptions(),
        onSuccess: () => {
            query.invalidateQueries(trpc.HomeData.getAllPinnedNews.queryOptions());
            toast.success("News unpinned");
        },
    });

    const formatRelativeTime = (datetime: number | string | undefined): string => {
        if (!datetime) {
            return "Recently";
        }

        let newsDate: Date;

        if (typeof datetime === 'number') {
            newsDate = new Date(datetime * 1000); 
        } else {
            newsDate = new Date(datetime); 
        }

        if (isNaN(newsDate.getTime())) {
            return datetime.toString(); 
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - newsDate.getTime()) / 1000);
        
        if (diffInSeconds < 0) return "Just now"; // Handle minor clock differences
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }

    const handlePinToggle = (news: MarketNews) => {
        const existingPin = pinnedNewsData?.find((p) => p.url === news.url);
        
        if (existingPin) {
            unpinMutation.mutate({ newsId: existingPin.id });
        } else {

            if (pinnedNewsData && pinnedNewsData.length >= 10) {
                toast.error("Maximum pin limit (10) reached.");
                return; 
            }

            let timeString = formatRelativeTime(news.datetime);

            pinMutation.mutate({
                title: news.headline || "No Title",
                url: news.url || "#",
                source: news.source || "Unknown Source",
                time: timeString,
                summary: news.summary || ""
            });
        }
    };

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
                    {marketNews?.map((news) => {
                        // Check if this specific item is pinned
                        const isPinned = pinnedNewsData?.some((p) => p.url === news.url);

                        return (
                            <div key={news.id} className="grid grid-cols-28 gap-4 p-4 hover:bg-muted/50 transition-colors flex items-center justify-center">
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
                                    <div className="font-medium text-base text-foreground leading-tight">
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
                                <div className="col-span-10 flex items-center justify-center">
                                    <div className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                                        {news.summary}
                                    </div>
                                </div>
                                <div className="col-span-3 flex items-center justify-center">
                                    <div className="text-sm text-muted-foreground truncate">
                                        {news.source}
                                    </div>
                                </div>
                                
                                {/* Action Buttons Column */}
                                <div className="col-span-1 flex flex-col gap-2 justify-center items-center">
                                    {/* Ask AI Button */}
                                    <Button
                                        onClick={() => openDialog({
                                            marketType: marketType,
                                            url: news.url || "#",
                                            category: news.category || "",
                                            headline: news.headline || "",
                                            summary: news.summary || "",
                                        })}
                                        variant="ghost"
                                        className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group h-8 w-8 p-0"
                                        size="icon"
                                        title="Ask AI"
                                    >
                                        <StarsIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out" />
                                    </Button>

                                    {/* Pin Button */}
                                    <Button
                                        onClick={() => handlePinToggle(news)}
                                        variant="ghost"
                                        className="hover:bg-transparent hover:scale-110 transition-all duration-300 ease-out group h-8 w-8 p-0"
                                        size="icon"
                                        title={isPinned ? "Unpin news" : "Pin news"}
                                    >
                                        <Pin 
                                            className={`h-4 w-4 transition-all duration-300 ease-out ${
                                                isPinned 
                                                ? "text-yellow-500 fill-yellow-400" 
                                                : "text-muted-foreground group-hover:text-primary"
                                            }`} 
                                        />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}