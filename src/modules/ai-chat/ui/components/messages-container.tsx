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

    const handleSend = async (text: string, files?: File[]) => {
        if (text.trim()) {
            await createMessage.mutateAsync({
                prompt: text, // i change this to get text from form, becuase form is validated but the prompts does not  
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
        <div className="h-screen flex flex-col">
            {/* Sticky Header */}
            <div className="flex flex-col sticky top-0 z-10 bg-background">
                <div className="px-8 pt-2 border-b flex justify-between items-center">
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
            </div>

            <div className="flex-1 overflow-y-auto px-4">
                <div className="max-w-3xl mx-auto space-y-2 pt-4 pb-28">
                    {isLoadingHistory && <Loader className="mx-auto animate-spin" />}
                    {!selectedConversationId && !isLoadingHistory && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                                Select a conversation from history or start a new one.
                            </p>
                        </div>
                    )}
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

            <div className="sticky bottom-0 border-t bg-background px-4 py-2">
                <div className="max-w-3xl mx-auto">
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