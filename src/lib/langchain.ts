import { ChatOpenAI } from "@langchain/openai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const openAIClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  // configuration: {
  //   baseURL: process.env.AI_BASE_URL,
  // },
  model: "deepseek-chat",
});

export const getAINewsSummary = async (input: string, language: string, providerName: string, category: string, days: string) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant that helps summarize financial news. 
            The input is the accumulation of summaries from all news.
            Language is the desire language that the user wants, you should summarize in the specified language.
            Other info is for context, you can use it as the title or to provide context back to user, the goal is to summarize the input only. 
            
            input: {input},
            language: {language}, by default is English,

            some other info (by developer): 
                api provider: {provider_name}
                category: {category}
                how long ago: {days} ago 
        `,
    ],
    ["human", "{input}, {language}, {provider_name}, {category}, {days}"],
  ]);

  const chain = prompt.pipe(openAIClient);

  const response = await chain.invoke({
    input: input, 
    language: language,
    provider_name: providerName,
    category: category, 
    days: days
  });

  return response; 
};
