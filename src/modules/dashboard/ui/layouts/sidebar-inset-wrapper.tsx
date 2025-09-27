"use client"

import { SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SidebarInsetWrapper({ children }: { children: React.ReactNode }) {
    const { open } = useSidebar()

    return (
        <SidebarInset
            className={cn(
                "fixed top-12 inset-x-0 bottom-1 left-[calc(var(--sidebar-width)+1rem)] w-[calc(100%-var(--sidebar-width)-1rem-1rem)] max-w-8xl mx-auto flex flex-col rounded-xl overflow-hidden transition-all",
                !open && "left-[calc(var(--sidebar-width-icon)+1rem)] w-[calc(100%-var(--sidebar-width-icon)-1rem-1rem)]"
            )}
        >
            {children}
        </SidebarInset>
    )
}
