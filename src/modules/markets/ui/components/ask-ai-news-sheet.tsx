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
import { ChangeEventHandler, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditIcon, ExpandIcon, FileText, ScanEyeIcon } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { NewsSummaryExpandDialog } from "./news-summary-expand-dialog";
import { Kbd, KbdKey } from "@/components/ui/kibo-ui/kbd";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

// TODO:consider putting these in db
const markets = [
    {
        name: "US News",
        type: "us",
        category: ["General", "Stock", "Crypto", "Merger", "Company"],
    },
    {
        name: "Chinese News",
        type: "cn",
        category: ["Finance", "Business"],
    },
]

const languages = ["English", "Chinese"]

export const AskAINewsSheet = ({ isOpen, setIsOpen }: Props) => {
    const [marketType, setMarketType] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);
    const [isExpand, setIsExpand] = useState(false);
    const [userMessage, setuserMessage] = useState<string | null>(null);
    const [isEnableCustomQuery, setIsEnableCustomQuery] = useState(false);

    const [isViewAllPending, startViewAllTransition] = useTransition();
    const [isViewEditPending, startViewEditTransition] = useTransition();
    const [isViewDetailPending, startViewDetailTransition] = useTransition();

    const router = useRouter();

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
            marketType: marketType?.toLowerCase() || "",
            category: category?.toLowerCase() || "",
            userMessage: userMessage || "",
        })
    }

    const handleCustomQueryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        setuserMessage(e.target.value);
    };

    const resetStates = () => {
        setMarketType(null);
        setCategory(null);
        setLanguage(null);
        setuserMessage(null);
        setIsEnableCustomQuery(false);
    }

    const isButtonDisabled = newsMutation.isPending || !marketType || !category || !language || !(!isEnableCustomQuery || userMessage);

    return (
        <Sheet open={isOpen} defaultOpen={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="flex flex-col md:max-w-2xl lg:max-w-3xl">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-semibold">
                        News Summary
                    </SheetTitle>
                    <SheetDescription className="gap-y-1 text-sm text-muted-foreground">
                        Let AI refine the most important information for you.
                        Select your preferences below to explore key insights from the market.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-y-4">
                    <div className="px-4 gap-y-4 flex justify-between">
                        <Select value={marketType || ""} onValueChange={(value) => setMarketType(value)}>
                            <div className="flex justify-between">
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Market" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Markets</SelectLabel>
                                        {markets.map((item) => (
                                            <SelectItem key={item.type} value={item.type.toLowerCase()} className="cursor-pointer">{item.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </div>
                        </Select>

                        <Select value={language || ""} onValueChange={(value) => setLanguage(value)}>
                            <div className="flex justify-between">
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Language" />
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


                        <Select value={category || ""} onValueChange={(value) => setCategory(value)} disabled={(!marketType || marketType?.length === 0)}>
                            <div className="flex justify-between">
                                <SelectTrigger className="w-[150px]" >
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        {markets.find((e) => e.type.toLowerCase() == marketType?.toLowerCase())?.category.map((item) => (
                                            <SelectItem key={item} value={item.toLowerCase()} className="cursor-pointer">{item}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </div>
                        </Select>


                        <div className="flex gap-x-4 items-center">
                            <Switch
                                id="custom-query"
                                checked={isEnableCustomQuery}
                                onCheckedChange={setIsEnableCustomQuery}
                            />
                            <Label htmlFor="custom-query" className="cursor-pointer">
                                Add custom query
                            </Label>
                        </div>
                    </div>

                    <div className="px-4 gap-y-4 flex justify-between">
                        {isEnableCustomQuery &&
                            <Textarea
                                placeholder="Type your message here."
                                className="!bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 "
                                value={userMessage || ""}
                                onChange={handleCustomQueryChange}
                            />
                        }
                    </div>

                </div>



                {isLoading && (<Spinner className="mx-auto" />)}
                {summary && (
                    <div className="flex items-center justify-between px-12">
                        <div>
                            <Kbd className="w-fit">
                                <KbdKey>Latest summary</KbdKey>
                            </Kbd>
                        </div>
                        <div>
                            <Button
                                size="icon"
                                variant="action"
                                className="h-6 w-8 !mr-4"
                                onClick={() => {
                                    startViewDetailTransition(() => {
                                        router.push(`/library/${summary.id}?type=category`)
                                    })
                                }}
                            >
                                {isViewDetailPending ? (
                                    <Spinner />
                                ) : (
                                    <ScanEyeIcon />
                                )}
                            </Button>
                            <Button
                                size="icon"
                                variant="action"
                                className="h-6 w-8 !mr-4"
                                onClick={() => {
                                    startViewEditTransition(() => {
                                        router.push(`/library/${summary.id}/edit?type=category`)
                                    })
                                }}
                            >
                                {isViewEditPending ? (
                                    <Spinner />
                                ) : (
                                    <EditIcon />
                                )}
                            </Button>
                            <Button
                                onClick={() => setIsExpand(!isExpand)}
                                // variant="outline"
                                // className=" !border-none !bg-transparent !shadow-none"
                                variant="action"
                                className="h-6 w-8  "
                            >
                                <ExpandIcon />
                            </Button>
                        </div>


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
                )}




                <SheetFooter className="border-t border-dashed">
                    {summary &&
                        <NewsSummaryExpandDialog
                            isOpen={isExpand}
                            setIsOpen={setIsExpand}
                            content={summary?.aiRepsonse.toString() || ""}
                            summaryId={summary.id}
                            type="category"
                        />
                    }
                    <div className="flex justify-between gap-x-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                startViewAllTransition(() => router.push(`library?type=category`))
                            }}
                        >
                            {isViewAllPending ? (
                                <Spinner />
                            ) : (
                                <span>View all</span>
                            )}
                        </Button>
                        <Button
                            disabled={isButtonDisabled}
                            onClick={() => {
                                toast.info("Please wait, this may take a moment...")
                                handleAskAI();
                            }}
                            className="flex-1"
                        >
                            {newsMutation.isPending ? (
                                <div className="items-center">
                                    <Spinner className="h-4 w-4" />
                                </div>
                            ) : (
                                <span>Generate Summary</span>
                            )}
                        </Button>
                    </div>
                </SheetFooter>

            </SheetContent>
        </Sheet >
    )
}