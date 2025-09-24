interface Props {
    selectedTab: string;
}

export const LibraryTable = ({ selectedTab }: Props) => {
    if (selectedTab === "category") {
        return <SummaryByCategoryTable />
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



const items = [
    {
        id: "1",
        name: "Alex Thompson",
        email: "alex.t@company.com",
        location: "San Francisco, US",
        status: "Active",
        balance: "$1,250.00",
    },
    {
        id: "2",
        name: "Sarah Chen",
        email: "sarah.c@company.com",
        location: "Singapore",
        status: "Active",
        balance: "$600.00",
    },
    {
        id: "3",
        name: "James Wilson",
        email: "j.wilson@company.com",
        location: "London, UK",
        status: "Inactive",
        balance: "$650.00",
    },
    {
        id: "4",
        name: "Maria Garcia",
        email: "m.garcia@company.com",
        location: "Madrid, Spain",
        status: "Active",
        balance: "$0.00",
    },
    {
        id: "5",
        name: "David Kim",
        email: "d.kim@company.com",
        location: "Seoul, KR",
        status: "Active",
        balance: "-$1,000.00",
    },
]

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
                            <TableCell className="font-medium">headline</TableCell>
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


