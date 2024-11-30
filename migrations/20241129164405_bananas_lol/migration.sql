-- CreateTable
CREATE TABLE "PublisherToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false
);
