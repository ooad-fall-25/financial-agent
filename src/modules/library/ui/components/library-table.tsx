"use client";
interface Props {
    selectedTab: string;
}

export const LibraryTable = ({ selectedTab }: Props) => {
    if (selectedTab === "category") {
        return <SummaryByCategoryTable />
    } else if (selectedTab === "individual") {
        return <SummaryByIndividualLinkTable />
    } else {
        return;
    }
}
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { NewsSummary } from "@/generated/prisma";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const SummaryByCategoryTable = () => {
    const [searchValue, setSearchValue] = useState("");
    const [filteredNews, setFilteredNews] = useState<NewsSummary[]>([]);
    const trpc = useTRPC();
    // TODO: consider using useInfiniteQuery
    const { data, isLoading } = useQuery(trpc.library.getAllSummaryByCategory.queryOptions());

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
                    <div className="absolute left-4 flex items-center gap-x-2 ">
                        <SearchIcon className=" h-4 w-4" />
                        <span className=" text-xs">Input</span>
                    </div>
                    <Input
                        onChange={(e) => handleSearchChange(e.target.value)}
                        value={searchValue}
                        placeholder="Headline..."
                        className="pl-20 h-7 items-center !text-xs rounded-full !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    />
                </div>

                <div>
                    <span className="text-xs">Result: </span>
                    <span className="text-xs">{filteredNews.length || 0}</span>
                </div>
            </div>

            <div className="flex-shrink-0 sticky top-0 z-10 grid grid-cols-14 gap-4 px-4 py-1 bg-sidebar border-none font-normal text-xs text-muted-foreground">
                <div className="col-span-10">Headline</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Date</div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="my-8">
                        <Loader className="animate-spin mx-auto bg-none" />
                    </div>
                ) : (
                    <div className="divide-y divide-border text-xs font-normal border-b border-border">
                        {filteredNews.map((item) => (
                            <div key={item.id} className="grid grid-cols-14 gap-4 px-4 py-2.5 hover:bg-sidebar hover:cursor-pointer transition-colors items-center">
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
                                    <div className="text-muted-foreground truncate">
                                        {format(item.createdAt, "HH:mm 'on' MMM dd, yyyy")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const SummaryByIndividualLinkTable = () => {
    const trpc = useTRPC();
    // TODO: consider using useInfiniteQuery
    const { data } = useQuery(trpc.library.getAllSummaryByIndividualLink.queryOptions());
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Headline</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Created Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.headline}</TableCell>
                            <TableCell className="font-medium">{item.category}</TableCell>
                            <TableCell className="text-right">
                                {format(item.createdAt, "HH:mm 'on' MMM dd, yyyy")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

            </Table>
        </div>
    )
}
