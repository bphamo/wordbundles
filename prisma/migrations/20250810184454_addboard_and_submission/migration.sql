-- CreateTable
CREATE TABLE "public"."board" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "moderation" TEXT NOT NULL DEFAULT 'auto',
    "embedToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_embedToken_key" ON "public"."board"("embedToken");

-- CreateIndex
CREATE INDEX "submission_boardId_idx" ON "public"."submission"("boardId");

-- AddForeignKey
ALTER TABLE "public"."board" ADD CONSTRAINT "board_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
