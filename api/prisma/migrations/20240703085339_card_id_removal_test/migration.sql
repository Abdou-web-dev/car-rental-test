/*
  Warnings:

  - You are about to drop the column `carId` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_carId_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "carId";
