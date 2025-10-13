-- CreateTable
CREATE TABLE "quality_assessment_queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" DATETIME,
    "completedAt" DATETIME,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "quality_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "writingQuality" REAL NOT NULL,
    "storytelling" REAL NOT NULL,
    "characterization" REAL NOT NULL,
    "worldBuilding" REAL NOT NULL,
    "engagement" REAL NOT NULL,
    "originality" REAL NOT NULL,
    "qualityTier" TEXT NOT NULL,
    "discoveryTags" TEXT NOT NULL,
    "feedbackMessage" TEXT NOT NULL,
    "boostMultiplier" REAL NOT NULL DEFAULT 1.0,
    "boostExpiry" DATETIME,
    "boostReason" TEXT,
    "model" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "processingTime" INTEGER,
    "tokenCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "quality_assessment_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "previousScore" REAL NOT NULL,
    "newScore" REAL NOT NULL,
    "previousTier" TEXT NOT NULL,
    "newTier" TEXT NOT NULL,
    "changeReason" TEXT NOT NULL,
    "changedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "assessment_prompt_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "genre" TEXT,
    "aspect" TEXT,
    "prompt" TEXT NOT NULL,
    "systemMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "avgProcessingTime" INTEGER,
    "successRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "assessment_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "details" TEXT,
    "submittedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "llm_usage_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "estimatedCost" REAL,
    "duration" INTEGER,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "quality_assessment_queue_workId_idx" ON "quality_assessment_queue"("workId");

-- CreateIndex
CREATE INDEX "quality_assessment_queue_status_idx" ON "quality_assessment_queue"("status");

-- CreateIndex
CREATE INDEX "quality_assessment_queue_priority_idx" ON "quality_assessment_queue"("priority");

-- CreateIndex
CREATE INDEX "quality_assessment_queue_createdAt_idx" ON "quality_assessment_queue"("createdAt");

-- CreateIndex
CREATE INDEX "quality_assessments_workId_idx" ON "quality_assessments"("workId");

-- CreateIndex
CREATE INDEX "quality_assessments_overallScore_idx" ON "quality_assessments"("overallScore" DESC);

-- CreateIndex
CREATE INDEX "quality_assessments_qualityTier_idx" ON "quality_assessments"("qualityTier");

-- CreateIndex
CREATE INDEX "quality_assessments_boostMultiplier_idx" ON "quality_assessments"("boostMultiplier");

-- CreateIndex
CREATE INDEX "quality_assessments_createdAt_idx" ON "quality_assessments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "quality_assessments_workId_sectionId_key" ON "quality_assessments"("workId", "sectionId");

-- CreateIndex
CREATE INDEX "quality_assessment_history_workId_idx" ON "quality_assessment_history"("workId");

-- CreateIndex
CREATE INDEX "quality_assessment_history_assessmentId_idx" ON "quality_assessment_history"("assessmentId");

-- CreateIndex
CREATE INDEX "quality_assessment_history_createdAt_idx" ON "quality_assessment_history"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_prompt_templates_name_key" ON "assessment_prompt_templates"("name");

-- CreateIndex
CREATE INDEX "assessment_prompt_templates_type_idx" ON "assessment_prompt_templates"("type");

-- CreateIndex
CREATE INDEX "assessment_prompt_templates_isActive_idx" ON "assessment_prompt_templates"("isActive");

-- CreateIndex
CREATE INDEX "assessment_feedback_assessmentId_idx" ON "assessment_feedback"("assessmentId");

-- CreateIndex
CREATE INDEX "assessment_feedback_feedbackType_idx" ON "assessment_feedback"("feedbackType");

-- CreateIndex
CREATE INDEX "assessment_feedback_createdAt_idx" ON "assessment_feedback"("createdAt");

-- CreateIndex
CREATE INDEX "llm_usage_logs_service_idx" ON "llm_usage_logs"("service");

-- CreateIndex
CREATE INDEX "llm_usage_logs_model_idx" ON "llm_usage_logs"("model");

-- CreateIndex
CREATE INDEX "llm_usage_logs_createdAt_idx" ON "llm_usage_logs"("createdAt");
