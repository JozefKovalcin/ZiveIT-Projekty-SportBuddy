-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentActivityId" TEXT,
ADD COLUMN     "recurrenceDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceFrequency" "RecurrenceFrequency" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "Activity_parentActivityId_idx" ON "Activity"("parentActivityId");

-- CreateIndex
CREATE INDEX "Activity_isRecurring_idx" ON "Activity"("isRecurring");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_parentActivityId_fkey" FOREIGN KEY ("parentActivityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
