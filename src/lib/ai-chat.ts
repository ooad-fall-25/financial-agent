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

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  model: "deepseek-chat",
});

/**
 * A dummy function to simulate fetching recent news for specific companies.
 * @param companyName The name of the company to fetch news for.
 * @returns A string with recent news or a "no data" message.
 */
const getRecentNews = async (companyName: string): Promise<string> => {
  console.log(`Fetching news for: ${companyName}`);
  const lowerCaseCompanyName = companyName.toLowerCase();
  const newsDatabase: Record<string, string> = {
    apple:
      "Apple announced its latest iPhone with satellite connectivity and improved camera features.",
    google:
      "Google's parent company, Alphabet, reported strong earnings growth driven by its cloud computing division.",
    tesla:
      "Tesla has unveiled a new battery technology that promises to extend the range of its electric vehicles significantly.",
  };

  if (newsDatabase[lowerCaseCompanyName]) {
    return newsDatabase[lowerCaseCompanyName];
  }

  return `No recent news data found for ${companyName}.`;
};

const newsTool = new DynamicStructuredTool({
  name: "get_recent_news",
  description:
    "Fetches recent news for a given company. Use this for any questions about company-specific news or updates.",
  schema: z.object({
    companyName: z
      .string()
      .describe("The name of the company to fetch news for."),
  }),
  func: async ({ companyName }: { companyName: string }) => {
    const news = await getRecentNews(companyName);
    return news;
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
  const tools = [newsTool];

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
        "You are a helpful financial assistant." +
        "You have access to a tool that can fetch recent news about specific companies." +
        "Pay close attention to the conversation history. If the user's latest message is a follow-up to a previous request that used a tool, it's highly likely you should use a tool again." +
        "If a user asks for information that you cannot obtain with your available tools, you MUST explicitly state that you do not have the capability to fulfill the request." +
        "Do not invent or hallucinate information you don't have access to."
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