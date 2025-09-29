"use client";

import { Suspense, useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { MessagesContainer } from "../components/messages-container";


export const AIChatView = () => {
    
    return (
        <div className="h-full">
            <div className="flex flex-col min-h-0">
                <Suspense fallback={<p>loading messages. ... . </p>}>
                    <MessagesContainer />
                </Suspense>
            </div>
        </div>
    )
}