import { z } from "zod";
import { ChangeEvent, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutoSize from "react-textarea-autosize";


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { ArrowUpIcon, Loader2Icon, XIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

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
        .array(
            z.instanceof(File, { message: "Must be a valid file" })
        )
        .max(10, { message: "You can upload up to 10 files" })
        .optional()
})


export const MessageForm = ({ onSend, isSending }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: "", files: [] },
    });

    const [isFocused, setIsFocused] = useState(false);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        form.reset({ text: "", files: [] });
        await onSend(values.text, values.files);
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            form.setValue("files", [...(form.getValues("files") ?? []), ...acceptedFiles]);
        },
        [form]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    return (
        <Form {...form}>
            {/* File preview */}
            <div className="mt-3 flex flex-col gap-x-2">
                {(form.watch("files") ?? []).map((file, i) => (
                    <div
                        key={i}
                        className="rounded-t-xl flex justify-between items-center bg-background border-t border-secondary px-3"
                    >
                        <div className="flex w-full justify-between items-center pr-4">
                            <p className="text-xs font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            className="ml-auto bg-transparent hover:bg-transparent text-primary hover:text-destructive"
                            onClick={() => {
                                const files = [...(form.getValues("files") ?? [])];
                                files.splice(i, 1);
                                form.setValue("files", files, { shouldValidate: true });
                            }}
                        >
                            <XIcon />
                        </Button>
                    </div>
                ))}
            </div>

            <form
                {...getRootProps()}
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs",
                    isDragActive && "border-dashed border-primary"
                )}
            >
                {/* Invisible dropzone input */}
                <input {...getInputProps()} />

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
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            placeholder="What would you like to ask?"
                            onKeyDown={(e) => {
                                // Ctrl/Cmd + Enter sends the message
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(); // no arguments!
                                }
                            }}
                        />
                    )}
                />

                <div className="flex gap-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span>&#8984;</span>Enter
                        </kbd>
                        &nbsp;to submit
                    </div>

                    <Button
                        type="submit" // important to trigger form submit
                        disabled={isSending}
                        className={cn("size-8 rounded-full", isSending && "bg-muted-foreground border")}
                    >
                        {isSending ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon />}
                    </Button>
                </div>
            </form>
        </Form>
    );
};