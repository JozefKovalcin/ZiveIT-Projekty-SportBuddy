-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "gender" "GenderPreference" NOT NULL DEFAULT 'MIXED',
ADD COLUMN     "maxAge" INTEGER NOT NULL DEFAULT 99,
ADD COLUMN     "minAge" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Activity_gender_idx" ON "Activity"("gender");

-- CreateIndex
CREATE INDEX "Activity_skillLevel_idx" ON "Activity"("skillLevel");
