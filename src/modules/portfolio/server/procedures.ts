import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
// Import your new service functions
import * as portfolioService from "@/lib/portfolio-service";

// Schema
const holdingInputSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().min(0),
  avgCost: z.number().min(0),
});

// Helper to standardise error handling (like your friend's example)
const handleServiceCall = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // If our service throws "Already in watchlist", we can map it to CONFLICT
    if (message.includes("Already in watchlist")) {
      throw new TRPCError({ code: "CONFLICT", message });
    }
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
  }
};

export const portfolioRouter = createTRPCRouter({
  
  // --- HOLDINGS ---

  getHoldings: baseProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    if (!userId) return []; // Or throw UNAUTHORIZED based on preference
    
    return handleServiceCall(() => portfolioService.getUserHoldings(userId));
  }),

  addHolding: baseProcedure
    .input(holdingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => portfolioService.upsertHolding(userId, input));
    }),

  deleteHolding: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => portfolioService.deleteUserHolding(userId, input.id));
    }),

  // --- WATCHLIST ---

  getWatchlist: baseProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    if (!userId) return [];

    return handleServiceCall(() => portfolioService.getUserWatchlist(userId));
  }),

  addToWatchlist: baseProcedure
    .input(z.object({ symbol: z.string().min(1).toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => portfolioService.addToUserWatchlist(userId, input.symbol));
    }),

  removeFromWatchlist: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => portfolioService.removeFromUserWatchlist(userId, input.id));
    }),
});