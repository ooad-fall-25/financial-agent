import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatDeepSeek } from "@langchain/deepseek";
import { IMPROVED_SUMMARIZE_NEWS_BY_CATEGORY } from "./constants";
import { getAccumulatedNews } from "./helper";

const financialNewsTool = new DynamicStructuredTool({
  name: "get_financial_news",
  description:
    "Fetches financial news for a given market and category. For US-based companies like Google or Microsoft, always use the 'us' marketType. Use this for any questions about market updates or company-specific news.",
  schema: z.object({
    marketType: z
      .enum(["us", "cn"])
      .describe("The market to fetch news from: 'us' or 'cn'."),
    category: z
      .enum([
        "stock",
        "general",
        "crypto",
        "merger",
        "company",
        "business",
        "finance",
      ])
      .describe(
        "The news category. For 'us' market, use one of ['stock', 'general', 'crypto', 'merger', 'company']. For 'cn' market, use one of ['business', 'finance']."
      ),
    ticker: z
      .string()
      .optional()
      .describe(
        "The company's ticker symbol (e.g., 'AAPL'). Required when the category is 'company'."
      ),
    limit: z
      .number()
      .optional()
      .describe("The maximum number of news articles to return."),
  }),
  func: async ({
    marketType,
    category,
    ticker,
    limit,
  }: {
    marketType: "us" | "cn";
    category: string;
    ticker?: string;
    limit?: number;
  }) => {
    // Log the parameters the AI used for the tool call
    console.log("AI is using 'get_financial_news' tool with params:", {
      marketType,
      category,
      ticker,
      limit,
    });

    if (category === "company" && !ticker) {
      return "A ticker symbol is required when the category is 'company'.";
    }
    const news = await getAccumulatedNews(marketType, category, limit, ticker);
    console.log("Fetched News Result:", news); // Log the result
    return (
      news ||
      `No news found for market '${marketType}', category '${category}'` +
        (ticker ? `, and ticker '${ticker}'.` : ".")
    );
  },
});

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat",
  streamUsage: false,
});

const tools = [financialNewsTool];

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
    us: ["stock", "general", "crypto", "merger", "company"],
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
        IMPROVED_SUMMARIZE_NEWS_BY_CATEGORY
    },
    {
      role: "user",
      content: (message?.trim() + 
      `For Context: below are explicitly filled, compare this to the message, if it doesnt alight, follow the user message. if the message doesnt specify, follow this context.
          - Market Type: ${marketType}
          - Category: ${category}
          - Language: ${language || "English"}
          
          ` )
      || "\nSummarize these financial news.",
    },
  ];

  try {
    const response = await agent.invoke({ messages });
    const summary =
      response.messages[response.messages.length - 1].content.toString();

    if (!summary) {
      console.warn("⚠️ No structured content returned:", response);
      return "<Error>No summary was generated. Please try again.";
    }

    console.log("✅ Summary generated successfully.");
    return summary;
  } catch (error: any) {
    console.error("❌ Summary agent error:", error);
    return `<Error>Error while generating summary: ${error.message}`;
  }
};
