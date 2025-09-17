import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    content: string;
}

export const NewsSummaryExpandDialog = ({ isOpen, setIsOpen, content }: Props) => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
            <DialogTitle></DialogTitle>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto  max-h-[735px]">
                <div className="flex flex-col">
                    <ScrollArea className="sm:max-w-[425px] md:max-w-[800px] lg:max-w-[1200px] w-auto h-auto max-h-[635px] text-sm p-4">
                        <AIResponse>{content}</AIResponse>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}