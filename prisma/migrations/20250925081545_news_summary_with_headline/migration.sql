-- CreateTable
CREATE TABLE "public"."NewsSummary" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "aiRepsonse" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "url" TEXT,
    "isByCategory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSummary_pkey" PRIMARY KEY ("id")
);
