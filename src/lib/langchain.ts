import { ChatOpenAI } from "@langchain/openai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const deepseekClient = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  streamUsage: false,
  // configuration: {
  //   baseURL: process.env.AI_BASE_URL,
  // },
  model: "deepseek-chat",
});

export const createAINewsSummary = async (
  input: string,
  language: string,
  providerName: string,
  category: string,
) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant that helps summarize financial news. 
        Make sure the summarization has good structure, its like a report, not just a simple summary. Because user can export it as a PDF file. But do not overcomplicated things either, just make sure it has good structure, its okay if you dont have enough info.  
            
        Dont include things that reply back to the user, like "Here is a structured summary of the news article."
        Conclude with your thoughts on the news. You should state that its a thought from assistant as well.
        Make sure the report has good margin and spacing between sentences and paragraph, dont make everthing packed together.
        
        Start the report by a comment in markdown (use t  his syntax: [//]: # "Comment"), the content of the comment is the overview title of the report.
        You still need to include the overview title of the report, so one in comment and one in normal render. 
        Basically, just do everything normally, but add an extra comment at the top for development purpose.  

        The input is the accumulation of summaries from all news.
            Language is the desire language that the user wants, you should summarize in the specified language.

            Other info is for context, you can use it as the title or to provide context back to user, the goal is to summarize the input only. 
            
            input: {input},
            language: {language}, by default is English,

            some other info (by developer): 
                api provider: {providerName}
                category: {category}
        `,
    ],
    ["human", "{input}, {language}, {providerName}, {category}"],
  ]);

  const chain = prompt.pipe(deepseekClient);

  const response = await chain.invoke({
    input: input,
    language: language,
    providerName: providerName,
    category: category,
  });

  return response;
};

export const createAINewsSummaryByLink = async (
  article: string,
  language: string,
  providerName: string,
  category: string,
  title: string, 
  url: string,
) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `
      You are a helpful assistant that helps summarize a news acticle.
        The input is the article of the news from the source website. 
        Because the article is obtained by web scrapping, so it will not be a clean article. It might contain some unimportant data like
         nav bars, text links to other articles, advertisment text...
        Some parts might be truncated due to the limitation of scrapping. 
        Try your to understand the context of the whole news article section. Improvise only for unimportant missing data.
        Make sure the summarization has good structure, its like a report, not just a simple summary. Because user can export it as a PDF file. But do not overcomplicated things either, just make sure it has good structure, its okay if you dont have enough info.  

        Dont include things that reply back to the user, like "Here is a structured summary of the news article."
        Conclude with your thoughts on the news. You should state that its a thought from assistant as well.
        Make sure the report has good margin and spacing between sentences and paragraph, dont make everthing packed together.

        You can include the info below for better user experience:
        article: {article}
        language: {language}, by default is English,
        title: {title},
        url: {url}, make sure to include url inside the report as well

            some other info (by developer): 
                api provider: {providerName}
                category: {category}
      `,
    ],
    ["human", "{article}, {language}, {providerName}, {category}, {title}, {url}"],
  ]);

  const chain = prompt.pipe(deepseekClient);

  const response = await chain.invoke({
    article: article,
    language: language,
    providerName: providerName,
    category: category,
    title: title, 
    url: url,
  });

  return response;
};
