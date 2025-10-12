-- CreateTable
CREATE TABLE "creator_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "recommendedWorkId" TEXT NOT NULL,
    "recommendedAuthorId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "customMessage" TEXT,
    "similarityReason" TEXT,
    "personalRating" INTEGER DEFAULT 5,
    "placementTargets" TEXT NOT NULL,
    "displaySettings" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvedByRecommendee" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "creator_recommendations_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "creator_recommendations_recommendedWorkId_fkey" FOREIGN KEY ("recommendedWorkId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "creator_recommendations_recommendedAuthorId_fkey" FOREIGN KEY ("recommendedAuthorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "default_ad_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "hasCustomPlacements" BOOLEAN NOT NULL DEFAULT false,
    "defaultSidebarRight" BOOLEAN NOT NULL DEFAULT true,
    "defaultSidebarLeft" BOOLEAN NOT NULL DEFAULT false,
    "defaultChapterEnd" BOOLEAN NOT NULL DEFAULT true,
    "defaultBetweenChapters" BOOLEAN NOT NULL DEFAULT false,
    "platformRevenueShare" REAL NOT NULL DEFAULT 0.3,
    "creatorRevenueShare" REAL NOT NULL DEFAULT 0.7,
    "allowExternalAds" BOOLEAN NOT NULL DEFAULT true,
    "allowCreatorRecs" BOOLEAN NOT NULL DEFAULT true,
    "allowPlatformAds" BOOLEAN NOT NULL DEFAULT true,
    "maxAdsPerSession" INTEGER NOT NULL DEFAULT 5,
    "minTimeBetweenAds" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "default_ad_configs_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "creator_recommendations_creatorId_idx" ON "creator_recommendations"("creatorId");

-- CreateIndex
CREATE INDEX "creator_recommendations_recommendedWorkId_idx" ON "creator_recommendations"("recommendedWorkId");

-- CreateIndex
CREATE INDEX "creator_recommendations_recommendedAuthorId_idx" ON "creator_recommendations"("recommendedAuthorId");

-- CreateIndex
CREATE INDEX "creator_recommendations_isActive_idx" ON "creator_recommendations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "default_ad_configs_workId_key" ON "default_ad_configs"("workId");

-- CreateIndex
CREATE INDEX "default_ad_configs_workId_idx" ON "default_ad_configs"("workId");

-- CreateIndex
CREATE INDEX "default_ad_configs_hasCustomPlacements_idx" ON "default_ad_configs"("hasCustomPlacements");
