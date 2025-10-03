"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import { myCustomTheme } from "../../lib/custom-theme";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { LibraryDetailHeader } from "../components/library-detail-header";
import { Button } from "@/components/ui/button";


export const EditView = ({ newsId }: { newsId: string }) => {
  const { resolvedTheme } = useTheme();

  const trpc = useTRPC();
  const { data: news } = useQuery(trpc.library.getOne.queryOptions({ newsId: newsId }));

  const editor = useCreateBlockNote();

  const [saveMarkdown, setSaveMarkdown] = useState("");

  useEffect(() => {
    const sessionContent = sessionStorage.getItem(`edit-${newsId}`);
    if (sessionContent) {
      setSaveMarkdown(sessionContent);
    } else if (news?.aiRepsonse) {
      setSaveMarkdown(news.aiRepsonse);
    } else {
      return;
    }
  }, [news, newsId])

  useEffect(() => {
    async function loadContent() {
      const sessionContent = sessionStorage.getItem(`edit-${newsId}`);
      const contentToLoad = sessionContent || news?.aiRepsonse;
      if (contentToLoad) {
        const blocks = await editor.tryParseMarkdownToBlocks(contentToLoad);
        editor.replaceBlocks(editor.document, blocks); // replace whole doc
      }
    }
    loadContent();
  }, [news, editor, newsId]);

  const onChange = async () => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setSaveMarkdown(markdown);
    sessionStorage.setItem(`edit-${newsId}`, markdown);
  }

  const handleSave = () => {
    console.log(saveMarkdown)
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <div className="sticky top-0 z-50 bg-background">
        <LibraryDetailHeader route={`/library/${newsId}`} name="Back" />
      </div>

      <div className="grid grid-cols-9 flex-1 h-full text-sm">
        <div className="col-span-7 p-8 pb-20 h-full border-r border-primary overflow-y-auto">
          <div className="pb-30">
            <BlockNoteView
              onChange={onChange}
              editor={editor}
              theme={resolvedTheme === "dark" ? myCustomTheme.dark : myCustomTheme.light}
              className="p-4 w-full h-full"
            />
          </div>
        </div>

        <div className="col-span-2 h-full overflow-y-auto py-8">
          <Button onClick={handleSave}>
            save
          </Button>
        </div>
      </div>
    </div>
  )
}