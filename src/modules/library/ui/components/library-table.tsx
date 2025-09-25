interface Props {
    selectedTab: string;
}

export const LibraryTable = ({ selectedTab }: Props) => {
    if (selectedTab === "category") {
        return <SummaryByCategoryTable />
    } else if (selectedTab === "individual") {
        return <SummaryByIndividualLinkTable />
    } else {
        return;
    }
}
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader } from "lucide-react";

const SummaryByCategoryTable = () => {
    const trpc = useTRPC();
    // TODO: consider using useInfiniteQuery
    const { data, isLoading } = useQuery(trpc.library.getAllSummaryByCategory.queryOptions());
return (
    <div className="w-full h-full flex flex-col">
        <div className="flex-shrink-0 sticky top-0 z-10 grid grid-cols-14 gap-4 px-4 py-1 bg-accent border-none font-semibold text-xs text-muted-foreground">
            <div className="col-span-10">Headline</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Date</div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {isLoading ? (
                <div className="my-8">
                    <Loader className="animate-spin mx-auto bg-none" />
                </div>
            ) : (
                <div className="divide-y divide-border text-xs">
                    {data?.map((item) => (
                        <div key={item.id} className="grid grid-cols-14 gap-4 px-4 py-2 hover:bg-muted/100 hover:cursor-pointer transition-colors items-center">
                            <div className="col-span-10">
                                <div className="font-medium text-foreground leading-tight truncate">
                                    <p>{item.headline}</p>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-muted-foreground leading-relaxed">
                                    {item.category}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-muted-foreground truncate">
                                    {format(item.createdAt, "HH:mm 'on' MMM dd, yyyy")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
)
}

const SummaryByIndividualLinkTable = () => {
    const trpc = useTRPC();
    // TODO: consider using useInfiniteQuery
    const { data } = useQuery(trpc.library.getAllSummaryByIndividualLink.queryOptions());
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Headline</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Created Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.headline}</TableCell>
                            <TableCell className="font-medium">{item.category}</TableCell>
                            <TableCell className="text-right">
                                {format(item.createdAt, "HH:mm 'on' MMM dd, yyyy")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

            </Table>
        </div>
    )
}
