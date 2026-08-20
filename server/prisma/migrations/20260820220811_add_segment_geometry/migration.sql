/*
  Warnings:

  - Added the required column `geometry` to the `segments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "segments" ADD COLUMN     "geometry" JSONB NOT NULL;
