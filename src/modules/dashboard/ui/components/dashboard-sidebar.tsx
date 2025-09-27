"use client";

import { BookOpenIcon, BotIcon, ChartCandlestickIcon, ChartLineIcon, HomeIcon, LibraryBigIcon, MegaphoneIcon, SendToBackIcon, Settings2Icon, Undo2Icon } from "lucide-react"
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
    useSidebar,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent, // Move this import here
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
const items = [
    {
        title: "Home",
        url: "/home",
        icon: HomeIcon,
    },
    {
        title: "Market Data",
        url: "/market-data",
        icon: ChartCandlestickIcon,
    },
    {
        title: "News Aggregation",
        url: "/news",
        icon: MegaphoneIcon,
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BookOpenIcon,
    },
    {
        title: "Custom Queries / Agent",
        url: "/agent",
        icon: BotIcon,
    },
    {
        title: "Library / History",
        url: "/library",
        icon: LibraryBigIcon,
    },
    {
        title: "Settings / Privacy",
        url: "/settings",
        icon: Settings2Icon,
    },
]

export const DashboardSidebar = () => {
    const pathname = usePathname();
    const sidebar = useSidebar(); 
    const isActive = (url: string) => {
        if (url === "/") {
            return pathname === "/";
        }

        return pathname.startsWith(url);
    }

    return (
        <Sidebar variant="inset" className="group" collapsible="icon">
            <SidebarHeader>
                <div className="flex justify-between items-center">

                    <Button
                        asChild
                        variant="ghost"
                        className={cn(!sidebar.open && "hidden")}
                    >
                        <Link href="/">
                            <Undo2Icon />
                            Back
                        </Link>
                    </Button>
                    <SidebarTrigger className="hover:cursor-e-resize" />

                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Finacial agent</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive(item.url)}
                                        className={cn(
                                            isActive(item.url) && "bg-sidebar"
                                        )}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>

                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}