import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatDeepSeek } from "@langchain/deepseek";
import { IMPROVED_SUMMARIZE_NEWS_BY_CATEGORY } from "./constants";
import { getAccumulatedNews } from "./helper";

const getAccumulatedNewsTool = new DynamicStructuredTool({
  name: "get_all_news",
  schema: z.object({
    marketType: z.enum(["us", "cn"]).describe("Market type: 'us' or 'cn'."),
    category: z
      .string()
      .describe(
        "News category. For 'us': 'stock', 'general', 'crypto', 'merger'. For 'cn': 'business', 'finance'."
      ),
    limit: z
      .number()
      .default(10)
      .describe("Maximum number of news items to fetch (default 10, 0 = all)."),
  }),
  description:
    "Fetch financial news articles for a given market and category. Returns raw data for summarization only — not for direct output.",
  func: async ({
    marketType,
    category,
    limit,
  }: {
    marketType: string;
    category: string;
    limit: number;
  }) => {
    return getAccumulatedNews(marketType, category, limit);
  },
});

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat",
  streamUsage: false,
});

const tools = [getAccumulatedNewsTool];

const agent = createReactAgent({
  llm: deepseekClient.bindTools(tools, { parallel_tool_calls: false }),
  tools,
  prompt: IMPROVED_SUMMARIZE_NEWS_BY_CATEGORY,
});

export const summaryAgent = async (
  message: string,
  marketType: string,
  category: string,
  language: string
) => {
  const validCategories: Record<string, string[]> = {
    us: ["stock", "general", "crypto", "merger"],
    cn: ["business", "finance"],
  };

  if (!["us", "cn"].includes(marketType)) {
    throw new Error("Invalid marketType. Must be 'us' or 'cn'.");
  }
  if (!validCategories[marketType].includes(category)) {
    throw new Error(
      `Invalid category for ${marketType}. Valid options: ${validCategories[
        marketType
      ].join(", ")}`
    );
  }

  const messages = [
    {
      role: "system",
      content:
        IMPROVED_SUMMARIZE_NEWS_BY_CATEGORY +
        `For Context:
- Market Type: ${marketType}
- Category: ${category}
- Language: ${language || "English"}`,
    },
    {
      role: "user",
      content: message?.trim() || "Summarize these financial news.",
    },
  ];

  try {
    const response = await agent.invoke({ messages });
    const summary = response.messages[response.messages.length - 1].content.toString();

    if (!summary) {
      console.warn("⚠️ No structured content returned:", response);
      return "No summary was generated. Please try again.";
    }

    console.log("✅ Summary generated successfully.");
    return summary;
  } catch (error: any) {
    console.error("❌ Summary agent error:", error);
    return `Error while generating summary: ${error.message}`;
  }
};
