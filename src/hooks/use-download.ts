"use client";
import { useState } from "react";

export const useDownload = () => {
  const [isDownloadMD, setIsDownloadMD] = useState(false);
  const downloadMarkdown = (filename: string, text: string) => {
    setIsDownloadMD(true);
    try {
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadMD(false);
    }
  };

  return {
    downloadMarkdown,
    isDownloadMD,
  };
};
