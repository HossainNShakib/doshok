-- Add stockRestoredAt field to Order for idempotency protection
ALTER TABLE "Order" ADD COLUMN "stockRestoredAt" TIMESTAMP(3);