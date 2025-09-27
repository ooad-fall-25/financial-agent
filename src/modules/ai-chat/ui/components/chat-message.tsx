import { cn } from "@/lib/utils";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";

interface Chat {
  id: string;
  userId: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface Props {
  message: Chat;
}

export const ChatMessage = ({ message }: Props) => {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-lg p-3 max-w-md",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <AIResponse>{message.content}</AIResponse>
      </div>
    </div>
  );
};