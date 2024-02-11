-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "previewImageUrl" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
