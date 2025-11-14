import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { marketNewsRouter } from "@/modules/market-news/server/procedures";
import { libraryRouter } from "@/modules/library/server/procedures";
import { chatRouter } from "@/modules/ai-chat/server/procedures";
import { AlpacaDataRouter } from "@/modules/market_data/server/procedures";
import { HomeDataRouter } from "@/modules/home/server/procedures";

export const appRouter = createTRPCRouter({
  library: libraryRouter,
  marketNews: marketNewsRouter,
  chat: chatRouter,
  AlpacaData: AlpacaDataRouter,
  HomeData: HomeDataRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
