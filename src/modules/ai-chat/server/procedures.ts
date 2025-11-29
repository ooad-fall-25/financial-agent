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
import { getPutPreSignedURL } from "@/lib/file-upload";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { pdfToText, xlsxToText } from "@/lib/helper";
import { FileInfoSchema } from "../types";

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
        fileInfoList: z.array(FileInfoSchema),
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

        const createdUserMessage = await prisma.message.create({
          data: {
            userId: ctx.auth.userId,
            role: "user",
            content: input.prompt,
            conversationId: conversationId,
          },
        });

        let fullPrompt = input.prompt; 
        if (input.fileInfoList.length != 0) {
          fullPrompt += "\r\n uploaded files content:\n"
          for (const file of input.fileInfoList) {
            const media = await prisma.media.create({
              data: {
                userId: ctx.auth.userId,
                fileName: file.fileName,
                mimeType: file.fileType,
                sizeBytes: file.fileSize,
                s3Key: file.s3Key,
                s3Bucket: process.env.AWS_BUCKET_NAME!,
                extractedContext: file.content,
                messageId: createdUserMessage.id,
              },
            });

            const fileContext = `
              File name: ${file.fileName}:
                content: 
                  ${file.content}

            `
            fullPrompt += fileContext; 
            console.log("mediaaaaaa", media);
          }
        }

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

        // 1. Get the routing decision, now with history
        const routingDecision = await getRoutingDecision(fullPrompt, history);

        console.log(
          `Routing decision for prompt "${fullPrompt}": ${routingDecision}`
        );

        let aiResponseContent: string;
        let thoughts: string | null = null;

        // Route the request based on the decision
        if (routingDecision === "ReAct") {
          // Call the ReAct agent
          const agentResult = await invokeReActAgent(
            fullPrompt,
            history,
            ctx.auth.userId
          );
          aiResponseContent = agentResult.finalResponse;
          thoughts = agentResult.thoughts;
        } else {
          // Use the direct LLM call for simple queries
          const aiResponse = await createAIChatCompletion(
            fullPrompt,
            history
          );
          aiResponseContent = aiResponse.content.toString();
        }

        const createdAssistentMessage = await prisma.message.create({
          data: {
            userId: ctx.auth.userId,
            role: "assistant",
            content: aiResponseContent,
            thoughts: thoughts,
            conversationId: conversationId,
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
          createdUserMessage: createdUserMessage,
          createdAssistentMessage: createdAssistentMessage,
          user: input.prompt,
          assistant: aiResponseContent,
          conversationId: conversationId,
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

  createPutPreSignedUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        checkSum: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No user found" });
      }

      if (!ACCEPTED_FILE_TYPES.includes(input.fileType)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The file type is not accepted",
        });
      }

      if (input.fileSize > MAX_FILE_SIZE_BYTES) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Each file size cannot exceed 1 MB",
        });
      }

      const preSignedUrl = await getPutPreSignedURL(
        input.fileName,
        input.fileType,
        input.fileSize,
        ctx.auth.userId,
        input.checkSum
      );

      if (!preSignedUrl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pre-signed url generated",
        });
      }

      return preSignedUrl;
    }),
  extractText: protectedProcedure
    .input(
      z.object({
        buffer: z.string(),
        type: z.enum(["pdf", "xlsx"]),
      })
    )
    .mutation(async ({ input }) => {
      let content = "";
      const buffer = Buffer.from(input.buffer, "base64");
      if (input.type === "pdf") {
        content = await pdfToText(buffer);
      } else if (input.type === "xlsx") {
        content = xlsxToText(buffer);
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "file type not accepted",
        });
      }

      return { content: content };
    }),

  
});
