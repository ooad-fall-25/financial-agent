import z from "zod";

import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getMarketNews } from "@/lib/finnhub";
import { clerkClient } from "@clerk/nextjs/server";
import { createClerkClient } from '@clerk/backend'
import { getStockNews } from "@/lib/polygon";

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
        const clerkClient = createClerkClient( {secretKey: process.env.CLERK_SECRET_KEY} )
        if (process.env.CLERK_SECRET_KEY) {
            console.log("======================")
        }
        const {data: users} = await clerkClient.users.getUserList();

        return users; 
    }),

    getPolygonStockNews: protectedProcedure
    .query(async () => {
        const stockNews = await getStockNews(); 
        const result = stockNews.results; 
        return result; 
    })

});
