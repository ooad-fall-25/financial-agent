import { Button } from "@/components/ui/button"
import { useDownload } from "@/hooks/use-download";
import { useTRPC } from "@/trpc/client";
import { BlockNoteEditor } from "@blocknote/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, FileDownIcon, LoaderIcon, RefreshCcwIcon, SaveAllIcon, WrenchIcon } from "lucide-react"
import { toast } from "sonner";

interface Props {
    newsId: string;
    savedMarkdown: string;
    editor: BlockNoteEditor;
}

export const EditAction = ({ newsId, savedMarkdown, editor }: Props) => {

    const { downloadAsMarkdown, isDownloadingMD, downloadAsPDF, isDownloadingPDF } = useDownload();

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const saveMutation = useMutation(trpc.library.updateSummaryText.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.library.getOne.queryOptions({ newsId }));
            toast.success("Summary is successfully saved");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }));

    const news = useQuery(trpc.library.getOne.queryOptions({ newsId }));

    const handleSave = async () => {
        await saveMutation.mutateAsync({
            newsId: newsId,
            text: savedMarkdown,
        })
    }

    const handleLoadSave = async () => {
        sessionStorage.removeItem(`edit-${newsId}`);
        news.refetch();
        const block = await editor.tryParseMarkdownToBlocks(news.data?.aiRepsonse.toString() || "");
        editor.replaceBlocks(editor.document, block);
    }    

    const handleDownloadAsMD = () => {
        downloadAsMarkdown("note", savedMarkdown);
    }

    const handleDownloadAsPDF = () => {
        downloadAsPDF("note", savedMarkdown);
    }

    return (
        <div className="w-full h-full min-h-0">
            <div className="gap-y-8 flex flex-col">
                <div className="flex items-center gap-x-4">
                    <WrenchIcon className="size-4" strokeWidth={2.5} />
                    <span>Actions</span>
                </div>
                <div className="flex flex-col gap-y-4">
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Discard change & Load last save</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8"
                            onClick={handleLoadSave}
                            disabled={news.isLoading}
                        >
                            {news.isLoading ? (
                                <LoaderIcon className="animate-spin" strokeWidth={2.5} />
                            ) : (
                                <RefreshCcwIcon strokeWidth={2.5} />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Download current edit as PDF (no save required)</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8"
                            onClick={handleDownloadAsPDF}
                            disabled={isDownloadingPDF}
                        >
                            {isDownloadingPDF ? (
                                <LoaderIcon className="animate-spin" strokeWidth={2.5} />
                            ) : (
                                <DownloadIcon strokeWidth={2.5} />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Download current edit as MD (no save required)</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8"
                            onClick={handleDownloadAsMD}
                            disabled={isDownloadingMD}
                        >
                            {isDownloadingMD ? (
                                <LoaderIcon className="animate-spin" strokeWidth={2.5} />
                            ) : (
                                <FileDownIcon strokeWidth={2.5} />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Save this edit</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8"
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? (
                                <LoaderIcon className="animate-spin" strokeWidth={2.5} />
                            ) : (
                                <SaveAllIcon strokeWidth={2.5} />
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}