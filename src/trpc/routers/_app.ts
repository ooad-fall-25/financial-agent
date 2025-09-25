import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { marketsRouter, YahooFinanceRouter } from '@/modules/markets/server/procedures';
import { libraryRouter } from '@/modules/library/server/procedures';
export const appRouter = createTRPCRouter({
  library: libraryRouter,
  marketssssss: marketsRouter,
  YahooMarket: YahooFinanceRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;