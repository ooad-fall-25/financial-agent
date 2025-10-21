import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"; // Ensure you have this component

interface CopyProps {
  text: string;
  className?: string;
}

const CopyButton = ({ text, className }: CopyProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy!");
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleCopy}
      className={cn(
        "border-none !bg-transparent !hover:bg-transparent",
        className
      )}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};

interface UserMessageProps {
  content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className={cn("flex flex-col items-end pb-4 pr-2 pl-10 group")}>
      <Card className="rounded-lg bg-secondary p-3 shadow-none border-none max-w-[80%] break-words text-sm">
        {content}
      </Card>
      <CopyButton
        text={content}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
      />
    </div>
  );
};

interface AssistantMessageProps {
  content: string;
  createdAt: Date;
  aiModelId: string | null;
  isLoading?: boolean;
}

export const AssistantMessage = ({
  content,
  createdAt,
  aiModelId,
  isLoading,
}: AssistantMessageProps) => {
  if (isLoading) {
    return (
      <div className="flex items-start group pb-4 px-4">
        <div className="flex items-center pt-1">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col group pb-4")}>
      <div className="flex items-center gap-2 mb-2 px-4">
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <div className="flex flex-col gap-y-4 px-4">
        <AIResponse className="text-sm space-y-4">{content}</AIResponse>
      </div>
      <div className="flex items-center gap-2 mt-2 px-4">
        <CopyButton
          text={content}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
        />
      </div>
    </div>
  );
};

interface Props {
  content: string;
  role: string;
  createdAt: Date;
  aiModelId: string | null;
  className?: string;
  isLoading?: boolean;
}

export const MessageCard = ({
  content,
  role,
  createdAt,
  aiModelId,
  className,
  isLoading,
}: Props) => {
  if (role === "assistant") {
    return (
      <div className={cn(className)}>
        <AssistantMessage
          content={content}
          createdAt={createdAt}
          aiModelId={aiModelId}
          isLoading={isLoading}
        />
      </div>
    );
  }
  return (
    <div className={cn(className)}>
      <UserMessage content={content} />
    </div>
  );
};
