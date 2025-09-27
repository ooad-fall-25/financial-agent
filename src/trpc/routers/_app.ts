import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { marketsRouter, YahooFinanceRouter } from '@/modules/markets/server/procedures';
import { libraryRouter } from '@/modules/library/server/procedures';
import { chatRouter } from '@/modules/ai-chat/server/procedures';
export const appRouter = createTRPCRouter({
  library: libraryRouter,
  marketssssss: marketsRouter,
  YahooMarket: YahooFinanceRouter,
  chat: chatRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;