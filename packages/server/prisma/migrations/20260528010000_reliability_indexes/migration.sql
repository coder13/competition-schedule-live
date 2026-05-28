-- CreateIndex
CREATE INDEX CONCURRENTLY "Competition_autoAdvance_status_idx" ON "Competition"("autoAdvance", "status");

-- CreateIndex
CREATE INDEX CONCURRENTLY "CompetitionAccess_userId_idx" ON "CompetitionAccess"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY "CompetitionAccess_competitionId_roomId_userId_idx" ON "CompetitionAccess"("competitionId", "roomId", "userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY "ActivityHistory_scheduledStartTime_idx" ON "ActivityHistory"("scheduledStartTime");

-- CreateIndex
CREATE INDEX CONCURRENTLY "ActivityHistory_scheduledEndTime_idx" ON "ActivityHistory"("scheduledEndTime");

-- CreateIndex
CREATE INDEX CONCURRENTLY "ActivityHistory_comp_start_sched_idx" ON "ActivityHistory"("competitionId", "startTime", "scheduledStartTime", "scheduledEndTime");

-- CreateIndex
CREATE INDEX CONCURRENTLY "PushSubscription_disabledAt_idx" ON "PushSubscription"("disabledAt");
