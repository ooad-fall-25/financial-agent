import { NewsSummary } from "@/generated/prisma"
import { format } from "date-fns";
import { InfoIcon } from "lucide-react";

interface Props {
    news: NewsSummary;
}

export const NewsDetail = ({ news }: Props) => {
    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-start gap-x-4 text-sm pb-8">
                <InfoIcon className="size-4" />
                <span>Detail</span>
            </div>

            <div className="grid grid-cols-6">
                <div className="col-span-2 text-muted-foreground">
                    <span>Headline</span>
                </div>
                <div className="col-span-4">
                    <span>{news.headline}</span>
                </div>
            </div>

            <div className="grid grid-cols-6">
                <div className="col-span-2 text-muted-foreground">
                    <span>Category</span>
                </div>
                <div className="col-span-4">
                    <span>{news.category}</span>
                </div>
            </div>

            <div className="grid grid-cols-6">
                <div className="col-span-2 text-muted-foreground">
                    <span>Language</span>
                </div>
                <div className="col-span-4">
                    <span>{news.language}</span>
                </div>
            </div>

            <div className="grid grid-cols-6">
                <div className="col-span-2 text-muted-foreground">
                    <span>Provider</span>
                </div>
                <div className="col-span-4">
                    <span>{news.provider}</span>
                </div>
            </div>

            <div className="grid grid-cols-6">
                <div className="col-span-2 text-muted-foreground">
                    <span>Created Date</span>
                </div>
                <div className="col-span-4">
                    <span>{format(news.createdAt, "HH:mm 'on' MMM dd, yyyy")}</span>
                </div>
            </div>
        </div>
    )
}