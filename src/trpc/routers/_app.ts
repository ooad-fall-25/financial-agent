import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { marketsRouter } from '@/modules/markets/server/procedures';
export const appRouter = createTRPCRouter({
  marketssssss: marketsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;