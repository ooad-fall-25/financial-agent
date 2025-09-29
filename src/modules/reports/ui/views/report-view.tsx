"use client";

import { Suspense, useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { MessagesContainer } from "../components/messages-container";


export const ReportView = () => {

    return (
        <div className="h-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <Suspense fallback={<p>loading messages. ... . </p>}>
                        <MessagesContainer />
                    </Suspense>
                </ResizablePanel>

                <ResizableHandle className="hover:bg-primary transition-colors bg-accent" />

                <ResizablePanel
                    defaultSize={65}
                    minSize={50}

                >
                    text
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}