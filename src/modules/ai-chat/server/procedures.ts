// src/modules/ai-chat/server/procedures.ts
import z from "zod";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { createAIChatCompletion, getRoutingDecision } from "@/lib/ai-chat";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
    });
    return conversations;
  }),

  getChatHistory: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chatHistory = await prisma.message.findMany({
        where: {
          conversationId: input.conversationId,
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
        conversationId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. Get the routing decision from the light LLM
        const routingDecision = await getRoutingDecision(input.prompt);

        // 2. Log the decision to the terminal
        console.log(
          `Routing decision for prompt "${input.prompt}": ${routingDecision}`
        );

        let conversationId = input.conversationId;

        if (!conversationId) {
          const newConversation = await prisma.conversation.create({
            data: {
              userId: ctx.auth.userId,
            },
          });
          conversationId = newConversation.id;
        } else {
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: conversationId,
              userId: ctx.auth.userId,
            },
          });
          if (!conversation) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Conversation not found",
            });
          }
        }

        const history = await prisma.message.findMany({
          where: {
            conversationId: conversationId,
            userId: ctx.auth.userId,
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            role: true,
            content: true,
          },
          take: 10,
        });

        // 3. For now, route all requests to the current chat feature
        // In the future, you can add an if/else block here to call the ReAct agent
        const aiResponse = await createAIChatCompletion(input.prompt, history);
        const aiResponseContent = aiResponse.content.toString();

        await prisma.message.createMany({
          data: [
            {
              userId: ctx.auth.userId,
              role: "user",
              content: input.prompt,
              conversationId: conversationId,
            },
            {
              userId: ctx.auth.userId,
              role: "assistant",
              content: aiResponseContent,
              conversationId: conversationId,
            },
          ],
        });

        await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return {
          user: input.prompt,
          assistant: aiResponseContent,
          conversationId: conversationId,
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