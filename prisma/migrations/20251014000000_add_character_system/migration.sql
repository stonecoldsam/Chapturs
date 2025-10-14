-- CreateTable
CREATE TABLE IF NOT EXISTS "character_profiles" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "role" TEXT,
    "firstAppearance" INTEGER,
    "imageUrl" TEXT,
    "physicalDescription" TEXT,
    "age" TEXT,
    "height" TEXT,
    "appearanceNotes" TEXT,
    "backstory" TEXT,
    "personalityTraits" TEXT,
    "motivations" TEXT,
    "characterArc" TEXT,
    "developmentTimeline" TEXT,
    "authorNotes" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "character_relationships" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "relatedCharacterId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "notes" TEXT,
    "fromChapter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "character_versions" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "description" TEXT,
    "physicalDescription" TEXT,
    "backstory" TEXT,
    "personalityTraits" TEXT,
    "motivations" TEXT,
    "developmentNotes" TEXT,
    "fromChapter" INTEGER NOT NULL,
    "toChapter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "character_profiles_workId_idx" ON "character_profiles"("workId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "character_profiles_name_idx" ON "character_profiles"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "character_relationships_characterId_idx" ON "character_relationships"("characterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "character_relationships_relatedCharacterId_idx" ON "character_relationships"("relatedCharacterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "character_versions_characterId_idx" ON "character_versions"("characterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "character_versions_fromChapter_idx" ON "character_versions"("fromChapter");

-- AddForeignKey
ALTER TABLE "character_profiles" ADD CONSTRAINT "character_profiles_workId_fkey" 
    FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_relationships" ADD CONSTRAINT "character_relationships_characterId_fkey" 
    FOREIGN KEY ("characterId") REFERENCES "character_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_relationships" ADD CONSTRAINT "character_relationships_relatedCharacterId_fkey" 
    FOREIGN KEY ("relatedCharacterId") REFERENCES "character_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_versions" ADD CONSTRAINT "character_versions_characterId_fkey" 
    FOREIGN KEY ("characterId") REFERENCES "character_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
