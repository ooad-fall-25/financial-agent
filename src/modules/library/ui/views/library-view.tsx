"use client";

import { useEffect, useState } from "react"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { LibraryTable } from "../components/library-table";
import { useRouter, useSearchParams } from "next/navigation";


const tabItems = [
    {
        type: "category",
        name: "Category"
    },
    {
        type: "individual",
        name: "Individual",
    },
    {
        type: "liked",
        name: "Liked"
    },
    {
        type: "media",
        name: "Media"
    }
]

export const LibraryView = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentType = searchParams.get("type") ?? "category";
    const [activeTab, setActiveTab] = useState<string>(tabItems[0].type);

    useEffect(() => {
        setActiveTab(currentType);
    }, [currentType]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/library?type=${value}`, { scroll: false });
    };

    return (
        <div className="h-screen max-w-9xl mx-auto flex flex-col w-full">
            <div className="flex-shrink-0 bg-background sticky top-0 z-20">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <div className="flex justify-between p-4 border-b border-border border-dashed ">
                        <TabsList className="bg-secondary">
                            {tabItems.map((item) => (
                                <TabsTrigger key={item.type} value={item.type}>
                                    {item.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
                <LibraryTable selectedTab={activeTab} />
            </div>
        </div>
    )
}

