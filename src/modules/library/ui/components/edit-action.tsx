import { Button } from "@/components/ui/button"
import { DownloadIcon, RefreshCcwIcon, SaveAllIcon, WrenchIcon } from "lucide-react"

export const EditAction = () => {
    return (
        <div className="w-full h-full min-h-0">
            <div className="gap-y-8 flex flex-col">
                <div className="flex items-center gap-x-4">
                    <WrenchIcon className="size-4" />
                    <span>Actions</span>
                </div>
                <div className="flex flex-col gap-y-4">
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Discard change & Load last save</span>
                        <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                        >
                            <RefreshCcwIcon />
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Download this edit as PDF</span>
                        <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                        >
                            <DownloadIcon />
                        </Button>
                    </div>
                    <div className="flex items-center gap-x-4 justify-between">
                        <span>Save this edit</span>
                        <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                        >
                            <SaveAllIcon />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}