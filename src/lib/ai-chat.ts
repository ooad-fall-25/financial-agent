import { ChatDeepSeek } from "@langchain/deepseek";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  model: "deepseek-chat",
});

/**
 * Decides whether to use a direct LLM call or a ReAct agent.
 * @param currentMessage The user's current message.
 * @returns "Direct LLM Call" or "ReAct"
 */
export const getRoutingDecision = async (
  currentMessage: string
): Promise<"Direct LLM Call" | "ReAct"> => {
  const routingSystemMessage = new SystemMessage(
    `You are a router. Your purpose is to decide whether a user's query should be handled by a simple, direct LLM call or a more complex ReAct agent that can use tools.
    - If the query is a straightforward question, a request for explanation, a simple instruction, or a conversational turn, respond with "Direct LLM Call".
    - If the query requires accessing external information, performing calculations, or taking actions (e.g., checking stock prices, fetching news, analyzing a file), respond with "ReAct".
    - Respond with ONLY "Direct LLM Call" or "ReAct".`
  );

  const userMessage = new HumanMessage(currentMessage);

  const response = await deepseekClient.invoke([
    routingSystemMessage,
    userMessage,
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