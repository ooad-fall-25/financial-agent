import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { NewsSummaryExpandDialog } from "./news-summary-expand-dialog"
import { EyeIcon, Loader, LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    providerName: string;
    url: string;
    category: string;
    headline: string;
    summary: string;
}

const languages = ["English", "Chinese", "Khmer", "Indonesian"]

export const AskAINewsLinkDialog = ({
    isOpen,
    setIsOpen,
    providerName,
    url,
    category,
    headline,
    summary,
}: Props) => {
    const [language, setLanguage] = useState<string | null>(null);
    const [isOpenExpandDialog, setIsOpenExpandDialog] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const newsByLink = useMutation(trpc.marketssssss.createAINewsSummaryByLink.mutationOptions(
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(trpc.marketssssss.getAINewsSummaryByLink.queryOptions())
            },
            onError: (error) => {
                toast.error(error.message)
            }
        }
    ));

    const { data: content } = useQuery(trpc.marketssssss.getAINewsSummaryByLink.queryOptions());

    const handleNewsSubmit = () => {
        newsByLink.mutate({
            url: url || "",
            language: language || "",
            providerName: providerName || "",
            category: category || "",
            title: headline || "",
        })
    }

    const isButtonDisabled = newsByLink.isPending || !language

    return (
        <Dialog defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle >News Reporter</DialogTitle>
                    <DialogDescription>
                        Generate each news summary with AI. Please complete the info below.
                    </DialogDescription>
                </DialogHeader>

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

                <div className="flex flex-col p-4">
                    <p className="text-xs font-mono text-center">Selected article: </p>
                    <p className="text-sm text-center p-2">{headline}</p>
                </div>

                <Button
                    onClick={() => setIsOpenExpandDialog(true)}
                    disabled={newsByLink.isPending || !content}
                    variant="outline"
                >

                    {content ? (
                        <>
                            {newsByLink.isPending ? (
                                <span className="animate-pulse">Generating</span>
                            ) : (
                                <div className="flex items-center justify-center gap-x-4">
                                    <EyeIcon />
                                    <span>View latest summary</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="text-xs">No content found! Generate one.</span>
                        </>
                    )}

                </Button>

                {content &&
                    <NewsSummaryExpandDialog
                        isOpen={isOpenExpandDialog}
                        setIsOpen={setIsOpenExpandDialog}
                        content={content.aiRepsonse}
                        summaryId={content.id}
                        type="individual"
                    />
                }

                <DialogFooter >
                    <div className="flex w-full justify-between gap-x-4">

                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                startTransition(() => router.push(`library?type=individual`))
                            }}
                        >
                            {isPending ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                <span>View All</span>
                            )}
                        </Button>
                        <Button
                            onClick={() => {
                                toast.info("Please wait, this may take a moment...")
                                handleNewsSubmit();
                            }}
                            disabled={isButtonDisabled}
                            className="flex-1"
                        >
                            <>
                                {newsByLink.isPending ? (
                                    <div className="items-center">
                                        <Loader className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    <span>Generate</span>
                                )}
                            </>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}