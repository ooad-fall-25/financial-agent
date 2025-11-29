import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { CheckIcon, CopyIcon, BrainCircuit, Loader2, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"; // Ensure you have this component
import { FilePreview } from "./file-preview";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileInfo } from "../../types";
import { Media } from "@/generated/prisma";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

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
  media?: Media[];
}

export const UserMessage = ({ content, media }: UserMessageProps) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const trpc = useTRPC();
  const createGetPreSignedUrl = useMutation(trpc.chat.createGetPreSignedUrl.mutationOptions());

  const handleFileClick = async (item: Media) => {
    if (downloadingKey) return;
    try {
      setDownloadingKey(item.s3Key);
      const url = await createGetPreSignedUrl.mutateAsync({ mediaId: item.id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const file = new File([blob], item.fileName, { type: item.mimeType });
      setPreviewFile(file);
    } catch (e) {
      toast.error("Failed to load file");
    } finally {
      setDownloadingKey(null);
    }
  };

  const formatSize = (bytes: bigint) => {
    const num = Number(bytes);
    if (num < 1024) return num + " B";
    if (num < 1024 * 1024) return (num / 1024).toFixed(0) + " KB";
    return (num / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <>
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-2 border-b">
            <DialogTitle className="text-sm font-medium truncate">{previewFile?.name}</DialogTitle>
          </DialogHeader>

          <div className="overflow-auto bg-accent">
            {previewFile && <FilePreview file={previewFile} />}
          </div>
        </DialogContent>
      </Dialog>

      <div className={cn("flex flex-col items-end pb-6 pr-2 pl-10 group relative")}>
        {/* Message Bubble */}
        <Card className="rounded-2xl rounded-tr-sm bg-secondary px-4 py-2.5 shadow-none border-none max-w-[85%] text-sm leading-relaxed">
          {content}
        </Card>

        {/* File Attachments */}
        {media && media.length > 0 && (
          <div className="flex flex-col items-end gap-1.5 mt-2 w-full">
            {media.map((item, index) => {
              const isDownloading = downloadingKey === item.s3Key;
              const isPdf = item.mimeType.includes("pdf");

              return (
                <div
                  key={index}
                  onClick={() => handleFileClick(item)}
                  className="flex items-center gap-3 bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-border/50 transition-all rounded-xl p-2.5 cursor-pointer pr-4 max-w-[280px]"
                >
                  <div className="size-9 rounded-lg bg-background/80 flex items-center justify-center shrink-0 border border-border/30 shadow-sm">
                    {isDownloading ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : isPdf ? (
                      <FileText className="size-4 text-red-500/80" />
                    ) : (
                      <FileSpreadsheet className="size-4 text-green-600/80" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden text-right min-w-0">
                    <span className="text-xs font-medium truncate w-full text-foreground/90">
                      {item.fileName}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground/80 font-medium uppercase tracking-wide">
                      <span>{isPdf ? "PDF" : "EXCEL"}</span>
                      <span className="size-0.5 rounded-full bg-muted-foreground/50" />
                      <span>{formatSize(item.sizeBytes)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="absolute top-2 right-full mr-2">
          <CopyButton text={content} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground size-6" />
        </div>
      </div>
    </>
  );
};
interface AssistantMessageProps {
  content: string;
  createdAt: Date;
  aiModelId: string | null;
  thoughts?: string | null;
  isLoading?: boolean;
}

export const AssistantMessage = ({
  content,
  createdAt,
  aiModelId,
  thoughts,
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
      {thoughts && (
        <details className="mt-2 mx-4 bg-muted/50 rounded-lg border">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground p-2 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Show Thoughts
          </summary>
          <div className="p-2 border-t">
            <pre className="text-xs whitespace-pre-wrap font-mono bg-transparent p-2 rounded-md">
              <code>{thoughts}</code>
            </pre>
          </div>
        </details>
      )}
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
  thoughts?: string | null;
  className?: string;
  isLoading?: boolean;
  media?: Media[];
}

export const MessageCard = ({
  content,
  role,
  createdAt,
  aiModelId,
  thoughts,
  className,
  isLoading,
  media,
}: Props) => {
  if (role === "assistant") {
    return (
      <div className={cn(className)}>
        <AssistantMessage
          content={content}
          createdAt={createdAt}
          aiModelId={aiModelId}
          thoughts={thoughts}
          isLoading={isLoading}
        />
      </div>
    );
  }
  return (
    <div className={cn(className)}>
      <UserMessage content={content} media={media} />
    </div>
  );
};
