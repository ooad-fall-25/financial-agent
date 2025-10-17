import { ChatDeepSeek } from "@langchain/deepseek";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { getAccumulatedNews } from "./helper";

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  model: "deepseek-chat",
});

const lightModel = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  model: "deepseek-coder",
});

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

/**
 * Invokes the ReAct agent with the user's prompt and chat history.
 * @param currentMessage The user's current message.
 * @param history The chat history.
 * @returns The AI's response as a string.
 */
export const invokeReActAgent = async (
  currentMessage: string,
  history: { role: string; content: string }[]
): Promise<string> => {
  const tools = [financialNewsTool];

  const agentExecutor = createReactAgent({
    llm: deepseekClient,
    tools,
  });

  const messages = history.map((msg) => {
    if (msg.role === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  const agentMessages: BaseMessage[] = [
    new SystemMessage(
      "You are a helpful financial assistant. Your primary function is to provide accurate and timely financial information by leveraging the tools at your disposal." +
        "For any user query that requires accessing external, real-time, or specific data (such as company news, stock prices, financial reports, etc.), you MUST use the appropriate tool from your available toolkit." +
        "Carefully analyze the user's request to determine which tool, if any, is suitable for the task." +
        "Pay close attention to the conversation history. If the user's latest message is a follow-up, consider the context to see if a tool is needed again." +
        "If you do not have a tool that can fulfill the user's request, or if a tool returns no information, you MUST inform the user that you do not have the capability to provide that specific data. Do not, under any circumstances, invent or hallucinate information." +
        "If the user's request cannot be fulfilled because the available tools do not support the specific parameters (e.g., asking for a market not listed in the tool's description), you must inform the user about this limitation clearly and gracefully."
    ),
    ...messages,
    new HumanMessage(currentMessage),
  ];

  const result = await agentExecutor.invoke({
    messages: agentMessages,
  });

  const lastMessage = result.messages[result.messages.length - 1];
  return lastMessage.content.toString();
};

/**
 * Decides whether to use a direct LLM call or a ReAct agent by considering conversation history.
 * @param currentMessage The user's current message.
 * @param history The conversation history.
 * @returns "Direct LLM Call" or "ReAct"
 */
export const getRoutingDecision = async (
  currentMessage: string,
  history: { role: string; content: string }[]
): Promise<"Direct LLM Call" | "ReAct"> => {
  const routingSystemMessage = new SystemMessage(
    `You are a router. Your purpose is to decide whether a user's query should be handled by a simple, direct LLM call or a more complex ReAct agent that can use tools.
    - Consider the ENTIRE conversation history to understand the context. A short message like "what about Microsoft?" might require a tool if the previous topic was about company news.
    - If the query is a straightforward question, a request for explanation, a simple instruction, or a conversational turn unrelated to tool usage, respond with "Direct LLM Call".
    - If the query requires accessing external information (like fetching news), performing calculations, or taking actions, even if it's a follow-up question, respond with "ReAct".
    - Respond with ONLY "Direct LLM Call" or "ReAct".`
  );

  const messages = history.map((msg) => {
    if (msg.role === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  messages.push(new HumanMessage(currentMessage));

  const response = await deepseekClient.invoke([
    routingSystemMessage,
    ...messages,
  ]);
  const decision = response.content.toString().trim();

  if (decision === "ReAct") {
    return "ReAct";
  }
  return "Direct LLM Call";
};

export const createAIChatCompletion = async (
  currentMessage: string,
  history: { role: string; content: string }[]
) => {
  const messages = history.map((msg) => {
    if (msg.role === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  messages.unshift(
    new SystemMessage(
      "You are a finance advisor. Do not discuss anything unrelated to finance"
    )
  );

  messages.push(new HumanMessage(currentMessage));

  const response = await deepseekClient.invoke(messages);

  return response;
};

export const generateConversationTitle = async (
  prompt: string
): Promise<string> => {
  const response = await lightModel.invoke([
    new SystemMessage(
      "You are an expert in creating concise and relevant titles for conversations. Generate a short title (max 5 words) for the following user prompt."
    ),
    new HumanMessage(prompt),
  ]);

  return response.content.toString().replace(/"/g, ""); // Remove quotes from the title
};