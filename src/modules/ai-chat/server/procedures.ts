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
import { getPreSignedURL } from "@/lib/file-upload";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

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

  // Step 1 - Create user message only
  createUserMessage: protectedProcedure
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

        // Create only the user message
        const userMessage = await prisma.message.create({
          data: {
            userId: ctx.auth.userId,
            role: "user",
            content: input.prompt,
            conversationId: conversationId,
          },
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
          conversationId: conversationId,
          userMessage: userMessage,
        };
      } catch (error) {
        console.error("Failed to create user message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user message",
        });
      }
    }),

  // Step 2 - Generate and store AI response
  createAIResponse: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        conversationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const history = await prisma.message.findMany({
          where: {
            conversationId: input.conversationId,
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

        // Get the routing decision
        const routingDecision = await getRoutingDecision(input.prompt, history);

        console.log(
          `Routing decision for prompt "${input.prompt}": ${routingDecision}`
        );

        let aiResponseContent: string;
        let thoughts: string | null = null;

        // Route the request based on the decision
        if (routingDecision === "ReAct") {
          const agentResult = await invokeReActAgent(
            input.prompt,
            history,
            ctx.auth.userId
          );
          aiResponseContent = agentResult.finalResponse;
          thoughts = agentResult.thoughts;
        } else {
          const aiResponse = await createAIChatCompletion(input.prompt, history);
          aiResponseContent = aiResponse.content.toString();
        }

        // Create the assistant message
        const assistantMessage = await prisma.message.create({
          data: {
            userId: ctx.auth.userId,
            role: "assistant",
            content: aiResponseContent,
            thoughts: thoughts,
            conversationId: input.conversationId,
          },
        });

        await prisma.conversation.update({
          where: {
            id: input.conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return {
          assistantMessage: assistantMessage,
        };
      } catch (error) {
        console.error("Failed to create AI response:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI response",
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

  createPreSignedUrl: protectedProcedure
  .input(
    z.object({
      fileName: z.string(), 
      fileType: z.string(),
      fileSize: z.number(), 
      checkSum: z.string(),
    })
  )
  .mutation( async ({input , ctx}) => {

    if (!ctx.auth.userId) {
      throw new TRPCError({code: "FORBIDDEN", message: "No user found"})
    } 

    
    if (!ACCEPTED_FILE_TYPES.includes(input.fileType)) {
      throw new TRPCError({code: "FORBIDDEN", message: "The file type is not accepted"})
    }

    if (input.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new TRPCError({code: "FORBIDDEN", message: "Each file size cannot exceed 1 MB"})
    }

    const preSignedUrl = await getPreSignedURL(input.fileName, input.fileType, input.fileSize, ctx.auth.userId, input.checkSum); 

    if (!preSignedUrl) {
      throw new TRPCError({code: "NOT_FOUND", message: "No pre-signed url generated"}); 
    }

    return preSignedUrl;
  })
  ,
});
