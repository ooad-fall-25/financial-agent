import { Media, Message } from "@/generated/prisma";
import z from "zod";


export const FileInfoSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    content: z.string(),
    s3Key: z.string(), 
    url: z.string().optional(), 
});

export type MessageHistory = {
  message: Message;
  media: Media[];
};

export type FileInfo = z.infer<typeof FileInfoSchema>;