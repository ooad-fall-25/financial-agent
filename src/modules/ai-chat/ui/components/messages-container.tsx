import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageForm } from "./message-form";
import { useEffect, useRef, useState } from "react";
import { MessageCard } from "./message-card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConversationHistory } from "./conversation-history";
import { PlusCircle, History, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

interface MessagesContainerProps {
    conversationId?: string;
}

export const MessagesContainer = ({ conversationId }: MessagesContainerProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const bottomRef = useRef<HTMLDivElement>(null);

    const [prompt, setPrompt] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: conversations } = useQuery(
        trpc.chat.getConversations.queryOptions(),
    );

    const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
        ...trpc.chat.getChatHistory.queryOptions({
            conversationId: conversationId!,
        }),
        enabled: !!conversationId,
    });

    const createMessage = useMutation({
        ...trpc.chat.createChatMessage.mutationOptions(),
        onSuccess: (data) => {
            // If this was a new chat, navigate to the new conversation's URL
            if (!conversationId) {
                router.push(`/agent/${data.conversationId}`);
            }
            queryClient.invalidateQueries(trpc.chat.getConversations.queryOptions());
            queryClient.invalidateQueries(
                trpc.chat.getChatHistory.queryOptions({
                    conversationId: data.conversationId,
                }),
            );
            setPrompt("");
        },
    });

    const handleSend = () => {
        if (prompt.trim()) {
            createMessage.mutate({
                prompt,
                conversationId: conversationId || undefined,
            });
        }
    };

    const handleCreateNewChat = () => {
        router.push("/agent");
    };

    const handleSelectConversation = (id: string) => {
        router.push(`/agent/${id}`);
        setIsHistoryOpen(false);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const currentConversation = conversations?.find(
        (convo) => convo.id === conversationId
    );
    const title = currentConversation?.title || "New Chat";

    return (
        <div className="flex flex-col flex-1 min-h-0 ">
                 
            <div className="flex-1 pb-44 pt-12 overflow-y-auto">
                <div className="max-w-3xl mx-auto pt-2 pb-4 ">
                     <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="text-xl font-bold truncate pr-4">{title}</h1>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={handleCreateNewChat}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <History className="h-4 w-4 mr-2" />
                            History
                          </Button>
                        </DialogTrigger>
                        <ConversationHistory
                          conversations={conversations || []}
                          onSelectConversation={handleSelectConversation}
                          selectedConversationId={conversationId || null}
                        />
                      </Dialog>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-8/12">
                    {isLoadingHistory && <Loader className="mx-auto animate-spin" />}
                    {!conversationId && !isLoadingHistory && (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          Select a conversation from history or start a new one.
                        </p>
                      </div>
                    )}
                    
                  </div>
                  <div className="h-75 overflow-y-auto">
                    {chatHistory?.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            aiModelId=""
                            createdAt={message.createdAt}
                        />
                    ))}
                  </div>
                </div>

                {/* {isLastMessageUser && <MessageLoading />} */}
                <div ref={bottomRef} />
            </div>

            <div className="absolute bottom-0 right-0 left-0 pointer-events-none ">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    {/* <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" /> */}
                    <MessageForm
                        prompt={prompt}
                        setPrompt={setPrompt}
                        onSend={handleSend}
                        isSending={createMessage.isPending}
                    />
                </div>
            </div>

        </div>
    )
}