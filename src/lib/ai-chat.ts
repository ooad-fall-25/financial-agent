import { ChatDeepSeek } from "@langchain/deepseek";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  model: "deepseek-chat",
});

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