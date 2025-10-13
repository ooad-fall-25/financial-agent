"use client";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { NewsDetail } from "../components/news-detail";
import { LibraryDetailAction } from "../components/library-detail-action";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSettingsStore } from "@/stores/settings-store";
import { toast } from "sonner";
import { useEffect, useState } from "react";



interface Props {
    summaryId: string;
}

export const LibraryDetailView = ({ summaryId }: Props) => {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") ?? "category";
    const [displayContent, setDisplayContent] = useState<string>("");

    const trpc = useTRPC();
    const { data: news } = useSuspenseQuery(trpc.library.getOne.queryOptions({ summaryId: summaryId }))

    useEffect(() => {
        if (displayContent.length == 0) {
            setDisplayContent(news.aiRepsonse);
        }
    }, [news])

    return (

        <div className="relative h-full w-full min-h-0">
            <div
                className="absolute top-0 left-0 right-0 z-20 bg-background border-b border-primary p-4"
                role="banner"
            >
                <Button asChild variant="ghost">
                    <Link href={`/library?type=${type}`} className="flex items-center gap-2">
                        <ChevronLeftIcon className="size-6" />
                        <span className="font-semibold text-xl">Library</span>
                    </Link>
                </Button>
            </div>

            {news ? (
                <div className="absolute top-0 bottom-0 left-0 right-0 pt-16 min-h-0">
                    <div className="grid grid-cols-8 h-full min-h-0 text-sm">

                        <div className="col-span-5 flex flex-col min-h-0 border-r border-primary">
                            <div className="flex-1 overflow-y-auto min-h-0 p-8">
                                <div className="flex items-center justify-start">
                                    <h1 className="text-muted-foreground">
                                        AI generated summary report
                                    </h1>
                                </div>
                                <div className="p-8">
                                    <AIResponse>
                                        {displayContent}
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
                                    <LibraryDetailAction summaryId={news.id} content={displayContent} setDisplayContent={setDisplayContent}/>
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