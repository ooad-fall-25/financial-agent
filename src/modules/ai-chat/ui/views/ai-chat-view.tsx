"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChatMessage } from "../components/chat-message";
import { ChatInput } from "../components/chat-input";
import { Loader } from "lucide-react";

export const AIChatView = () => {
  const [prompt, setPrompt] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: chatHistory, isLoading } = useQuery(
    trpc.chat.getChatHistory.queryOptions(),
  );

  const createMessage = useMutation(
    trpc.chat.createChatMessage.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.chat.getChatHistory.queryOptions());
        setPrompt("");
      },
    }),
  );

  const handleSend = () => {
    if (prompt.trim()) {
      createMessage.mutate({ prompt });
    }
  };

  return (
    <div className="flex flex-col h-screen  mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-9/12">
        {isLoading && <Loader className="mx-auto animate-spin" />}
        {chatHistory?.map((chat) => (
          <ChatMessage key={chat.id} message={chat} />
        ))}
        {createMessage.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 max-w-xs max-h-2/12">
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