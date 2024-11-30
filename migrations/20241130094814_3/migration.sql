/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `PublisherToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PublisherToken_value_key" ON "PublisherToken"("value");
