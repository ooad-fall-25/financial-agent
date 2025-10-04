"use client";
import { NewsSummary } from "@/generated/prisma";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { NewsDetail } from "../components/news-detail";
import { LibraryDetailAction } from "../components/library-detail-action";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useDownload } from "@/hooks/use-download";



interface Props {
    newsId: string;
}

export const LibraryDetailView = ({ newsId }: Props) => {
    const { downloadAsMarkdown, isDownloadingMD, downloadAsPDF, isDownloadingPDF } = useDownload();

    const trpc = useTRPC();
    const { data: news } = useSuspenseQuery(trpc.library.getOne.queryOptions({ newsId: newsId }))

    const handleDownloadAsMD = () => {
        downloadAsMarkdown("note", news.aiRepsonse);
    }

    const handleDownloadAsPDF = () => {
        downloadAsPDF("note", news.aiRepsonse);
    }

    return (

        <div className="relative h-full w-full min-h-0">
            <div
                className="absolute top-0 left-0 right-0 z-20 bg-background border-b border-primary p-4"
                role="banner"
            >
                <Button asChild variant="ghost" className="hover:border">
                    <Link href={`/library`} className="flex items-center gap-2">
                        <ArrowLeftIcon /> Library
                    </Link>
                </Button>
            </div>

            {news ? (
                <div className="absolute top-0 bottom-0 left-0 right-0 pt-16 min-h-0">
                    <div className="grid grid-cols-8 h-full min-h-0 text-sm">

                        <div className="col-span-5 flex flex-col min-h-0 border-r border-primary">
                            <div className="flex-1 overflow-y-auto min-h-0 p-8">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-muted-foreground">
                                        AI generated summary report
                                    </h1>
                                    <Button variant="outline" onClick={handleDownloadAsPDF}>
                                        <span>Download as PDF</span>
                                    </Button>
                                </div>
                                <div className="p-8">
                                    <AIResponse>
                                        {news.aiRepsonse}
                                    </AIResponse>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <div className="flex flex-col px-4 py-8 border-b border-primary">
                                    <NewsDetail news={news} />
                                </div>
                                <div>
                                    <LibraryDetailAction newsId={news.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                <div className="flex-1 flex items-center justify-center">
                    No AI Summary
                </div>
            )}
        </div>
    )
}