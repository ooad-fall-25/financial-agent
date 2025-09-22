import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useState } from "react"
import { toast } from "sonner"
import { NewsSummaryExpandDialog } from "./news-summary-expand-dialog"

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
            days: "1",
        })
    }

    return (
        <Dialog defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate News Summary With AI</DialogTitle>
                    <DialogDescription>
                        Please complete the form below
                    </DialogDescription>
                </DialogHeader>

                <Select value={language || ""} onValueChange={(value) => setLanguage(value)}>
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

                <Button
                    onClick={() => setIsOpenExpandDialog(true)}
                >
                    View latest summary
                </Button>

                {content &&
                    <NewsSummaryExpandDialog
                        isOpen={isOpenExpandDialog}
                        setIsOpen={setIsOpenExpandDialog}
                        content={content.aiRepsonse} />
                }

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={handleNewsSubmit}
                        disabled={newsByLink.isPending}
                    >Generate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}