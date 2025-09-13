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
import { Link, SidebarIcon, XIcon } from "lucide-react";
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

            <SidebarInset className="flex flex-col">
                <SidebarTrigger className="md:hidden border-none fixed top-2 left-4" />
                <Suspense fallback={<p>loading messages. ... . </p>}>
                    {children}
                </Suspense>
            </SidebarInset>

        </SidebarProvider>
    )
}