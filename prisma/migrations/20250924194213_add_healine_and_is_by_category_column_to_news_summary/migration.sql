ALTER TABLE "public"."NewsSummary" ADD COLUMN "headline" TEXT NOT NULL, 
ADD COLUMN "isByCategory" BOOLEAN NOT NULL DEFAULT false;