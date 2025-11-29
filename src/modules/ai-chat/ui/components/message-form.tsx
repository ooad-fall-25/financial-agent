import { z } from "zod";
import { ChangeEvent, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutoSize from "react-textarea-autosize";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { ArrowUpIcon, FileTextIcon, Paperclip, XIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Spinner } from "@/components/ui/spinner";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { toast } from "sonner";
import { FilePreview } from "./file-preview";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSend: (text: string, files?: File[]) => void;
  isSending: boolean;
}

const formSchema = z.object({
  text: z
    .string()
    .min(1, { message: "Value is required" })
    .max(10000, { message: "Value is too long" }),
  files: z
    .array(z.instanceof(File, { message: "Must be a valid file" }))
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE_BYTES),
      "Max file size is 1 MB"
    )
    .refine(
      (files) => files.every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
      "Only pdf and excel files are accepted"
    )
    .max(10, { message: "You can upload up to 10 files" })
    .optional(),
});

export const MessageForm = ({ onSend, isSending }: Props) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null); // State for the modal
  const [isFocused, setIsFocused] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "", files: [] },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    form.reset({ text: "", files: [] });
    await onSend(values.text, values.files);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const current = form.getValues("files") ?? [];

      if (current.length + acceptedFiles.length > 10) {
        toast.error("Can only upload 10 files at a time");
        return;
      }

      const valid = acceptedFiles.filter(
        (file) =>
          file.size <= MAX_FILE_SIZE_BYTES &&
          ACCEPTED_FILE_TYPES.includes(file.type)
      );

      const invalid = acceptedFiles.filter((file) => !valid.includes(file));

      if (invalid.length > 0) {
        toast.error("Some files were rejected (Max 1MB, PDF/Excel only)");
      }

      form.setValue("files", [...current, ...valid], { shouldValidate: true });
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true, // Important: we trigger manually via button
    noKeyboard: true,
    accept: ACCEPTED_FILE_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  const files = form.watch("files") ?? [];

  return (
    <>
      {/* File Preview Modal - Pops up when viewing a file */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-sm font-medium truncate">
              {previewFile?.name}
            </DialogTitle>
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
            "relative border rounded-2xl bg-sidebar dark:bg-sidebar transition-all shadow-sm",
            isFocused ? "border-primary/50 shadow-md" : "border-border",
            isDragActive && "border-dashed border-primary ring-1 ring-primary/20"
          )}
        >
          {/* Invisible Dropzone Input */}
          <input {...getInputProps()} />

          {/* File List Area (Pill/Card style) */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="group relative flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  
                  <button
                    type="button"
                    onClick={() => setPreviewFile(file)}
                    className="max-w-[150px] truncate hover:underline underline-offset-2"
                  >
                    {file.name}
                  </button>
                  
                  <span className="text-muted-foreground/60">
                    ({(file.size / 1024).toFixed(0)}KB)
                  </span>

                  <button
                    type="button"
                    className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFiles = [...files];
                      newFiles.splice(i, 1);
                      form.setValue("files", newFiles, { shouldValidate: true });
                    }}
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 p-4">
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
                  className="resize-none border-none w-full outline-none bg-transparent text-sm placeholder:text-muted-foreground"
                  placeholder="Send a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if(!isSending) form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              )}
            />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-8 rounded-full p-0 hover:bg-muted text-muted-foreground"
                onClick={open}
                disabled={isSending}
              >
                <Paperclip className="size-4" />
                <span className="sr-only">Attach file</span>
              </Button>

              <div className="flex items-center gap-2">
                <div className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                  <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground">
                    Enter
                  </kbd>
                  &nbsp;to send
                </div>

                <Button
                  type="submit"
                  disabled={isSending || (!form.watch("text") && files.length === 0)}
                  size="sm"
                  className={cn(
                    "rounded-full transition-all",
                    isSending ? "w-12" : "w-8 aspect-square p-0"
                  )}
                >
                  {isSending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <ArrowUpIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};