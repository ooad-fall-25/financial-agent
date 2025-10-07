import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDownload } from "@/hooks/use-download"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DownloadIcon, EditIcon, FileDownIcon, LoaderIcon, TrashIcon, WrenchIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

interface Props {
    summaryId: string;
    content: string;
}

export const LibraryDetailAction = ({ summaryId, content }: Props) => {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") ?? "category";

    const { downloadAsMarkdown, isDownloadingMD, downloadAsPDF, isDownloadingPDF } = useDownload();

    const [isPending, startTransition] = useTransition()
    const router = useRouter();
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const mutation = useMutation(trpc.library.deleteOne.mutationOptions({
        onSuccess: (data) => {
            if (data.isByCategory) {
                queryClient.invalidateQueries(trpc.library.getAllSummaryByCategory.queryOptions());
            } else {
                queryClient.invalidateQueries(trpc.library.getAllSummaryByIndividualLink.queryOptions());
            }
            router.push(`/library?type=${type}`);
            toast.success("News deleted", {
                description: `Headline: ${data.headline}`,
            })
        },
        onError: (error) => {
            toast.error("Failed to delete", {
                description: error.message,
            })
        }
    }));

    const handleDelete = async (summaryId: string) => {
        const deletedData = await mutation.mutateAsync({
            summaryId: summaryId,
        })
    }

    const handleDownloadAsMD = () => {
        downloadAsMarkdown("note", content);
    }

    const handleDownloadAsPDF = () => {
        downloadAsPDF("note", content);
    }


    return (
        <div className="w-full h-ful">
            <div className="px-4 py-8 gap-y-8 flex flex-col">
                <div className="flex items-center gap-x-4">
                    <WrenchIcon className="size-4" />
                    <span>Actions</span>
                </div>
                <div className="flex flex-col gap-y-4">
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Edit this summary</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8  "
                            onClick={() => {
                                startTransition(() => {
                                    router.push(`/library/${summaryId}/edit?type=${type}`)
                                })
                            }}
                        >
                            {isPending ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                <EditIcon />
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Download as PDF</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8  "
                            onClick={handleDownloadAsPDF}
                        >
                            {isDownloadingPDF ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                <DownloadIcon />
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Download as Markdown</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8  "
                            onClick={handleDownloadAsMD}
                        >
                            {isDownloadingMD ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                <FileDownIcon />
                            )}
                        </Button>
                    </div>



                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Delete this summary</span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    className="h-6 w-8"
                                    variant="delete"
                                >
                                    <TrashIcon />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        summary and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(summaryId)} className="bg-red-400 hover:bg-red-600 text-foreground">Yes</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    )
}