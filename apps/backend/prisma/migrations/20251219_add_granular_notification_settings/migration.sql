-- AlterTable
ALTER TABLE "NotificationPreferences" 
ADD COLUMN "notifyActivityUpdated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyActivityCancelled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyParticipantJoined" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyParticipantLeft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyRatings" BOOLEAN NOT NULL DEFAULT true;

-- Update existing notifyParticipants to split into joined/left
UPDATE "NotificationPreferences" 
SET "notifyParticipantJoined" = "notifyParticipants",
    "notifyParticipantLeft" = "notifyParticipants"
WHERE "notifyParticipants" IS NOT NULL;
