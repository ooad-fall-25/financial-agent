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
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { WrenchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const LibraryDetailAction = ({ newsId }: { newsId: string }) => {
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
            router.push("/library");
            toast.success("News deleted", {
                description: `Headline: ${data.headline}` ,
            })
        },
        onError: (error) => {
            toast.error("Failed to delete", {
                description: error.message,
            })
        }
    }));

    const handleDelete = async (newsId: string) => {
        const deletedData = await mutation.mutateAsync({
            newsId: newsId,
        })
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
                        <span>Delete this summary</span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete</Button>
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
                                    <AlertDialogAction onClick={() => handleDelete(newsId)} className="bg-red-400 hover:bg-red-600">Yes</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    )
}