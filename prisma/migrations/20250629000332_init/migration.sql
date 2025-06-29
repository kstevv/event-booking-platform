-- CreateEnum
CREATE TYPE "ShowStatus" AS ENUM ('PENDING', 'HOLD', 'CONFIRMED', 'ADVANCED', 'SETTLED');

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "ShowStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);
