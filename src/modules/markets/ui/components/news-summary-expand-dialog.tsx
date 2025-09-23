import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    content: string;
}

export const NewsSummaryExpandDialog = ({ isOpen, setIsOpen, content }: Props) => {
    const trpc = useTRPC()
    const mutation = useMutation(trpc.marketssssss.markdownToPdf.mutationOptions())
    const handleDownload = async () => {
        const result = await mutation.mutateAsync({ markdown: content });

        // Convert base64 -> Blob
        const pdfData = atob(result);
        const buffer = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
            buffer[i] = pdfData.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "markdown.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
            <DialogTitle></DialogTitle>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto  max-h-[735px]">
                <div className="flex flex-col">
                    <ScrollArea className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto max-h-[635px] text-sm p-4">
                        <AIResponse>{content}</AIResponse>
                    </ScrollArea>
                </div>
                <Button onClick={handleDownload}>
                    Download as PDF
                </Button>
            </DialogContent>
        </Dialog>
    )
}