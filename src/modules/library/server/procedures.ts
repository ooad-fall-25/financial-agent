import { prisma } from "@/lib/db";
import { markdownToPDF } from "@/lib/helper";
import { translateSummary } from "@/lib/langchain";
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
    .input(
      z.object({
        newsId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const data = await prisma.newsSummary.findUnique({
        where: {
          userId: ctx.auth.userId,
          id: input.newsId,
        },
      });
      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
      }
      return data;
    }),

  deleteOne: protectedProcedure
    .input(
      z.object({
        newsId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const data = await prisma.newsSummary.delete({
        where: {
          userId: ctx.auth.userId,
          id: input.newsId,
        },
      });
      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
      }
      return data;
    }),

  updateSummaryText: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        newsId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedSummary = await prisma.newsSummary.update({
        where: {
          id: input.newsId,
          userId: ctx.auth.userId,
        },
        data: {
          aiRepsonse: input.text,
        },
      });

      if (!updatedSummary) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No summary found" });
      }

      return updatedSummary;
    }),

  convertMarkdownToPdf: protectedProcedure
    .input(
      z.object({
        markdown: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const pdfBuffer = await markdownToPDF(input.markdown);
      return Buffer.from(pdfBuffer).toString("base64");
    }),
    
  translate: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        language: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const translatedContent = await translateSummary(
        input.content,
        input.language
      );
      if (!translatedContent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No translation found",
        });
      }
      return translatedContent.content.toString();
    }),
});
