import z from "zod";

import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews } from "@/lib/finnhub";
import { clerkClient } from "@clerk/nextjs/server";
import { createClerkClient } from '@clerk/backend'

export const marketsRouter = createTRPCRouter({
    getMarketNews: protectedProcedure
    .input(
        z.object({
            category: z.string(),
            minId: z.number().optional()
        })    
    )
    .query(async ({input}) => {
        const {data: marketNews} = await getMarketNews(input.category, input.minId);

        if (!marketNews) {
            throw new TRPCError({code: "NOT_FOUND", message: "News not found"})
        }
        return marketNews; 
    }),

    getAllUsers: protectedProcedure

    .query(async () => {
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
        const {data: users} = await clerkClient.users.getUserList();
        return users; 
    })


});
