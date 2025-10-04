import { Button } from "@/components/ui/button"
import { DownloadIcon, RefreshCcwIcon, SaveAllIcon, WrenchIcon } from "lucide-react"

interface Props {
    newsId: string;
    savedMarkdown: string;
}

export const EditAction = ({ newsId, savedMarkdown }: Props) => {
    const handleSave = () => {
        console.log(savedMarkdown)
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

                        >
                            <RefreshCcwIcon strokeWidth={2.5} />
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Download this edit as PDF</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8"
                        >
                            <DownloadIcon strokeWidth={2.5} />
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Save this edit</span>
                        <Button
                            size="icon"
                            variant="action"
                            className="h-6 w-8"
                            onClick={handleSave}

                        >
                            <SaveAllIcon strokeWidth={2.5} />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}