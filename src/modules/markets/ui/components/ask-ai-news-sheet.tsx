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
import { ExpandIcon, FileText, Loader } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { cn } from "@/lib/utils";
import { NewsSummaryExpandDialog } from "./news-summary-expand-dialog";
import { Kbd, KbdKey } from "@/components/ui/kibo-ui/kbd";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

// TODO:consider putting these in db
const providers = [
    {
        name: "Finnhub",
        category: ["General", "Forex", "Crypto", "Merger"],
    },
    {
        name: "Polygon",
        category: ["Stock"],
    }
]

const languages = ["English", "Chinese", "Khmer", "Indonesian"]

export const AskAINewsSheet = ({ isOpen, setIsOpen }: Props) => {
    const [providerName, setProviderName] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);
    const [isExpand, setIsExpand] = useState(false);

    // TODO: consider simplifying: use setIsOpen directly with Sheet, no need to reset the state 
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetStates();
        }
    };

    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const newsMutation = useMutation(trpc.marketssssss.createAINewsSummary.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.marketssssss.getAINewsSummary.queryOptions());
            resetStates();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }));

    const { data: summary, isLoading } = useQuery(trpc.marketssssss.getAINewsSummary.queryOptions())

    const handleAskAI = () => {
        newsMutation.mutate({
            language: language || "",
            providerName: providerName?.toLowerCase() || "",
            category: category?.toLowerCase() || "",
        })
    }

    const resetStates = () => {
        setProviderName(null);
        setCategory(null);
        setLanguage(null);
    }

    const isButtonDisabled = newsMutation.isPending || !providerName || !category || !language;

    return (
        <Sheet open={isOpen} defaultOpen={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>News Reporter</SheetTitle>
                    <SheetDescription>
                        Select the options below and gain more insight on financial news
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-8 gap-y-4 flex flex-col border-b border-dashed">
                    <Select value={providerName || ""} onValueChange={(value) => setProviderName(value)}>
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

                    <Select value={language || ""} onValueChange={(value) => setLanguage(value)}>
                        <div className="flex justify-between">
                            <Label>Language</Label>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a language" />
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
                            <Select value={category || ""} onValueChange={(value) => setCategory(value)}>
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

                        </div>
                    }
                </div>

                {isLoading && (<Loader className="mx-auto animate-spin pt-4" />)}
                {summary && (
                    <div className="flex items-center justify-between px-12">
                        <Kbd className="w-fit">
                            <KbdKey>Latest summary</KbdKey>
                        </Kbd>
                        <Button
                            onClick={() => setIsExpand(!isExpand)}
                            variant="outline"
                            className=" !border-none !bg-transparent !shadow-none">
                            <ExpandIcon />
                        </Button>
                    </div>

                )}

                {summary ? (
                    <div className="flex flex-col flex-1 min-h-0 relative ">
                        <div className="absolute top-0 -left-0 -right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none " />
                        
                        <ScrollArea className="h-full w-full px-12 overflow-auto mx-auto text-sm" >
                            <AIResponse>{summary.aiRepsonse.toString()}</AIResponse>
                        </ScrollArea>
                        <div className="absolute bottom-0 -left-0 -right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
                    </div>
                ) : (
                    <div>
                        <div className="flex-1 flex items-center justify-center">
                            {!isLoading &&
                                (
                                    <div className="flex flex-col items-center my-auto gap-y-2 p-4">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold">No Summaries Found</h3>
                                        <p className="text-xs text-muted-foreground">Get started by generating your first summary.</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>

                )


                }




                <SheetFooter className="border-t border-dashed">
                    {summary &&
                        <NewsSummaryExpandDialog isOpen={isExpand} setIsOpen={setIsExpand} content={summary?.aiRepsonse.toString() || ""} />
                    }
                    <Button
                        disabled={isButtonDisabled}
                        onClick={handleAskAI}
                    >
                        {newsMutation.isPending ? (
                            <div className="flex items-center justify-center my-auto gap-x-2 text-muted-foreground">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Please wait, this may take a moment...</span>
                            </div>
                        ) : (
                            <span>Generate Summary</span>
                        )}
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}