// src/modules/ai-chat/server/procedures.ts
import z from "zod";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { createAIChatCompletion } from "@/lib/ai-chat";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  getChatHistory: protectedProcedure.query(async ({ ctx }) => {
    const chatHistory = await prisma.aiChat.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return chatHistory;
  }),

  createChatMessage: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. Fetch the user's chat history
        const history = await prisma.aiChat.findMany({
          where: {
            userId: ctx.auth.userId,
          },
          orderBy: {
            createdAt: "asc",
          },
          // Only select the fields needed for the history
          select: {
            role: true,
            content: true,
          },
          take: 10, // Limit the history to the last 10 messages to manage token usage
        });

        // 2. Call the AI function with the current message and the fetched history
        const aiResponse = await createAIChatCompletion(
          input.prompt,
          history,
        );

        const aiResponseContent = aiResponse.content.toString();

        // 3. Save the new user prompt and the AI's response to the database
        await prisma.aiChat.createMany({
          data: [
            {
              userId: ctx.auth.userId,
              role: "user",
              content: input.prompt,
            },
            {
              userId: ctx.auth.userId,
              role: "assistant",
              content: aiResponseContent,
            },
          ],
        });

        return {
          user: input.prompt,
          assistant: aiResponseContent,
        };
      } catch (error) {
        console.error("Failed to get AI response:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get AI response",
        });
      }
    }),
});