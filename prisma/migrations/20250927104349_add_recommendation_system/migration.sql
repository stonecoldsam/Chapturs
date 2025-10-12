-- CreateTable
CREATE TABLE "user_signals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workId" TEXT,
    "authorId" TEXT,
    "signalType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "metadata" TEXT,
    "sessionId" TEXT,
    "deviceType" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_signals_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_signals_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "genreAffinities" TEXT,
    "formatPreferences" TEXT,
    "readingPatterns" TEXT,
    "socialEngagement" TEXT,
    "qualityPreference" REAL NOT NULL DEFAULT 0.5,
    "freshnessPreference" REAL NOT NULL DEFAULT 0.5,
    "diversityPreference" REAL NOT NULL DEFAULT 0.3,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reading_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT,
    "sessionStart" DATETIME NOT NULL,
    "sessionEnd" DATETIME,
    "durationSeconds" INTEGER,
    "wordsRead" INTEGER NOT NULL DEFAULT 0,
    "scrollDepth" REAL NOT NULL DEFAULT 0,
    "readingSpeed" INTEGER,
    "interactions" TEXT,
    "deviceType" TEXT,
    "referrer" TEXT,
    CONSTRAINT "reading_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reading_sessions_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reading_sessions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recommendation_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "reasons" TEXT,
    "algorithmVersion" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendation_cache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recommendation_cache_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ab_test_groups" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "experimentName" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ab_test_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_similarity" (
    "workId1" TEXT NOT NULL,
    "workId2" TEXT NOT NULL,
    "similarityScore" REAL NOT NULL,
    "similarityType" TEXT NOT NULL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("workId1", "workId2", "similarityType"),
    CONSTRAINT "content_similarity_workId1_fkey" FOREIGN KEY ("workId1") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_similarity_workId2_fkey" FOREIGN KEY ("workId2") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trending_metrics" (
    "workId" TEXT NOT NULL PRIMARY KEY,
    "trendingScore" REAL NOT NULL,
    "velocity1h" REAL NOT NULL DEFAULT 0,
    "velocity24h" REAL NOT NULL DEFAULT 0,
    "velocity7d" REAL NOT NULL DEFAULT 0,
    "peakTime" INTEGER,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trending_metrics_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "filters" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "clickedResults" TEXT,
    "sessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recommendation_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "recommendationSource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "recommendationRank" INTEGER,
    "sessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendation_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recommendation_feedback_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "user_signals_userId_idx" ON "user_signals"("userId");

-- CreateIndex
CREATE INDEX "user_signals_workId_idx" ON "user_signals"("workId");

-- CreateIndex
CREATE INDEX "user_signals_signalType_idx" ON "user_signals"("signalType");

-- CreateIndex
CREATE INDEX "user_signals_timestamp_idx" ON "user_signals"("timestamp");

-- CreateIndex
CREATE INDEX "user_signals_userId_signalType_timestamp_idx" ON "user_signals"("userId", "signalType", "timestamp");

-- CreateIndex
CREATE INDEX "reading_sessions_userId_idx" ON "reading_sessions"("userId");

-- CreateIndex
CREATE INDEX "reading_sessions_workId_idx" ON "reading_sessions"("workId");

-- CreateIndex
CREATE INDEX "reading_sessions_durationSeconds_idx" ON "reading_sessions"("durationSeconds");

-- CreateIndex
CREATE INDEX "recommendation_cache_userId_idx" ON "recommendation_cache"("userId");

-- CreateIndex
CREATE INDEX "recommendation_cache_score_idx" ON "recommendation_cache"("score" DESC);

-- CreateIndex
CREATE INDEX "recommendation_cache_expiresAt_idx" ON "recommendation_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "ab_test_groups_experimentName_groupName_idx" ON "ab_test_groups"("experimentName", "groupName");

-- CreateIndex
CREATE INDEX "content_similarity_similarityScore_idx" ON "content_similarity"("similarityScore" DESC);

-- CreateIndex
CREATE INDEX "trending_metrics_trendingScore_idx" ON "trending_metrics"("trendingScore" DESC);

-- CreateIndex
CREATE INDEX "trending_metrics_velocity24h_idx" ON "trending_metrics"("velocity24h" DESC);

-- CreateIndex
CREATE INDEX "search_analytics_userId_idx" ON "search_analytics"("userId");

-- CreateIndex
CREATE INDEX "search_analytics_query_idx" ON "search_analytics"("query");

-- CreateIndex
CREATE INDEX "search_analytics_timestamp_idx" ON "search_analytics"("timestamp");

-- CreateIndex
CREATE INDEX "recommendation_feedback_userId_idx" ON "recommendation_feedback"("userId");

-- CreateIndex
CREATE INDEX "recommendation_feedback_workId_idx" ON "recommendation_feedback"("workId");

-- CreateIndex
CREATE INDEX "recommendation_feedback_recommendationSource_idx" ON "recommendation_feedback"("recommendationSource");

-- CreateIndex
CREATE INDEX "recommendation_feedback_action_idx" ON "recommendation_feedback"("action");
