import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { MessageForm } from "./message-form";
import { useEffect, useRef, useState } from "react";
import { MessageCard } from "./message-card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConversationHistory } from "./conversation-history";
import { PlusCircle, History, Loader } from "lucide-react";



export const MessagesContainer = () => {
    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastAssistantMessageIdRef = useRef<string | null>(null);

    const [prompt, setPrompt] = useState("");
    const [selectedConversationId, setSelectedConversationId] = useState<
        string | null
    >(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: conversations } = useQuery(
        trpc.chat.getConversations.queryOptions(),
    );

    const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
        ...trpc.chat.getChatHistory.queryOptions({
            conversationId: selectedConversationId!,
        }),
        enabled: !!selectedConversationId,
    });

    const createMessage = useMutation({
        ...trpc.chat.createChatMessage.mutationOptions(),
        onSuccess: (data) => {
            if (!selectedConversationId) {
                setSelectedConversationId(data.conversationId);
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
                conversationId: selectedConversationId || undefined,
            });
        }
    };

    const handleCreateNewChat = () => {
        setSelectedConversationId(null);
        setPrompt("");
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);



    return (
        <div className="flex flex-col flex-1 min-h-0 ">
                 
            <div className="flex-1 pb-44 pt-12 overflow-y-auto">
                <div className="max-w-3xl mx-auto pt-2 pb-4 ">
                     <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="text-xl font-bold">AI Chat</h1>
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
                          onSelectConversation={setSelectedConversationId}
                          selectedConversationId={selectedConversationId}
                          onClose={() => setIsHistoryOpen(false)}
                        />
                      </Dialog>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-8/12">
                    {isLoadingHistory && <Loader className="mx-auto animate-spin" />}
                    {!selectedConversationId && !isLoadingHistory && (
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
                {/* <div ref={bottomRef} /> */}
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