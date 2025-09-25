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

const SummaryByCategoryTable = () => {
    const trpc = useTRPC();
    // TODO: consider using useInfiniteQuery
    const { data } = useQuery(trpc.library.getAllSummaryByCategory.queryOptions());
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
