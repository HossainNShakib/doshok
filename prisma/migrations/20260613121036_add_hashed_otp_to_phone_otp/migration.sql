/*
  Warnings:

  - Added the required column `hashedOtp` to the `PhoneOtpVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhoneOtpVerification" ADD COLUMN     "hashedOtp" TEXT NOT NULL,
ALTER COLUMN "provider" SET DEFAULT 'mock';
