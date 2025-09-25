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
} from "@/components/ui/shadcn-io/tabs"
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
        <div className="flex-shrink-0 bg-background sticky top-0 z-20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between p-4 border-b border-border border-dashed">
                    <TabsList>
                        {tabItems.map((item) => (
                            <TabsTrigger className="text-xs" key={item.type} value={item.type}>
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

