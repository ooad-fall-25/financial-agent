import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { 
  getUserHoldings, 
  upsertHolding, 
  deleteUserHolding,
  getUserWatchlist,
  addToUserWatchlist,
  removeFromUserWatchlist
} from "@/lib/portfolio-service";

// Schema
const holdingInputSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().min(0),
  avgCost: z.number().min(0),
});

// Helper to standardise error handling
const handleServiceCall = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    
    if (message.includes("Already in watchlist")) {
      throw new TRPCError({ code: "CONFLICT", message });
    }
    
    if (message.includes("Invalid Ticker")) {
      throw new TRPCError({ code: "BAD_REQUEST", message });
    }

    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
  }
};

export const portfolioRouter = createTRPCRouter({
  
  // --- HOLDINGS ---

  getHoldings: baseProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    if (!userId) return []; 
    
    // Clean call to the imported function
    return handleServiceCall(() => getUserHoldings(userId));
  }),

  addHolding: baseProcedure
    .input(holdingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => upsertHolding(userId, input));
    }),

  deleteHolding: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => deleteUserHolding(userId, input.id));
    }),

  // --- WATCHLIST ---

  getWatchlist: baseProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    if (!userId) return [];

    return handleServiceCall(() => getUserWatchlist(userId));
  }),

  addToWatchlist: baseProcedure
    .input(z.object({ symbol: z.string().min(1).toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // We can use handleServiceCall here too for consistency
      return handleServiceCall(async () => {
         const data = await addToUserWatchlist(userId, input.symbol);
         if (!data) throw new Error("Failed to add to watchlist");
         return data;
      });
    }), 

  removeFromWatchlist: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return handleServiceCall(() => removeFromUserWatchlist(userId, input.id));
    }),
});