import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Conversation {
  id: string;
  title: string;
}

interface Props {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export const ConversationHistory = ({
  conversations,
  onSelectConversation,
  selectedConversationId,
}: Props) => {

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
              className={`p-2 rounded-md cursor-pointer ${
                selectedConversationId === convo.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelectConversation(convo.id)}
            >
              <p className="truncate font-semibold">
                {convo.title || "New Conversation"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  );
};