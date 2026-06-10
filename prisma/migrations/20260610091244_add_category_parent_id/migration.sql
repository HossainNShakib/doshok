-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#364152',
ADD COLUMN     "adminAccentTone" TEXT NOT NULL DEFAULT 'neutral',
ADD COLUMN     "buttonRadius" TEXT NOT NULL DEFAULT 'xl',
ADD COLUMN     "cardRadius" TEXT NOT NULL DEFAULT '1.5rem',
ADD COLUMN     "storefrontTone" TEXT NOT NULL DEFAULT 'light';

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
