-- CreateTable
CREATE TABLE "Project" (
    "name" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "short_description" TEXT,
    "url" TEXT,
    "repository_url" TEXT,
    "logo_url" TEXT,
    "social_preview_url" TEXT
);

-- CreateTable
CREATE TABLE "Session" (
    "secret" TEXT NOT NULL,
    "flags" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_secret_key" ON "Session"("secret");
