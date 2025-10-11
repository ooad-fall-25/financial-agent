"use client";

import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { NewsSummary } from "@/generated/prisma";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { SearchIcon, TablePropertiesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface Props {
    selectedTab: string;
}

export const LibraryTable = ({ selectedTab }: Props) => {
    const trpc = useTRPC();
    // TODO: consider using useInfiniteQuery
    const { data: newsByCategory, isLoading: isCategoryLoading } = useQuery(trpc.library.getAllSummaryByCategory.queryOptions());
    const { data: newsByIndividual, isLoading: isIndividualLoading } = useQuery(trpc.library.getAllSummaryByIndividualLink.queryOptions());

    if (selectedTab === "category") {
        return <SummaryByTable data={newsByCategory || []} isLoading={isCategoryLoading} type={selectedTab} />
    } else if (selectedTab === "individual") {
        return <SummaryByTable data={newsByIndividual || []} isLoading={isIndividualLoading} type={selectedTab} />
    } else {
        return;
    }
}

interface TableProps {
    data: NewsSummary[];
    isLoading: boolean;
    type: string;
}

const SummaryByTable = ({ data, isLoading, type }: TableProps) => {
    const router = useRouter();

    const [searchValue, setSearchValue] = useState("");
    const [filteredNews, setFilteredNews] = useState<NewsSummary[]>([]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        if (data) {
            setFilteredNews(data)
            if (value.length === 0) {
                setFilteredNews(data);
            } else {
                const result = data?.filter(news => news.headline.toLowerCase().includes(value.toLowerCase()));
                setFilteredNews(result);
            }
        }
    }

    useEffect(() => {
        setFilteredNews(data || []);
    }, [data]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 flex items-center justify-start gap-x-4">
                <div className="flex items-center relative w-full max-w-xs">
                    <div className="absolute left-4 flex items-center justify-center gap-x-2 ">
                        <SearchIcon className=" h-4 w-4" />
                        <span className="items-center text-xs">Input</span>
                    </div>
                    <Input
                        onChange={(e) => handleSearchChange(e.target.value)}
                        value={searchValue}
                        placeholder="Headline..."
                        className="pl-20 h-8 !items-center border-2 !text-xs rounded-full !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    />
                </div>

                <div>
                    <span className="text-xs">Result: </span>
                    <span className="text-xs">{filteredNews.length || 0}</span>
                </div>
            </div>

            <div className="flex-shrink-0 sticky top-0 z-10 grid grid-cols-16 gap-4 px-4 py-1 bg-sidebar border-none font-normal text-xs text-muted-foreground">
                <div className="col-span-10">Headline</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Language</div>
                <div className="col-span-2">Date</div>
            </div>

            {isLoading ? (
                <div className="my-8">
                    <Spinner className="mx-auto bg-none" />
                </div>
            ) : (
                <div>
                    {data.length != 0 ? (
                        <div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="divide-y divide-border text-xs font-normal border-b border-border">
                                    {filteredNews.map((item) => (
                                        <div key={item.id} onClick={() => router.push(`/library/${item.id}?type=${type}`)} className="grid grid-cols-16 gap-4 px-4 py-2.5 hover:bg-sidebar hover:cursor-pointer transition-colors items-center">
                                            <div className="col-span-10">
                                                <div className="font-medium leading-tight truncate">
                                                    <p>{item.headline}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-muted-foreground leading-relaxed">
                                                    {item.category}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-muted-foreground leading-relaxed">
                                                    {item.language}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-muted-foreground truncate">
                                                    {format(item.createdAt, "HH:mm 'on' MMM dd, yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 gap-y-4 items-center justify-center flex flex-col">
                            <TablePropertiesIcon />
                            <div className="gap-y-2 flex flex-col items-center">
                                <span className="text-sm">The summary will be loaded here</span>
                                <span className="text-xs text-muted-foreground">Generate one</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}
