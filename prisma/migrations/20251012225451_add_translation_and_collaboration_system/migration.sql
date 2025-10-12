-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "translatorId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rank" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "translation_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "translationId" TEXT,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "suggestedText" TEXT NOT NULL,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "translator_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "trustLevel" TEXT NOT NULL DEFAULT 'community',
    "translationCount" INTEGER NOT NULL DEFAULT 0,
    "approvalRate" REAL NOT NULL DEFAULT 0.0,
    "averageVotes" REAL NOT NULL DEFAULT 0.0,
    "badges" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "edit_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "suggestedText" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "block_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "parentId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "translation_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "translationSuggestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "translations_workId_idx" ON "translations"("workId");

-- CreateIndex
CREATE INDEX "translations_sectionId_idx" ON "translations"("sectionId");

-- CreateIndex
CREATE INDEX "translations_language_idx" ON "translations"("language");

-- CreateIndex
CREATE INDEX "translations_status_idx" ON "translations"("status");

-- CreateIndex
CREATE INDEX "translations_translatorId_idx" ON "translations"("translatorId");

-- CreateIndex
CREATE UNIQUE INDEX "translations_blockId_sentenceId_language_version_key" ON "translations"("blockId", "sentenceId", "language", "version");

-- CreateIndex
CREATE INDEX "translation_suggestions_workId_idx" ON "translation_suggestions"("workId");

-- CreateIndex
CREATE INDEX "translation_suggestions_sectionId_idx" ON "translation_suggestions"("sectionId");

-- CreateIndex
CREATE INDEX "translation_suggestions_language_idx" ON "translation_suggestions"("language");

-- CreateIndex
CREATE INDEX "translation_suggestions_status_idx" ON "translation_suggestions"("status");

-- CreateIndex
CREATE INDEX "translation_suggestions_userId_idx" ON "translation_suggestions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "translator_profiles_userId_key" ON "translator_profiles"("userId");

-- CreateIndex
CREATE INDEX "translator_profiles_userId_idx" ON "translator_profiles"("userId");

-- CreateIndex
CREATE INDEX "translator_profiles_trustLevel_idx" ON "translator_profiles"("trustLevel");

-- CreateIndex
CREATE INDEX "edit_suggestions_workId_idx" ON "edit_suggestions"("workId");

-- CreateIndex
CREATE INDEX "edit_suggestions_sectionId_idx" ON "edit_suggestions"("sectionId");

-- CreateIndex
CREATE INDEX "edit_suggestions_status_idx" ON "edit_suggestions"("status");

-- CreateIndex
CREATE INDEX "edit_suggestions_userId_idx" ON "edit_suggestions"("userId");

-- CreateIndex
CREATE INDEX "block_comments_workId_idx" ON "block_comments"("workId");

-- CreateIndex
CREATE INDEX "block_comments_sectionId_idx" ON "block_comments"("sectionId");

-- CreateIndex
CREATE INDEX "block_comments_blockId_idx" ON "block_comments"("blockId");

-- CreateIndex
CREATE INDEX "block_comments_userId_idx" ON "block_comments"("userId");

-- CreateIndex
CREATE INDEX "block_comments_parentId_idx" ON "block_comments"("parentId");

-- CreateIndex
CREATE INDEX "translation_votes_translationSuggestionId_idx" ON "translation_votes"("translationSuggestionId");

-- CreateIndex
CREATE INDEX "translation_votes_userId_idx" ON "translation_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "translation_votes_translationSuggestionId_userId_key" ON "translation_votes"("translationSuggestionId", "userId");
