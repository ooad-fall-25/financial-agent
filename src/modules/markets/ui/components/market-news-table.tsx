"use client"

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader, LogOut, StarsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AskAINewsLinkDialog } from "./ask-ai-news-link-dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MarketNews } from "@/lib/news-summary";

interface Props {
    marketCategory: string;
    marketType: string;
    ticker?: string;
}
interface DialogDataProps {
    providerName: string;
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
            <NewsTable marketCategory={marketCategory} openDialog={openDialog} ticker={ticker} marketType={marketType}/>
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
                                             
interface NewsProps {
    marketCategory: string;
    openDialog: (data: DialogDataProps) => void;
    ticker?: string;
    marketType: string;
}

const NewsTable = ({ marketCategory, openDialog, ticker, marketType}: NewsProps) => {
    const trpc = useTRPC();
    const [marketNews, setMarketNews] = useState<MarketNews[]>(); 


    const {data: News, isLoading} = useQuery(trpc.marketssssss.getMarketNews.queryOptions({
        category: marketCategory, marketType: marketType
    },
    ))
    
    const {data: USCompanyNews, isLoading: isCompanyLoading } = useQuery(trpc.marketssssss.getUSCompanyNews.queryOptions({
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
                <Loader className="animate-spin mx-auto bg-none" />
            ) : (
                <div className="divide-y divide-border">
                    {marketNews?.map((news) => (
                        <div key={news.id} className="grid grid-cols-28 gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="col-span-5 flex items-center justify-center">
                                <Link
                                    href={news.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block overflow-hidden rounded-md" // Added group and overflow-hidden for animation
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
                                        providerName: marketType,
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

                                                        // POLYGON //

// interface PolygonProps {
//     openDialog: (data: DialogDataProps) => void;
//     ticker?: string;
// }

// const PolygonNewsTable = ({ openDialog, ticker }: PolygonProps) => {
//     const trpc = useTRPC();
//     // Conditional query based on ticker
//     const { data: marketNews, isLoading } = useQuery(
//         ticker
//             ? trpc.marketssssss.getPolygonCompanyNews.queryOptions({ ticker })
//             : trpc.marketssssss.getPolygonStockNews.queryOptions(),
//     );


//     // State to manage visibility of all tickers for each news item
//     const [showAllTickers, setShowAllTickers] = useState<{ [key: string]: boolean }>({});

//     const toggleShowAllTickers = (id: string) => {
//         setShowAllTickers(prev => ({
//             ...prev,
//             [id]: !prev[id]
//         }));
//     };

//     const TICKER_LIMIT = 10;

//     if (ticker === "") {
//         return <div className="text-center p-10 translate-y-50">Search a Company!</div>;
//     }

//     if (!isLoading && marketNews?.length === 0) {
//         return <div className="text-center p-10 translate-y-50">Sorry, result not found~</div>;
//     }

//     return (
//         <div className="w-full">
//             {/* Content */}
//             {isLoading ? (
//                 <Loader className="animate-spin mx-auto bg-none" />
//             ) : (
//                 <div className="divide-y divide-border">
//                     {marketNews?.map((news) => (
//                         <div key={news.id} className="grid grid-cols-28 gap-4 p-4 hover:bg-muted/50 transition-colors">
//                             <div className="col-span-5 flex items-center justify-center">
//                                 <Link
//                                     href={news.article_url || "#"}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="group block overflow-hidden rounded-md"
//                                 >
//                                     <Image
//                                         src={news.image_url || "/logo.png"} 
//                                         alt="News Image"
//                                         width={180} 
//                                         height={120} 
//                                         className="object-cover rounded-md aspect-video transition-transform duration-300 ease-out group-hover:scale-105"
//                                     />
//                                 </Link>
//                             </div>
//                             <div className="col-span-9">
//                                 <div className="font-medium text-foreground leading-tight">
//                                     <Link
//                                         href={news.article_url || "#"}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="hover:text-blue-500 transition-colors"
//                                     >
//                                         <p>{news.title}</p>
//                                     </Link>
//                                 </div>
//                                 {/* Stock buttons for Polygon */}
//                                 <div className="mt-2 flex flex-wrap gap-2">
//                                     {news.tickers && news.tickers.length > 0 && (
//                                         <>
//                                             {(showAllTickers[news.id] ? news.tickers : news.tickers.slice(0, TICKER_LIMIT)).map((ticker) => (
//                                                 <Link href={`market-data/${ticker}`} key={ticker}>
//                                                     <Badge key={ticker} variant="secondary" className="transition-transform hover:scale-110 cursor-pointer">
//                                                         {ticker}
//                                                     </Badge>
//                                                 </Link>
//                                             ))}
//                                             {news.tickers.length > TICKER_LIMIT && !showAllTickers[news.id] && (
//                                                 <Button
//                                                     variant="outline"
//                                                     size="sm"
//                                                     className="h-6 px-2 text-xs"
//                                                     onClick={() => toggleShowAllTickers(news.id)}
//                                                 >
//                                                     ...
//                                                 </Button>
//                                             )}
//                                             {news.tickers.length > TICKER_LIMIT && showAllTickers[news.id] && (
//                                                 <Button
//                                                     variant="outline"
//                                                     size="sm"
//                                                     className="h-6 px-2 text-xs"
//                                                     onClick={() => toggleShowAllTickers(news.id)}
//                                                 >
//                                                     Show Less
//                                                 </Button>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="col-span-9">
//                                 <div className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
//                                     {news.description}
//                                 </div>
//                             </div>
//                             <div className="col-span-4">
//                                 <div className="text-sm text-muted-foreground truncate">
//                                     {/* {news.tickers.join("  ")} */ news.publisher.name}
//                                 </div>
//                             </div>
//                             <div className="col-span-1">
//                                 <Button
//                                     onClick={() => openDialog({
//                                         providerName: "Polygon",
//                                         url: news.article_url || "#",
//                                         category: "Stock",
//                                         headline: news.title || "",
//                                         summary: news.description || "",
//                                     })}
//                                     variant="ghost"
//                                     className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group"
//                                     size="icon"
//                                 >
//                                     <StarsIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out" />
//                                 </Button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//         </div>
//     );
// }

//                                                         // ALPACA //
 
// interface AlpacaProps {
//     openDialog: (data: DialogDataProps) => void;
//     ticker?: string;
// }

// const AlpacaNewsTable = ({ openDialog, ticker }: AlpacaProps) => {
//     const trpc = useTRPC();
//     // Conditional query based on ticker
//     const { data: marketNews, isLoading } = useQuery(
//         ticker
//             ? trpc.AlpacaData.fetchStockNews.queryOptions({ ticker: ticker, limit: 50 })
//             : trpc.AlpacaData.fetchStockNews.queryOptions({ limit: 50 }),
//     );


//     // State to manage visibility of all tickers for each news item
//     const [showAllTickers, setShowAllTickers] = useState<{ [key: string]: boolean }>({});

//     const toggleShowAllTickers = (id: number) => {
//         setShowAllTickers(prev => ({
//             ...prev,
//             [id]: !prev[id]
//         }));
//     };

//     if (ticker === "") {
//         return <div className="text-center p-10 translate-y-50">Search a Company!</div>;
//     }

//     if (!isLoading && marketNews?.length === 0) {
//         return <div className="text-center p-10 translate-y-50">Sorry, result not found~</div>;
//     }

//     const TICKER_LIMIT = 10;

//     return (
//         <div className="w-full">
//             {/* Content */}
//             {isLoading ? (
//                 <Loader className="animate-spin mx-auto bg-none" />
//             ) : (
//                 <div className="divide-y divide-border">
//                     {marketNews?.map((news) => (
//                         <div key={news.id} className="grid grid-cols-28 gap-4 p-4 hover:bg-muted/50 transition-colors">
//                             <div className="col-span-5 flex items-center justify-center">
//                                 <Link
//                                     href={news.url || "#"}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="group block overflow-hidden rounded-md"
//                                 >
//                                     <Image
//                                         src={
//                                             news.images
//                                                 ? (news.images.find(img => img.size === "large")?.url || "/logo.png")
//                                                 : "/logo.png"
//                                         }
//                                         alt="News Image"
//                                         width={180} 
//                                         height={120} 
//                                         className="object-cover rounded-md aspect-video transition-transform duration-300 ease-out group-hover:scale-105"
//                                     />
//                                 </Link>
//                             </div>
//                             <div className="col-span-9">
//                                 <div className="font-medium text-foreground leading-tight">
//                                     <Link
//                                         href={news.url || "#"}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="hover:text-blue-500 transition-colors"
//                                     >
//                                         <p>{news.headline}</p>
//                                     </Link>
//                                 </div>
//                                 {/* Stock buttons for Polygon */}
//                                 <div className="mt-2 flex flex-wrap gap-2">
//                                     {news.symbols && news.symbols.length > 0 && (
//                                         <>
//                                             {(showAllTickers[news.id] ? news.symbols : news.symbols.slice(0, TICKER_LIMIT)).map((ticker) => (
//                                                 <Link href={`market-data/${ticker}`} key={ticker}>
//                                                     <Badge key={ticker} variant="secondary" className="transition-transform hover:scale-110 cursor-pointer">
//                                                         {ticker}
//                                                     </Badge>
//                                                 </Link>
//                                             ))}
//                                             {news.symbols.length > TICKER_LIMIT && !showAllTickers[news.id] && (
//                                                 <Button
//                                                     variant="outline"
//                                                     size="sm"
//                                                     className="h-6 px-2 text-xs"
//                                                     onClick={() => toggleShowAllTickers(news.id)}
//                                                 >
//                                                     ...
//                                                 </Button>
//                                             )}
//                                             {news.symbols.length > TICKER_LIMIT && showAllTickers[news.id] && (
//                                                 <Button
//                                                     variant="outline"
//                                                     size="sm"
//                                                     className="h-6 px-2 text-xs"
//                                                     onClick={() => toggleShowAllTickers(news.id)}
//                                                 >
//                                                     Show Less
//                                                 </Button>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="col-span-9">
//                                 <div className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
//                                     {news.summary}
//                                 </div>
//                             </div>
//                             <div className="col-span-4">
//                                 <div className="text-sm text-muted-foreground truncate">
//                                     {news.author}
//                                 </div>
//                             </div>
//                             <div className="col-span-1">
//                                 <Button
//                                     onClick={() => openDialog({
//                                         providerName: "Alpaca",
//                                         url: news.url || "#",
//                                         category: "Stock",
//                                         headline: news.headline || "",
//                                         summary: news.summary || "",
//                                     })}
//                                     variant="ghost"
//                                     className="hover:bg-transparent hover:scale-x-105 transition-all duration-300 ease-out group"
//                                     size="icon"
//                                 >
//                                     <StarsIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-sm transition-all duration-300 ease-out" />
//                                 </Button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//         </div>
//     );
// }


