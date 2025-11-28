import z from "zod";


export const FileInfoSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    content: z.string(),
    s3Key: z.string(), 
});

export type FileInfo = z.infer<typeof FileInfoSchema>;