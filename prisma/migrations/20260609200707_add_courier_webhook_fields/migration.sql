-- AlterTable
ALTER TABLE "OrderShipment" ADD COLUMN     "lastCourierPayload" TEXT,
ADD COLUMN     "lastCourierStatus" TEXT,
ADD COLUMN     "lastCourierUpdate" TIMESTAMP(3);
