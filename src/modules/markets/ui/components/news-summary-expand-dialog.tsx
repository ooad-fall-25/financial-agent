"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettingsStore } from "@/stores/settings-store";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    content: string;
    newsId: string;
    category: string;
}

export const NewsSummaryExpandDialog = ({ isOpen, setIsOpen, content, newsId, category }: Props) => {
    const router = useRouter();
    const languageSetting = useSettingsStore((state) => state.language);
    const [displayContent, setDisplayContent] = useState(content);
    const trpc = useTRPC();

    const translateMutation = useMutation(trpc.library.translate.mutationOptions({
        onError: (error) => {
            toast.error(error.message);
        }
    }));


    const handleTranslation = async () => {
        const translatedContent = await translateMutation.mutateAsync({
            content: displayContent,
            language: languageSetting
        });
        setDisplayContent(translatedContent);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
            <DialogTitle></DialogTitle>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto  max-h-[735px]">
                <div className="flex flex-col">
                    <ScrollArea className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto max-h-[635px] text-sm p-4">
                        <AIResponse>{displayContent}</AIResponse>
                    </ScrollArea>
                    <div className="w-full flex gap-x-4">
                        <Button
                            className="flex-1"
                            onClick={() => router.push(`library/${newsId}?type=${category}`)}>
                            View Detail
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}