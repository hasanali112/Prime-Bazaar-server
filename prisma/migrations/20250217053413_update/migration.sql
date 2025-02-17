/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `item_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `sub_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "item_categories_name_key" ON "item_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_name_key" ON "sub_categories"("name");
