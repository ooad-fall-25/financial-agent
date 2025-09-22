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

export const AskAINewsLinkDialog = () => {
    return (
        <Dialog>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Generate News Summary With AI</DialogTitle>
                        <DialogDescription>
                            Please complete the form below
                        </DialogDescription>
                    </DialogHeader>
                    


                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Generate</Button>
                    </DialogFooter>
                </DialogContent>
        </Dialog>
    )
}