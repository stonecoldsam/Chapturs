-- CreateTable
CREATE TABLE "ad_placements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT,
    "placementType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "revenueShare" REAL NOT NULL DEFAULT 0.7,
    "targeting" TEXT NOT NULL,
    "displaySettings" TEXT NOT NULL,
    "creatorNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "contentFilters" TEXT NOT NULL DEFAULT '[]',
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "ad_placements_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ad_placements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_placement_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placementId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "ctr" REAL NOT NULL DEFAULT 0,
    "cpm" REAL NOT NULL DEFAULT 0,
    "cpc" REAL NOT NULL DEFAULT 0,
    "conversionRate" REAL NOT NULL DEFAULT 0,
    "viewabilityRate" REAL NOT NULL DEFAULT 0,
    "completionRate" REAL NOT NULL DEFAULT 0,
    "engagementTime" INTEGER NOT NULL DEFAULT 0,
    "dailyMetrics" TEXT NOT NULL DEFAULT '{}',
    "weeklyMetrics" TEXT NOT NULL DEFAULT '{}',
    "monthlyMetrics" TEXT NOT NULL DEFAULT '{}',
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ad_placement_metrics_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "ad_placements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "advertiserId" TEXT NOT NULL,
    "budget" REAL NOT NULL,
    "bidAmount" REAL NOT NULL,
    "targeting" TEXT NOT NULL,
    "creative" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_AdCampaignToAdPlacement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AdCampaignToAdPlacement_A_fkey" FOREIGN KEY ("A") REFERENCES "ad_campaigns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AdCampaignToAdPlacement_B_fkey" FOREIGN KEY ("B") REFERENCES "ad_placements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ad_placements_workId_idx" ON "ad_placements"("workId");

-- CreateIndex
CREATE INDEX "ad_placements_createdBy_idx" ON "ad_placements"("createdBy");

-- CreateIndex
CREATE INDEX "ad_placements_placementType_idx" ON "ad_placements"("placementType");

-- CreateIndex
CREATE INDEX "ad_placements_isActive_idx" ON "ad_placements"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ad_placement_metrics_placementId_key" ON "ad_placement_metrics"("placementId");

-- CreateIndex
CREATE INDEX "ad_placement_metrics_placementId_idx" ON "ad_placement_metrics"("placementId");

-- CreateIndex
CREATE INDEX "ad_placement_metrics_lastUpdated_idx" ON "ad_placement_metrics"("lastUpdated");

-- CreateIndex
CREATE INDEX "ad_campaigns_isActive_idx" ON "ad_campaigns"("isActive");

-- CreateIndex
CREATE INDEX "ad_campaigns_startDate_idx" ON "ad_campaigns"("startDate");

-- CreateIndex
CREATE INDEX "ad_campaigns_endDate_idx" ON "ad_campaigns"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "_AdCampaignToAdPlacement_AB_unique" ON "_AdCampaignToAdPlacement"("A", "B");

-- CreateIndex
CREATE INDEX "_AdCampaignToAdPlacement_B_index" ON "_AdCampaignToAdPlacement"("B");
