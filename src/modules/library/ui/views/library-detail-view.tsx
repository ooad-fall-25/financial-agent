"use client";
import { NewsSummary } from "@/generated/prisma";
import { LibraryDetailHeader } from "../components/library-detail-header";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { NewsDetail } from "../components/news-detail";



interface Props {
    newsId: string;
}

export const LibraryDetailView = ({ newsId }: Props) => {
    const trpc = useTRPC();
    const { data: news } = useSuspenseQuery(trpc.library.getOne.queryOptions({ newsId: newsId }))

    const mutation = useMutation(trpc.marketssssss.markdownToPdf.mutationOptions())
    const handleDownload = async (content: string) => {
        const result = await mutation.mutateAsync({ markdown: content });

        // Convert base64 -> Blob
        const pdfData = atob(result);
        const buffer = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
            buffer[i] = pdfData.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "markdown.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
    };
    return (

        <div className="flex flex-col w-full h-screen overflow-y-hidden">
            <LibraryDetailHeader />

            {news ? (
                <div className="grid grid-cols-8 flex-1 h-full text-xs" >
                    <div className="col-span-5 p-8 pb-20 h-full border-r border-primary overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h1 className="text-muted-foreground ">
                                AI generated summary report
                            </h1>
                            <Button variant="outline" onClick={() => handleDownload(news.aiRepsonse)}>
                                <span className="text-xs">Download as PDF</span>
                            </Button>
                        </div>
                        <div className="p-8">
                            <AIResponse>
                                {news.aiRepsonse}
                            </AIResponse>
                        </div>
                    </div>

                    <div className="col-span-3 h-full overflow-y-auto px-4 py-8">
                        <NewsDetail news={news}/>
                    </div>
                </div>
            ) : (
                <div>
                    No AI Summary
                </div>
            )}



        </div>
    )
}