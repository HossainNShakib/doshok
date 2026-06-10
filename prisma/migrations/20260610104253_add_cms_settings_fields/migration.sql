-- AlterTable
ALTER TABLE "HomepageConfig" ADD COLUMN     "announcementBarEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "announcementBarText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "promoBannerEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promoBannerImage" TEXT,
ADD COLUMN     "promoBannerLink" TEXT,
ADD COLUMN     "promoBannerText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "footerLinks" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "headerQuickLinks" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
