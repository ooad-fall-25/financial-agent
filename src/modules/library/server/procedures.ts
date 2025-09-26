import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const libraryRouter = createTRPCRouter({
  getAllSummaryByCategory: protectedProcedure.query(async ({ ctx }) => {
    const data = await prisma.newsSummary.findMany({
      where: {
        // userId: ctx.auth.userId,
        url: null,
        isByCategory: true,
      },
    });
    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
    }
    return data;
  }),

  getAllSummaryByIndividualLink: protectedProcedure.query(async ({ ctx }) => {
    const data = await prisma.newsSummary.findMany({
      where: {
        userId: ctx.auth.userId,
        isByCategory: false,
      },
    });

    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
    }
    return data;
  }),

  getOne: protectedProcedure
  .input(z.object({
    newsId: z.string(),
  }))
  .query(async ({input, ctx}) => {
    const data = await prisma.newsSummary.findUnique({
      where: {
        userId: ctx.auth.userId,
        id: input.newsId,
      }
    })
    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
    }
    return data;

  })
});
