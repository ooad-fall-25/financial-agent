"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

// TODO:consider putting these in db
const providers = [
    {
        name: "Finnhub",
        category: ["General", "Forex", "Crypto", "Merger"],
        dayOptions: ["1", "2", "3"]
    },
    {
        name: "Polygon",
        category: ["Stock"],
        dayOptions: ["1"]
    }
]

const languages = ["English", "Chinese"]

export const AskAINewsSheet = ({ isOpen, setIsOpen }: Props) => {
    const [providerName, setProviderName] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [dayOptions, setDayOptions] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);

    // TODO: consider simplifying: use setIsOpen directly with Sheet, no need to reset the state 
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setProviderName(null);
            setCategory(null);
            setDayOptions(null);
        }
    };

    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const newsMutation = useMutation(trpc.marketssssss.createAINewsSummary.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.marketssssss.getAINewsSummary.queryOptions())
        },
        onError: (error) => {
            toast.info(error.message);
        }
    }));

    const { data: summary } = useQuery(trpc.marketssssss.getAINewsSummary.queryOptions())

    const handleAskAI = () => {
        newsMutation.mutate({
            language: language || "",
            providerName: providerName?.toLowerCase() || "",
            category: category?.toLowerCase() || "",
            days: dayOptions || "",
        })
    }

    return (
        <Sheet open={isOpen} defaultOpen={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>News Reporter</SheetTitle>
                    <SheetDescription>
                        Select the options below and gain more insight on financial news
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 gap-y-4 flex flex-col">
                    <Select onValueChange={(value) => setProviderName(value)}>
                        <div className="flex justify-between">
                            <Label>Provider</Label>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Providers</SelectLabel>
                                    {providers.map((item) => (
                                        <SelectItem key={item.name} value={item.name.toLowerCase()} className="cursor-pointer">{item.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </div>
                    </Select>

                    <Select onValueChange={(value) => setLanguage(value)}>
                        <div className="flex justify-between">
                            <Label>Language</Label>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Language</SelectLabel>
                                    {languages.map((item) => (
                                        <SelectItem key={item} value={item} className="cursor-pointer">{item}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </div>
                    </Select>

                    {providerName &&
                        <div className="gap-y-4 flex flex-col">
                            <Select onValueChange={(value) => setCategory(value)}>
                                <div className="flex justify-between">
                                    <Label>Category</Label>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Category</SelectLabel>
                                            {providers.find((e) => e.name.toLowerCase() == providerName.toLowerCase())?.category.map((item) => (
                                                <SelectItem key={item} value={item.toLowerCase()} className="cursor-pointer">{item}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </div>
                            </Select>

                            <Select onValueChange={(value) => setDayOptions(value)}>
                                <div className="flex justify-between">
                                    <Label>Day</Label>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Day</SelectLabel>
                                            {providers.find((e) => e.name.toLowerCase() == providerName.toLowerCase())?.dayOptions.map((item) => (
                                                <SelectItem key={item} value={item} className="cursor-pointer">Last {item} day(s)</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </div>
                            </Select>
                        </div>
                    }
                </div>

                {summary &&
                    <ScrollArea className="h-98 max-h-screen w-72 p-2 m-4 border-none overflow-auto mx-auto ">
                        <AIResponse>{summary.aiRepsonse.toString()}</AIResponse>
                    </ScrollArea>
                }



                <SheetFooter>
                    <Button
                        disabled={newsMutation.isPending}
                        onClick={handleAskAI}
                    >
                        {newsMutation.isPending ? (
                            <Loader className="animate-spin" />
                        ) : (
                            <span>Ask</span>
                        )}
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}