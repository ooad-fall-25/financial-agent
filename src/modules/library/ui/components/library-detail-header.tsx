"use client";

import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link"

interface Props {
    route: string; 
    name: string; 
}

export const LibraryDetailHeader = ({route, name} : Props) => {
    return (
        <header className="w-full p-4 border-b border-primary items-center">
            <Button
                asChild
                variant="ghost"
                className="hover:border"
            >
                <Link href={route} className="items-center gap-2 ">
                    <ArrowLeftIcon /> {name}
                </Link>
            </Button>
        </header>
    )
}