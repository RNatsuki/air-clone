/*
  Warnings:

  - You are about to drop the `Metric` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN "cpu" REAL;
ALTER TABLE "Device" ADD COLUMN "memory" REAL;
ALTER TABLE "Device" ADD COLUMN "signal" INTEGER;
ALTER TABLE "Device" ADD COLUMN "uptime" INTEGER;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Metric";
PRAGMA foreign_keys=on;
