import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Props {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSend: () => void;
  isSending: boolean;
}

export const ChatInput = ({ prompt, setPrompt, onSend, isSending }: Props) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isSending) {
      onSend();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={isSending}
      />
      <Button onClick={onSend} disabled={isSending || !prompt.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};