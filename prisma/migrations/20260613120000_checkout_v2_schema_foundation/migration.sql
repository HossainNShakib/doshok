-- CreateTable
CREATE TABLE "LandingPageSetting" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "paymentOverrideEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paymentRuleOverride" TEXT,
    "paymentRuleValueOverride" INTEGER,
    "otpOverrideEnabled" BOOLEAN NOT NULL DEFAULT false,
    "otpOverride" BOOLEAN,
    "couponOverrideEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoCouponCode" TEXT,
    "deliveryOverrideEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFeeOverride" INTEGER,
    "quantityLimit" INTEGER,
    "customCta" TEXT,
    "customThankYouMessage" TEXT,
    "customQuestionField" TEXT,
    "urgencyCounterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "hideNormalNavigation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPageSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneOtpVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "checkoutToken" TEXT,
    "checkoutTokenExpiresAt" TIMESTAMP(3),
    "checkoutTokenUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneOtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSetting" (
    "id" TEXT NOT NULL DEFAULT 'checkout',
    "checkoutV2Enabled" BOOLEAN NOT NULL DEFAULT false,
    "otpRequired" BOOLEAN NOT NULL DEFAULT true,
    "otpTtlSeconds" INTEGER NOT NULL DEFAULT 300,
    "otpCooldownSeconds" INTEGER NOT NULL DEFAULT 30,
    "otpMaxResend" INTEGER NOT NULL DEFAULT 5,
    "checkoutTokenTtlSeconds" INTEGER NOT NULL DEFAULT 900,
    "defaultPaymentRule" TEXT NOT NULL DEFAULT 'cod_only',
    "defaultPaymentRuleValue" INTEGER,
    "onlineReservationHours" INTEGER NOT NULL DEFAULT 2,
    "codReservationHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSetting_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'product';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "couponType" TEXT,
ADD COLUMN "deliveryDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "discountedProductTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dueAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "finalDeliveryFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "otpVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "otpVerifiedAt" TIMESTAMP(3),
ADD COLUMN "payNow" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "paymentRule" TEXT,
ADD COLUMN "paymentRuleSource" TEXT,
ADD COLUMN "paymentRuleValue" INTEGER,
ADD COLUMN "productDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "productSubtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderShipment" ADD COLUMN "collectionAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "paymentRuleOverride" TEXT,
ADD COLUMN "paymentRuleValueOverride" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "LandingPageSetting_productId_key" ON "LandingPageSetting"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneOtpVerification_checkoutToken_key" ON "PhoneOtpVerification"("checkoutToken");

-- CreateIndex
CREATE INDEX "PhoneOtpVerification_phone_status_idx" ON "PhoneOtpVerification"("phone", "status");

-- CreateIndex
CREATE INDEX "PhoneOtpVerification_expiresAt_idx" ON "PhoneOtpVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "PhoneOtpVerification_checkoutToken_idx" ON "PhoneOtpVerification"("checkoutToken");

-- AddForeignKey
ALTER TABLE "LandingPageSetting" ADD CONSTRAINT "LandingPageSetting_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
