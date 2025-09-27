import { cookies } from "next/headers"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
    SidebarProvider,
    useSidebar, // Move this import here
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarIcon, XIcon } from "lucide-react";
import { Suspense } from "react";
import { DashboardSidebar } from "../components/dashboard-sidebar";

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "16rem",
                } as React.CSSProperties
            }
            defaultOpen={defaultOpen}
        >
            <DashboardSidebar />

<SidebarInset
  className="fixed top-12 inset-x-0 bottom-0 left-[var(--sidebar-width)] 
             w-[calc(99%-var(--sidebar-width))] max-w-8xl mx-auto flex flex-col rounded-xl overflow-hidden"
>

  <Suspense fallback={<p>Loading messages...</p>}>
    <main className="flex-1 ">
      {children}
    </main>
  </Suspense>
</SidebarInset>


        </SidebarProvider>
    )



}