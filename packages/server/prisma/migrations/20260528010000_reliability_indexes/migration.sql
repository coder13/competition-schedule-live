-- CreateIndex
CREATE INDEX "Competition_autoAdvance_status_idx" ON "Competition"("autoAdvance", "status");

-- CreateIndex
CREATE INDEX "CompetitionAccess_userId_idx" ON "CompetitionAccess"("userId");

-- CreateIndex
CREATE INDEX "CompetitionAccess_competitionId_roomId_userId_idx" ON "CompetitionAccess"("competitionId", "roomId", "userId");

-- CreateIndex
CREATE INDEX "ActivityHistory_scheduledStartTime_idx" ON "ActivityHistory"("scheduledStartTime");

-- CreateIndex
CREATE INDEX "ActivityHistory_scheduledEndTime_idx" ON "ActivityHistory"("scheduledEndTime");

-- CreateIndex
CREATE INDEX "ActivityHistory_comp_start_sched_idx" ON "ActivityHistory"("competitionId", "startTime", "scheduledStartTime", "scheduledEndTime");

-- CreateIndex
CREATE INDEX "PushSubscription_disabledAt_idx" ON "PushSubscription"("disabledAt");
