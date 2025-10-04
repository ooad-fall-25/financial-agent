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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { EditAction } from "../components/edit-action";
import ShimmerText from "@/components/kokonutui/shimmer-text";
import { ShimmeringText } from "@/components/ui/shadcn-io/shimmering-text";
// import "@/modules/library/lib/style.css"


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

  return (
    <div className="relative w-full h-full min-h-0">
      <div
        className="absolute top-0 left-0 right-0 z-20 bg-background border-b border-primary p-4"
        role="banner"
      >
        <Button asChild variant="ghost" className="hover:border">
          <Link href={`/library/${newsId}`} className="flex items-center gap-2">
            <ArrowLeftIcon /> Back
          </Link>
        </Button>
      </div>

      <div className="absolute top-0 left-0 right-0 bottom-0 pt-16 min-h-0">
        <div className="grid grid-cols-12 h-full min-h-0 text-sm">


          <div className="col-span-9 flex flex-col min-h-0 border-r border-primary">
            <div className="flex-1 min-h-0 overflow-y-auto p-8">
              <div className="h-full min-h-0">

                <div className="text-sm p-0 m-0 font-medium text-muted-foreground text-center ">
                  <ShimmeringText
                    text="Editable text"
                    duration={1.5}
                    // shimmeringColor="hsl(var(--primary))"
                  />
                </div>

                <BlockNoteView
                  onChange={onChange}
                  editor={editor}
                  theme={resolvedTheme === "dark" ? myCustomTheme.dark : myCustomTheme.light}
                  className="w-full h-full"
                  data-changing-font-demo
                />
              </div>
            </div>
          </div>


          <div className="col-span-3 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto py-8 px-4">
              <EditAction newsId={newsId} savedMarkdown={saveMarkdown} editor={editor} />
            </div>
          </div>


        </div>
      </div>
    </div>









  )
}

