import { z } from "zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutoSize from "react-textarea-autosize";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { ArrowUpIcon, Paperclip, XIcon, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Spinner } from "@/components/ui/spinner";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilePreview } from "./file-preview";

interface Props {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSend: (text: string, files?: File[]) => void;
  isSending: boolean;
}

const formSchema = z.object({
  text: z.string().max(10000),
  files: z.array(z.instanceof(File)).optional(),
});

export const MessageForm = ({ onSend, isSending }: Props) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "", files: [] },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.text.trim() && (!values.files || values.files.length === 0)) return;
    const text = values.text;
    const files = values.files;
    form.reset({ text: "", files: [] });
    await onSend(text, files);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const current = form.getValues("files") ?? [];
      if (current.length + acceptedFiles.length > 10) {
        toast.error("Max 10 files allowed");
        return;
      }
      const valid = acceptedFiles.filter(
        (file) => file.size <= MAX_FILE_SIZE_BYTES && ACCEPTED_FILE_TYPES.includes(file.type)
      );
      if (valid.length !== acceptedFiles.length) {
        toast.error("Invalid files (Max 1MB, PDF/Excel only)");
      }
      form.setValue("files", [...current, ...valid], { shouldValidate: true });
    },
    [form]
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    accept: ACCEPTED_FILE_TYPES.reduce((acc, type) => { acc[type] = []; return acc; }, {} as Record<string, string[]>),
  });

  const files = form.watch("files") ?? [];

  return (
    <>
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-sm font-medium truncate">{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
            {previewFile && <FilePreview file={previewFile} />}
          </div>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form
          {...getRootProps()}
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative border p-4 pt-3 rounded-xl bg-sidebar dark:bg-sidebar transition-all flex flex-col gap-2",
            isFocused && "shadow-sm ring-1 ring-border",
            isDragActive && "border-dashed border-primary"
          )}
        >
          <input {...getInputProps()} />

          {/* Compact File Chips */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2 rounded-md border bg-background/50 px-2 py-1.5 text-xs font-medium transition-colors hover:bg-background"
                >
                  <div 
                    onClick={() => setPreviewFile(file)}
                    className="flex items-center gap-2 cursor-pointer hover:underline decoration-muted-foreground/50 underline-offset-2"
                  >
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFiles = [...files];
                      newFiles.splice(i, 1);
                      form.setValue("files", newFiles);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <TextareaAutoSize
                {...field}
                disabled={isSending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                className="resize-none border-none w-full outline-none bg-transparent text-sm placeholder:text-muted-foreground/70"
                placeholder="Message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
              />
            )}
          />

          <div className="flex gap-2 items-center justify-between mt-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={open}
              disabled={isSending}
            >
              <Paperclip className="size-4" />
            </Button>

            <Button
              type="submit"
              disabled={isSending || (!form.watch("text") && files.length === 0)}
              className={cn("size-8 rounded-lg p-0 transition-all", isSending && "bg-muted-foreground")}
            >
              {isSending ? <Spinner className="size-4" /> : <ArrowUpIcon className="size-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};