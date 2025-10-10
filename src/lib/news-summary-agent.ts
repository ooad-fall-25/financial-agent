import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatDeepSeek } from "@langchain/deepseek";


const multiplyTool = new DynamicStructuredTool({
  name: "multiply",
  schema: z.object({
      a: z.number().describe("the first number to multiply"),
      b: z.number().describe("the second number to multiply"),
    }),
    description: "multiply two numbers together",
  func: async ({ a, b }: { a: number; b: number }) => {
    return (a * b).toString();
  },
});

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  model: "deepseek-chat",
});


const tools = [ multiplyTool];
const agent = createReactAgent({
  // disable parallel tool calls
  llm: deepseekClient.bindTools(tools, { parallel_tool_calls: false }),
  tools,
});

const response = await agent.invoke({
  messages: [{ role: "user", content: "what's 3 + 5 and 4 * 7?" }],
});