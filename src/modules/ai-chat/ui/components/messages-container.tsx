import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const MessagesContainer = ({
  conversationId,
}: MessagesContainerProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [prompt, setPrompt] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery(
    trpc.chat.getConversations.queryOptions()
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
        })
      );
      setPrompt("");
    },
  });

  const handleSend = async (text: string, files?: File[]) => {
    if (text.trim()) {
      await createMessage.mutateAsync({
        prompt: text, // i change this to get text from form, becuase form is validated but the prompts does not
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
    <div className="h-screen flex flex-col">
      <div className="flex flex-col sticky top-0 z-10 bg-background">
        <div className="px-8 pt-2 border-b flex justify-between items-center">
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
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto space-y-2 pt-4 pb-28">
          {isLoadingHistory && <Loader className="mx-auto animate-spin" />}
          {!conversationId && !isLoadingHistory && (
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
  );
};
