/*
  Warnings:

  - Added the required column `publishedAt` to the `PinnedNews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `PinnedNews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PinnedNews" ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL;
