-- CreateTable
CREATE TABLE "content_validations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT,
    "sectionId" TEXT,
    "validationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" REAL,
    "details" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_validations_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_validations_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_moderation_queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT,
    "sectionId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "assignedTo" TEXT,
    "assignedAt" DATETIME,
    "completedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_moderation_queue_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_moderation_queue_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "validation_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "content_validations_workId_idx" ON "content_validations"("workId");

-- CreateIndex
CREATE INDEX "content_validations_sectionId_idx" ON "content_validations"("sectionId");

-- CreateIndex
CREATE INDEX "content_validations_validationType_idx" ON "content_validations"("validationType");

-- CreateIndex
CREATE INDEX "content_validations_status_idx" ON "content_validations"("status");

-- CreateIndex
CREATE INDEX "content_moderation_queue_workId_idx" ON "content_moderation_queue"("workId");

-- CreateIndex
CREATE INDEX "content_moderation_queue_sectionId_idx" ON "content_moderation_queue"("sectionId");

-- CreateIndex
CREATE INDEX "content_moderation_queue_status_idx" ON "content_moderation_queue"("status");

-- CreateIndex
CREATE INDEX "content_moderation_queue_priority_idx" ON "content_moderation_queue"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "validation_rules_name_key" ON "validation_rules"("name");

-- CreateIndex
CREATE INDEX "validation_rules_type_idx" ON "validation_rules"("type");

-- CreateIndex
CREATE INDEX "validation_rules_isActive_idx" ON "validation_rules"("isActive");
