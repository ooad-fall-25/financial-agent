"use client"

import { EditView } from "@/modules/library/ui/views/edit-view";
import dynamic from "next/dynamic";
import { use, useMemo } from "react";

interface Props {
    params: Promise<{ summaryId: string }>
}


const Page = ({ params }: Props) => {
    const { summaryId } = use(params)

    const EditView = useMemo(() => dynamic(
        () => import("@/modules/library/ui/views/edit-view").then(mod => mod.EditView),
        { ssr: false }
    ), [])
    return (
        <EditView
            summaryId={summaryId}
        />
    )
}

export default Page;