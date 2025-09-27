"use client"

import { SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SidebarInsetWrapper({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()

  return (
        <SidebarInset
      className={cn(
        "fixed top-12 inset-x-0 bottom-4 left-[var(--sidebar-width)] w-[calc(99%-var(--sidebar-width))] max-w-8xl mx-auto flex flex-col rounded-xl overflow-hidden",
        !open && "left-[var(--sidebar-width-icon)] w-[calc(99%-var(--sidebar-width-icon))]"
      )}
    >
      {children}
    </SidebarInset>
  )
}
