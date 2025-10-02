import z from "zod";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import {
  createAIChatCompletion,
  generateConversationTitle,
  getRoutingDecision,
  invokeReActAgent,
} from "@/lib/ai-chat";
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let conversationId = input.conversationId;
        let conversation;

        if (!conversationId) {
          const title = await generateConversationTitle(input.prompt);
          conversation = await prisma.conversation.create({
            data: {
              userId: ctx.auth.userId,
              title: title,
            },
          });
          conversationId = conversation.id;
        } else {
          conversation = await prisma.conversation.findFirst({
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

        // 1. Get the routing decision, now with history
        const routingDecision = await getRoutingDecision(input.prompt, history);

        // 2. Log the decision to the terminal
        console.log(
          `Routing decision for prompt "${input.prompt}": ${routingDecision}`
        );

        let aiResponseContent: string;

        // 3. Route the request based on the decision
        if (routingDecision === "ReAct") {
          // Call the ReAct agent
          aiResponseContent = await invokeReActAgent(input.prompt, history);
        } else {
          // Use the direct LLM call for simple queries
          const aiResponse = await createAIChatCompletion(
            input.prompt,
            history
          );
          aiResponseContent = aiResponse.content.toString();
        }

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

  renameConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        newTitle: z.string().min(1, "Title cannot be empty"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { conversationId, newTitle } = input;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: ctx.auth.userId,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Conversation not found or you do not have permission to edit it.",
        });
      }

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          title: newTitle,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { conversationId } = input;
      const { userId } = ctx.auth;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Conversation not found or you do not have permission to delete it.",
        });
      }

      await prisma.conversation.delete({
        where: {
          id: conversationId,
        },
      });

      return { success: true };
    }),
});