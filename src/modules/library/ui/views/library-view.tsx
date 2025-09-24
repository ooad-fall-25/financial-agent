"use client";

import { useState } from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { LibraryTable } from "../components/library-table";


const tabItems = [
    {
        type: "category",
        name: "Summary by Category"
    },
    {
        type: "individual",
        name: "Summary by Individual",
    },
    {
        type: "liked",
        name: "Liked Summary"
    }
]

export const LibraryView = () => {
    const [activeTab, setActiveTab] = useState<string>(tabItems[0].type);

    return (
        <div className="h-screen max-w-7xl mx-auto flex flex-col w-full">
            <div className="flex-shrink-0 bg-background border-none  pt-6 pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between px-6 border-b border-border border-dashed pb-6">

                        <TabsList className="">
                            {tabItems.map((item) => (
                                <TabsTrigger className="" key={item.type} value={item.type}>{item.name}</TabsTrigger>
                            ))}
                        </TabsList>

                    </div>

                    <div className="mt-4" style={{ height: 'calc(100vh - 140px)' }}>
                        {tabItems.map((item) => (
                            <TabsContent key={item.type} value={item.type} className="h-full overflow-y-auto">
                                <LibraryTable selectedTab={activeTab}/>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

