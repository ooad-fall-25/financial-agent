import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import z from "zod";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const reportsRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(z.object({ fileName: z.string() }))
    .query(async ({ input, ctx }) => {
      const key = `${ctx.auth.userId}/${Date.now()}-${input.fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: "application/octet-stream",
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60s URL
      return { url, key };
    }),
});
