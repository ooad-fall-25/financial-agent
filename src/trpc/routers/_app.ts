import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { marketsRouter, YahooFinanceRouter } from '@/modules/markets/server/procedures';
export const appRouter = createTRPCRouter({
  marketssssss: marketsRouter,
  YahooMarket: YahooFinanceRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;