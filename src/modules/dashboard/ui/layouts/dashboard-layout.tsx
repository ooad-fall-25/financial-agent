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
import { UserButton } from "@clerk/nextjs";
import { SidebarInsetWrapper } from "./sidebar-inset-wrapper";

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // const is = useSidebar(); 
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


      <Suspense fallback={<p>Loading messages...</p>}>
        <SidebarInsetWrapper>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInsetWrapper>
      </Suspense>
      

    </SidebarProvider>
  )



}