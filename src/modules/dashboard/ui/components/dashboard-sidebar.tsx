"use client";

import { BookOpenIcon, BotIcon, ChartCandlestickIcon, ChartLineIcon, HomeIcon, MegaphoneIcon, Settings2Icon } from "lucide-react"
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
        title: "Analytics / Trends",
        url: "/analytics",
        icon: ChartLineIcon,
    },
    {
        title: "Settings / Privacy",
        url: "/settings",
        icon: Settings2Icon,
    },
]

export const DashboardSidebar = () => {
    const pathname = usePathname();
    const isActive = (url: string) => {
        if (url === "/") {
            return pathname === "/";
        }

        return pathname.startsWith(url);
    }

    return (
        <Sidebar className="group" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                Back
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
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
                                            isActive(item.url) && "bg-gradient-to-b from-sidebar-primary to-[#b91c1c]! text-sidebar-primary-foreground! hover:to-[#b91c1c]/90!"
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

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <UserButton
                            showName
                            appearance={{
                                elements: {
                                    rootBox: "w-full! h-8!",
                                    userButtonTrigger: "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                                    userButtonBox: "w-full! flex-row-reverse! justify-end! group-data-[collapsible=icon]:justify-center! text-sidebar-foreground!",
                                    userButtonOuterIdentifier: "pl-0! group-data-[collapsible=icon]:hidden!",
                                    avatarBox: "size-4!"
                                }
                            }}
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}