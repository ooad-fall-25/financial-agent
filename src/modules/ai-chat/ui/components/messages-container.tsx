import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageForm } from "./message-form";
import { useEffect, useRef, useState } from "react";
import { MessageCard } from "./message-card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConversationHistory } from "./conversation-history";
import { PlusCircle, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // 1. Create a local state to track the ID. 
  // This allows us to switch the UI to the new chat before the URL updates.
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId);

  // 2. Sync local state when the prop changes (e.g. user navigates history)
  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId]);

  const queryClient = useQueryClient();

  const { data: conversations } = useQuery(
    trpc.chat.getConversations.queryOptions()
  );

  // 3. Use activeConversationId for the query instead of the prop
  const chatHistoryQueryOptions = trpc.chat.getChatHistory.queryOptions({
    conversationId: activeConversationId!,
  });

  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
    ...chatHistoryQueryOptions,
    enabled: !!activeConversationId, // Enable if we have a local ID
  });

  const currentConversation = conversations?.find(
    (convo) => convo.id === activeConversationId
  );
  const originalTitle = currentConversation?.title || "New Chat";

  useEffect(() => {
    if (originalTitle) {
      setTitleValue(originalTitle);
    }
  }, [originalTitle]);

  const renameConversation = useMutation({
    ...trpc.chat.renameConversation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.chat.getConversations.queryOptions());
    },
  });

  const handleTitleDoubleClick = () => {
    if (activeConversationId) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };

  const saveTitle = () => {
    if (
      activeConversationId &&
      titleValue.trim() &&
      titleValue.trim() !== originalTitle
    ) {
      renameConversation.mutate({
        conversationId: activeConversationId,
        newTitle: titleValue.trim(),
      });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setTitleValue(originalTitle);
      setIsEditingTitle(false);
    }
  };

  const createUserMessage = useMutation({
    ...trpc.chat.createUserMessage.mutationOptions(),
    onError: (err) => {
      toast.error("Failed to send message. Please try again.");
      setIsGeneratingResponse(false);
    },
  });

  const createAIResponse = useMutation({
    ...trpc.chat.createAIResponse.mutationOptions(),
    onError: (err) => {
      toast.error("Failed to get AI response. Please try again.");
      setIsGeneratingResponse(false);
    },
    onSettled: () => {
      setIsGeneratingResponse(false);
    },
  });

  const handleSend = async (text: string, files?: File[]) => {
    if (text.trim()) {
      setPrompt(""); 
      setIsGeneratingResponse(true);

      try {
        // Step 1: Create user message
        const userMessageResult = await createUserMessage.mutateAsync({
          prompt: text,
          conversationId: activeConversationId || undefined, // Use activeId
        });

        const finalConversationId = userMessageResult.conversationId;

        // 4. Update local ID immediately. 
        // This triggers the useQuery to fetch the new message while keeping the component mounted.
        setActiveConversationId(finalConversationId);

        // Invalidate to show the user message immediately
        await queryClient.invalidateQueries({
          queryKey: trpc.chat.getChatHistory.queryOptions({
            conversationId: finalConversationId,
          }).queryKey,
        });
        await queryClient.invalidateQueries(
          trpc.chat.getConversations.queryOptions()
        );

        // Step 2: Generate AI response
        // Note: We have NOT called router.replace yet, so isGeneratingResponse stays true
        await createAIResponse.mutateAsync({
          prompt: text,
          conversationId: finalConversationId,
        });

        // Invalidate to show the AI response
        await queryClient.invalidateQueries({
          queryKey: trpc.chat.getChatHistory.queryOptions({
            conversationId: finalConversationId,
          }).queryKey,
        });
        await queryClient.invalidateQueries(
          trpc.chat.getConversations.queryOptions()
        );

        // 5. NOW we navigate. 
        // The AI response is done, so it's safe to reload/remount the page.
        if (!conversationId) {
          router.replace(`/agent/${finalConversationId}`);
        }

      } catch (error) {
        console.error("Error in handleSend:", error);
      }
    }
  };

  const handleCreateNewChat = () => {
    router.push("/agent");
    // Reset local state manually if navigating to same route base
    setActiveConversationId(undefined); 
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/agent/${id}`);
    setIsHistoryOpen(false);
  };

  const handleDeleteConversation = (deletedId: string) => {
    if (deletedId === activeConversationId) {
      router.push("/agent");
      setActiveConversationId(undefined);
    }
    setIsHistoryOpen(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory, isGeneratingResponse]);

  const isSending = createUserMessage.isPending || isGeneratingResponse;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-col sticky top-0 z-10 bg-background">
        <div className="px-8 pt-2 border-b flex justify-between items-center">
          {isEditingTitle ? (
            <Input
              autoFocus
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              className="text-xl font-bold h-9  max-w-1/5"
            />
          ) : (
            <h1
              className="text-xl font-bold truncate pr-4 cursor-pointer"
              onDoubleClick={handleTitleDoubleClick}
            >
              {originalTitle}
            </h1>
          )}
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
                onDeleteConversation={handleDeleteConversation}
                selectedConversationId={activeConversationId || null}
              />
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto space-y-2 pt-4 pb-28">
          {isLoadingHistory && !isSending && (
            <Spinner className="mx-auto" />
          )}
          {/* Check activeConversationId instead of conversationId prop */}
          {!activeConversationId && !isLoadingHistory && !isSending && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Select a conversation from history or start a new one.
              </p>
            </div>
          )}
          {chatHistory?.map((message: any) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              aiModelId=""
              createdAt={new Date(message.createdAt)}
              thoughts={message.thoughts}
            />
          ))}
          {isGeneratingResponse && (
            <MessageCard
              content=""
              role="assistant"
              aiModelId=""
              createdAt={new Date()}
              isLoading={true}
            />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <MessageForm
            prompt={prompt}
            setPrompt={setPrompt}
            onSend={handleSend}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
};