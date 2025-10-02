"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import { myCustomTheme } from "../../lib/custom-theme";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";


export const EditView = ({ newsId }: { newsId: string }) => {
  const trpc = useTRPC();
  const { data: news } = useQuery(trpc.library.getOne.queryOptions({ newsId: newsId }));

  const { resolvedTheme } = useTheme();

  const editor = useCreateBlockNote();

  useEffect(() => {
    async function loadContent() {
      const blocks = await editor.tryParseMarkdownToBlocks(news?.aiRepsonse.toString() || "");
      editor.replaceBlocks(editor.document, blocks); // replace whole doc
    }
    loadContent();
  }, [editor]);


  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? myCustomTheme.dark : myCustomTheme.light}
      className="p-4 w-full h-full"
    />
  )
}