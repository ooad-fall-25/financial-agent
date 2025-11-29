import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageForm } from "./message-form";
import { useEffect, useRef, useState } from "react";
import { MessageCard } from "./message-card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConversationHistory } from "./conversation-history";
import { PlusCircle, History, ArrowLeft, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { FileInfo, MessageHistory } from "../../types";
import { Media } from "@/generated/prisma";

interface MessagesContainerProps {
  conversationId?: string;
}

export const MessagesContainer = ({ conversationId }: MessagesContainerProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // FIX: Use local state to handle ID switching immediately, 
  // preventing UI flicker before the URL updates.
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  // Sync prop with local state when navigation actually completes
  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId]);

  const { data: conversations } = useQuery(trpc.chat.getConversations.queryOptions());
  
  // Use activeConversationId for queries so we can switch the UI instantly
  const chatHistoryQueryOptions = trpc.chat.getChatHistory.queryOptions({
    conversationId: activeConversationId!,
  });
  const chatHistoryQueryKey = chatHistoryQueryOptions.queryKey;

  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
    ...chatHistoryQueryOptions,
    enabled: !!activeConversationId,
  });

  const createPutPreSignedUrl = useMutation(trpc.chat.createPutPreSignedUrl.mutationOptions());
  const extractText = useMutation(trpc.chat.extractText.mutationOptions());
  const currentConversation = conversations?.find(c => c.id === activeConversationId);
  const originalTitle = currentConversation?.title || "New Chat";

  useEffect(() => {
    if (originalTitle) setTitleValue(originalTitle);
  }, [originalTitle]);

  const renameConversation = useMutation({
    ...trpc.chat.renameConversation.mutationOptions(),
    onSuccess: () => queryClient.invalidateQueries(trpc.chat.getConversations.queryOptions()),
  });

  const createMessage = useMutation({
    ...trpc.chat.createChatMessage.mutationOptions(),
    onMutate: async (newMessage) => {
      // 1. Cancel queries for the CURRENT active ID (which might be undefined for New Chat)
      await queryClient.cancelQueries({ queryKey: chatHistoryQueryKey });
      const previousChatHistory = queryClient.getQueryData(chatHistoryQueryKey);

      // Optimistic Media Setup
      const optimisticMedia: Media[] = newMessage.fileInfoList.map((f, i) => ({
        id: `opt-media-${i}`,
        userId: "me",
        createdAt: new Date(),
        updatedAt: new Date(),
        fileName: f.fileName,
        s3Key: f.s3Key,
        mimeType: f.fileType,
        sizeBytes: BigInt(f.fileSize),
        extractedContext: "",
        s3Bucket: "temp-bucket",
        messageId: "temp-message-id"
      }));

      // 2. Optimistic Update
      queryClient.setQueryData(chatHistoryQueryKey, (oldData: any) => {
        const now = new Date();
        const optimisticUserMessage: MessageHistory = {
          message: {
            id: `optimistic-user-${Date.now()}`,
            conversationId: activeConversationId || "temp",
            role: "user",
            content: newMessage.prompt,
            userId: "me",
            createdAt: now,
            thoughts: null,
            updatedAt: now,
          } as any,
          media: optimisticMedia,
        };

        const optimisticAssistantMessage: MessageHistory = {
          message: {
            id: `optimistic-assistant-${Date.now()}`,
            conversationId: activeConversationId || "temp",
            role: "assistant",
            content: "",
            userId: "me",
            createdAt: now,
            thoughts: null,
            updatedAt: now,
            isLoading: true,
          } as any,
          media: [],
        };

        const old = Array.isArray(oldData) ? oldData : [];
        return [...old, optimisticUserMessage, optimisticAssistantMessage];
      });

      // Return context including the key we used, so we can revert/clear strictly that key later
      return { previousChatHistory, queryKeyUsed: chatHistoryQueryKey };
    },
    onError: (_, __, context) => {
      toast.error("Failed to send message.");
      if (context?.previousChatHistory) {
        queryClient.setQueryData(context.queryKeyUsed, context.previousChatHistory);
      }
    },
    onSuccess: (data, _, context) => {
      // FIX: Clean up the "New Chat" cache.
      // If we started this mutation with conversationId=undefined, the cache for 'undefined'
      // now holds the optimistic message. We MUST clear it so returning to /agent is clean.
      if (!conversationId && context?.queryKeyUsed) {
        queryClient.setQueryData(context.queryKeyUsed, []); 
      }

      // 3. Switch local state to the NEW ID immediately
      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
      }

      // 4. Navigate
      if (!conversationId) {
        router.push(`/agent/${data.conversationId}`);
      }
    },
    onSettled: (data) => {
      const finalId = data?.conversationId || activeConversationId;
      if (finalId) {
        queryClient.invalidateQueries(trpc.chat.getChatHistory.queryOptions({ conversationId: finalId }));
      }
      queryClient.invalidateQueries(trpc.chat.getConversations.queryOptions());
    },
  });

  const handleSend = async (text: string, files?: File[]) => {
    const fileInfoList: FileInfo[] = [];
    if (files) {
      for (const file of files) {
        try {
            const buffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
            const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

            const { signedURL: url, key } = await createPutPreSignedUrl.mutateAsync({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                checkSum: hashHex,
            });

            const res = await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            if (res.ok) {
                const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = error => reject(error);
                });
                const base64String = await toBase64(file);
                const extension = file.type === "application/pdf" ? "pdf" : "xlsx";
                
                const { content } = await extractText.mutateAsync({
                    buffer: base64String,
                    type: extension,
                });

                fileInfoList.push({
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    content: content,
                    s3Key: key, 
                });
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to upload ${file.name}`);
        }
      }
    }

    if (text.trim() || fileInfoList.length > 0) {
      await createMessage.mutateAsync({
        prompt: text,
        conversationId: activeConversationId || undefined,
        fileInfoList: fileInfoList,
      });
    }
  };

  const handleCreateNewChat = () => {
    router.push("/agent");
    setActiveConversationId(undefined); // Explicitly reset local state
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/agent/${id}`);
    setIsHistoryOpen(false);
  };

  const handleDeleteConversation = (id: string) => { 
    if (id === activeConversationId) {
        handleCreateNewChat();
    }
    setIsHistoryOpen(false); 
  };

  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatHistory, createMessage.isPending]);

  return (
    <div className="h-screen flex flex-col bg-background">
      
      <div className="flex flex-col sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b">
        <div className="px-8 p-2 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden ">
            <Button variant="ghost" size="icon" onClick={handleCreateNewChat} className="-ml-2 text-muted-foreground">
                <ArrowLeft className="size-4" />
            </Button>
            
            {isEditingTitle ? (
                <Input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => {
                    if(activeConversationId && titleValue.trim()) renameConversation.mutate({ conversationId: activeConversationId, newTitle: titleValue });
                    setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                    if(e.key === "Enter") e.currentTarget.blur();
                    if(e.key === "Escape") { setTitleValue(originalTitle); setIsEditingTitle(false); }
                }}
                className="text-lg font-bold h-8 w-[300px]"
                />
            ) : (
                <h1
                className="text-lg font-bold truncate cursor-pointer"
                onDoubleClick={() => activeConversationId && setIsEditingTitle(true)}
                title="Double click to rename"
                >
                {originalTitle}
                </h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/agent")}
                className="hidden sm:flex"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">History</span>
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
        <div className="max-w-3xl mx-auto space-y-2 pt-4 pb-15">
          
          {isLoadingHistory && !createMessage.isPending && (
             <div className="flex justify-center py-10 opacity-50">
                 <Spinner className="size-6" />
             </div>
          )}

          {!activeConversationId && !isLoadingHistory && !createMessage.isPending && (
            <div className="flex items-center justify-center h-full">
                <div className="p-4 bg-muted/50 rounded-full">
                    <MessageSquarePlus className="size-8 stroke-1" />
                </div>
                <p className="text-lg font-medium">Start a new conversation</p>
             </div>
          )}
          
          {chatHistory?.map((item: any) => (
            <MessageCard
              key={item.message.id}
              content={item.message.content}
              role={item.message.role}
              aiModelId=""
              createdAt={new Date(item.message.createdAt)}
              isLoading={item.message.isLoading || isLoadingHistory}
              thoughts={item.message.thoughts}
              media={item.media}
            />
          ))}
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-4 border-t">
        <div className="max-w-3xl mx-auto">
          <MessageForm
            prompt=""
            setPrompt={() => {}}
            onSend={handleSend}
            isSending={createMessage.isPending}
          />
        </div>
      </div>
    </div>
  );
};