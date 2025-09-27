"use client";

import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link"

export const LibraryDetailHeader = () => {
    return (
        <header className="w-full p-4 border-b border-primary items-center">
            <Button
                asChild
                variant="ghost"
                className="hover:border"
            >
                <Link href="/library" className="items-center gap-2 ">
                    <ArrowLeftIcon /> Library
                </Link>
            </Button>
        </header>
    )
}