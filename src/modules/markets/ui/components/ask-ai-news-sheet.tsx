import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const AskAINewsSheet = ({ isOpen, setIsOpen }: Props) => {
    return (
        <Sheet open={isOpen} defaultOpen={isOpen} onOpenChange={setIsOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Are you absolutely sure?</SheetTitle>
                    <SheetDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}