import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query"
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";


export const MessagesContainer = () => {
    const trpc = useTRPC(); 
    const bottomRef = useRef<HTMLDivElement>(null); 
    const lastAssistantMessageIdRef = useRef<string | null>(null);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                {/* <div className="pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard 
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            type={message.type}
                        />
                    ))}
                    
                </div>
                    {isLastMessageUser && <MessageLoading />}
                <div ref={bottomRef}/> */}
            </div>

            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none"/>
                 <MessageForm />
            </div>
            
        </div>
    )
}