"use client";

import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileAudio, SearchIcon, Trash2, FolderOpen, TablePropertiesIcon, FileIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Media } from "@/generated/prisma";

export const MediaTable = () => {
    const router = useRouter();
    const trpc = useTRPC();


    const [searchValue, setSearchValue] = useState("");
    const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);

    const { data: media } = useQuery(trpc.library.getAllMedia.queryOptions());

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        if (media) {
            setFilteredMedia(media)
            if (value.length === 0) {
                setFilteredMedia(media);
            } else {
                const result = media?.filter(news => news.fileName.toLowerCase().includes(value.toLowerCase()));
                setFilteredMedia(result);
            }
        }
    }

    useEffect(() => {
        if (media) setFilteredMedia(media);
    }, [media]);

    return (
        <div className=" h-full flex flex-col min-h-0">
            <div className="p-4 flex items-center justify-start gap-x-4">
                <div className="flex items-center relative w-full max-w-xs">
                    <div className="absolute left-4 flex items-center justify-center gap-x-2 ">
                        <SearchIcon className=" h-4 w-4" />
                        <span className="items-center text-xs">Input</span>
                    </div>
                    <Input
                        onChange={(e) => handleSearchChange(e.target.value)}
                        value={searchValue}
                        placeholder="Name..."
                        className="pl-20 h-8 !items-center border-2 !text-xs rounded-full !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    />
                </div>

                <div>
                    <span className="text-xs">Result: </span>
                    <span className="text-xs">{filteredMedia.length || 0}</span>
                </div>
            </div>

            <div className="flex-shrink-0 sticky top-0 z-10 grid grid-cols-15 gap-4 px-4 py-1 bg-sidebar border-none font-normal text-xs text-muted-foreground">

                <div className="col-span-13">Name</div>
                <div className="col-span-2">Date</div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="h-full min-h-0">



                    <div>
                        {filteredMedia.length > 0 ? (
                            <div className="h-full min-h-0 pb-20">

                                <div className="divide-y divide-border text-xs font-normal">
                                    {filteredMedia.map((item) => (
                                        <div key={item.id} className="grid grid-cols-15 gap-4 px-4 py-2.5 hover:bg-sidebar hover:cursor-pointer transition-colors items-center border-b border-secondary">
                                            <div className="col-span-13">
                                                <div className="font-medium leading-tight truncate">
                                                    <p>{item.fileName}</p>
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

                        ) : (
                            <div className="flex-1 gap-y-4 items-center justify-center flex flex-col mt-20">
                                <FileIcon />
                                <div className="gap-y-2 flex flex-col items-center">
                                    <span className="text-sm">The media will be loaded here</span>
                                    <span className="text-xs text-muted-foreground">Generate one</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>



        </div>
    )
}