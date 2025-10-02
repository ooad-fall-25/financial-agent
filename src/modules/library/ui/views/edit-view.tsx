"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";


import {
  BlockNoteView,
  darkDefaultTheme,
  lightDefaultTheme,
  Theme,
} from "@blocknote/mantine";
import { PartialBlock } from "@blocknote/core";
import { useEffect } from "react";

const getCssVar = (name: string, isDark: boolean = false) => {
  if (typeof document === "undefined") {
    return isDark ? "#000000" : "#FFFFFF";
  }

  const root = document.documentElement;
  const originalClassList = root.className; // Store original class list

  if (isDark && !root.classList.contains("dark")) {
    root.classList.add("dark");
  } else if (!isDark && root.classList.contains("dark")) {
    root.classList.remove("dark");
  }

  const value = getComputedStyle(root).getPropertyValue(name).trim();

  // Restore original class list to avoid unintended side effects
  root.className = originalClassList;

  return value;
};

const customLightTheme: Theme = {
  colors: {
    editor: {
      text: getCssVar("--foreground"),
      background: getCssVar("--background"),
    },
    menu: {
      text: getCssVar("--secondary-foreground"),
      background: getCssVar("--secondary"),
    },
    tooltip: {
      text: getCssVar("--card-foreground"),
      background: getCssVar("--card"),
    },
    hovered: {
      text: getCssVar("--accent-foreground"),
      background: getCssVar("--accent"),
    },
    selected: {
      text: getCssVar("--secondary-foreground"),
      background: getCssVar("--muted"),
    },
    disabled: {
      text: getCssVar("--muted-foreground"),
      background: getCssVar("--muted"),
    },
    shadow: getCssVar("--border"),
    border: getCssVar("--border"),
    sideMenu: getCssVar("--secondary-foreground-muted"),
    highlights: lightDefaultTheme.colors!.highlights,
  },
  borderRadius: parseFloat(getCssVar("--radius").replace("rem", "")) * 16,
  fontFamily: getCssVar("--font-sans"),
} satisfies Theme;

const customDarkTheme: Theme = {
  ...customLightTheme,
  colors: {
    ...customLightTheme.colors,
    editor: {
      text: getCssVar("--foreground", true),
      background: getCssVar("--background", true),
    },
    menu: {
      text: getCssVar("--secondary-foreground", true),
      background: getCssVar("--secondary", true),
    },
    tooltip: {
      text: getCssVar("--card-foreground", true),
      background: getCssVar("--card", true),
    },
    hovered: {
      text: getCssVar("--accent-foreground", true),
      background: getCssVar("--accent", true),
    },
    selected: {
      text: getCssVar("--accent-foreground", true),
      background: getCssVar("--muted"),
    },
    disabled: {
      text: getCssVar("--muted-foreground", true),
      background: getCssVar("--muted", true),
    },
    shadow: getCssVar("--input", true),
    border: getCssVar("--border", true),
    sideMenu: getCssVar("--secondary-foreground-muted", true),
    highlights: darkDefaultTheme.colors!.highlights,
  },
} satisfies Theme;

export const myCustomTheme = {
  light: customLightTheme,
  dark: customDarkTheme,
};
export const EditView = () => {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    
  });
  // useEffect(() => {
  //   async function loadContent() {
  //     const blocks = await editor.tryParseMarkdownToBlocks(markdownString);
  //     editor.replaceBlocks(editor.document, blocks); // replace whole doc
  //   }
  //   loadContent();
  // }, [editor]);


  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? myCustomTheme.dark : myCustomTheme.light}
      className="p-4 w-full h-full"
    />
  )
}