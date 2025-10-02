import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Conversation {
  id: string;
  title: string;
}

interface Props {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export const ConversationHistory = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  selectedConversationId,
}: Props) => {
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null);
  const [newTitle, setNewTitle] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const renameConversation = useMutation({
    ...trpc.chat.renameConversation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.chat.getConversations.queryOptions());
      setEditingConversationId(null);
      setNewTitle("");
    },
  });

  const deleteConversation = useMutation({
    ...trpc.chat.deleteConversation.mutationOptions(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(trpc.chat.getConversations.queryOptions());
      onDeleteConversation(variables.conversationId);
    },
  });

  const handleStartEditing = (convo: Conversation) => {
    setEditingConversationId(convo.id);
    setNewTitle(convo.title);
  };

  const handleCancelEditing = () => {
    setEditingConversationId(null);
    setNewTitle("");
  };

  const handleSave = () => {
    if (newTitle.trim() && editingConversationId) {
      renameConversation.mutate({
        conversationId: editingConversationId,
        newTitle: newTitle.trim(),
      });
    }
  };

  const handleDelete = (conversationId: string) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation.mutate({ conversationId });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancelEditing();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Conversation History</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col space-y-2">
        <div className="flex-1 overflow-y-auto max-h-96">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`flex items-center justify-between p-2 rounded-md group ${
                selectedConversationId === convo.id ? "bg-muted" : ""
              }`}
            >
              {editingConversationId === convo.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleCancelEditing} // Quit edit mode on blur
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={renameConversation.isPending}
                    onMouseDown={(e) => e.preventDefault()} // Prevents onBlur from firing before onClick
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectConversation(convo.id)}
                  >
                    <p className="truncate font-semibold">
                      {convo.title || "New Chat"}
                    </p>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEditing(convo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(convo.id)}
                      disabled={deleteConversation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  );
};