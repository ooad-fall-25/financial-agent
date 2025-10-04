"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettingsStore } from "@/stores/settings-store";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    content: string;
}

export const NewsSummaryExpandDialog = ({ isOpen, setIsOpen, content }: Props) => {
    const languageSetting = useSettingsStore((state) => state.language);
    const [displayContent, setDisplayContent] = useState(content);
    // const trpc = useTRPC();
    // const downloadMutation = useMutation(trpc.marketssssss.markdownToPdf.mutationOptions({
    //     onError: (error) => {
    //         toast.error(error.message);
    //     }
    // }));
    // const translateMutation = useMutation(trpc.marketssssss.translate.mutationOptions({
    //     onError: (error) => {
    //         toast.error(error.message);
    //     }
    // }));

    // const handleDownload = async () => {
    //     const result = await downloadMutation.mutateAsync({ markdown: displayContent });

    //     // Convert base64 -> Blob
    //     const pdfData = atob(result);
    //     const buffer = new Uint8Array(pdfData.length);
    //     for (let i = 0; i < pdfData.length; i++) {
    //         buffer[i] = pdfData.charCodeAt(i);
    //     }

    //     const blob = new Blob([buffer], { type: "application/pdf" });
    //     const url = window.URL.createObjectURL(blob);

    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = "markdown.pdf";
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    // };

    // const handleTranslation = async () => {
    //     const translatedContent = await translateMutation.mutateAsync({
    //         content: displayContent,
    //         language: languageSetting
    //     });
    //     setDisplayContent(translatedContent);
    // }

    // const isPageLoading = downloadMutation.isPending || translateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
            <DialogTitle></DialogTitle>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto  max-h-[735px]">
                {/* {isPageLoading ? (
                    <Loader className="animate-spin" />
                ) : (
                    <div className="flex flex-col">
                        <ScrollArea className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto max-h-[635px] text-sm p-4">
                            <AIResponse>{displayContent}</AIResponse>
                        </ScrollArea>
                        <div className="w-full flex gap-x-4">
                            <Button className="flex-1" onClick={handleDownload} disabled={downloadMutation.isPending}>
                                {downloadMutation.isPending ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    <span>Download as PDF</span>
                                )}
                            </Button>
                            <Button className="flex-1" onClick={handleTranslation} disabled={translateMutation.isPending}>
                                <span>Translate</span>
                            </Button>
                        </div>
                    </div>
                )} */}
            </DialogContent>
        </Dialog>
    )
}