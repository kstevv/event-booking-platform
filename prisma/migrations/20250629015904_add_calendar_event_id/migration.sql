/*
  Warnings:

  - A unique constraint covering the columns `[calendarEventId]` on the table `Show` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "calendarEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Show_calendarEventId_key" ON "Show"("calendarEventId");
