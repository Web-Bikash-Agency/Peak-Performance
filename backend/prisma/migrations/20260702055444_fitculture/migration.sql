/*
  Warnings:

  - You are about to drop the column `email` on the `members` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "members_email_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "email";

-- CreateIndex
CREATE INDEX "check_ins_memberId_idx" ON "check_ins"("memberId");

-- CreateIndex
CREATE INDEX "check_ins_checkInAt_idx" ON "check_ins"("checkInAt");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE INDEX "members_membershipType_idx" ON "members"("membershipType");

-- CreateIndex
CREATE INDEX "members_expiryDate_idx" ON "members"("expiryDate");

-- CreateIndex
CREATE INDEX "members_status_expiryDate_idx" ON "members"("status", "expiryDate");

-- CreateIndex
CREATE INDEX "members_joinDate_idx" ON "members"("joinDate");

-- CreateIndex
CREATE INDEX "payments_memberId_idx" ON "payments"("memberId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- CreateIndex
CREATE INDEX "payments_status_paidAt_idx" ON "payments"("status", "paidAt");

-- CreateIndex
CREATE INDEX "workouts_memberId_idx" ON "workouts"("memberId");

-- CreateIndex
CREATE INDEX "workouts_workoutAt_idx" ON "workouts"("workoutAt");
