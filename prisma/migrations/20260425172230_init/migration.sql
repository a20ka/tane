-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "category" TEXT NOT NULL,
    "authorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Idea_createdAt_idx" ON "Idea"("createdAt");

-- CreateIndex
CREATE INDEX "Idea_category_idx" ON "Idea"("category");

-- CreateIndex
CREATE INDEX "Comment_ideaId_idx" ON "Comment"("ideaId");

-- CreateIndex
CREATE INDEX "Reaction_ideaId_idx" ON "Reaction"("ideaId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
