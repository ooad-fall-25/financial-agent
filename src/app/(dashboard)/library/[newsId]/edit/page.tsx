"use client"

import { EditView } from "@/modules/library/ui/views/edit-view";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Page = () => {

    const EditView = useMemo(() => dynamic(
        () => import("@/modules/library/ui/views/edit-view").then(mod => mod.EditView),
        { ssr: false }
    ), [])
    return (
        <EditView 
           
        />
    )
}

export default Page;