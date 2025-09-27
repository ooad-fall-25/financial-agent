// src/modules/ai-chat/ui/views/ai-chat-view.tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChatMessage } from "../components/chat-message";
import { ChatInput } from "../components/chat-input";
import { Loader, History, PlusCircle } from "lucide-react";
import { ConversationHistory } from "../components/conversation-history";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AIChatView = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const trpc = useTRPC();
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

  return (
    <div className="flex flex-col h-screen mx-auto">
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
        {chatHistory?.map((chat) => (
          <ChatMessage key={chat.id} message={chat} />
        ))}
        {createMessage.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 max-w-xs">
              <Loader className="animate-spin h-5 w-5" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSend={handleSend}
          isSending={createMessage.isPending}
        />
      </div>
    </div>
  );
};