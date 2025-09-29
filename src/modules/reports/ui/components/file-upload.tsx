"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const FileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const trpc = useTRPC();
    const getUploadUrl = useQuery(trpc.reports.getUploadUrl.queryOptions(
        { fileName: file?.name || "" },
        { enabled: false } // only run manually
    ))

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            // Get presigned URL
            const {data} = await getUploadUrl.refetch();

            // Upload directly to S3
            await fetch(data?.url || "#", {
                method: "PUT",
                body: file,
            });

            alert("Upload successful!");
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-md mx-auto mt-10">
            <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Uploading..." : "Upload"}
            </Button>
        </div>
    );
}
