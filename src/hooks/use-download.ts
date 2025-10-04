"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export const useDownload = () => {
  const trpc = useTRPC();
  const [isDownloadingMD, setIsDownloadingMD] = useState(false);

  const {mutateAsync: mutateAsyncAsPDF, isPending: isDownloadingPDF} = useMutation(
    trpc.library.convertMarkdownToPdf.mutationOptions()
  );

  const downloadAsMarkdown = (filename: string, text: string) => {
    setIsDownloadingMD(true);
    try {
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingMD(false);
    }
  };

  const downloadAsPDF = async (filename: string, text: string) => {
      const result = await mutateAsyncAsPDF({ markdown: text });

      // Convert base64 -> Blob
      const pdfData = atob(result);
      const buffer = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        buffer[i] = pdfData.charCodeAt(i);
      }

      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
  };

  return {
    downloadAsMarkdown,
    isDownloadingMD,
    downloadAsPDF,
    isDownloadingPDF,
  };
};
