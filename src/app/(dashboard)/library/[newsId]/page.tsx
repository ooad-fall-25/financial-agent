import { LibraryDetailView } from "@/modules/library/ui/views/library-detail-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
    params: Promise<{
        newsId: string;
    }>
}
const Page = async ({ params }: Props) => {
    const { newsId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.library.getOne.queryOptions({
        newsId: newsId
    }))

    return (

        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<p>Loading ... </p>}>
                <LibraryDetailView newsId={newsId} />
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page;