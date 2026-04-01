/*
  Warnings:

  - You are about to drop the column `inv_cc_type` on the `sch_collection_center` table. All the data in the column will be lost.
  - You are about to drop the column `pms_cc_type` on the `sch_collection_center` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `pms_stock_transfer_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `tock_transfer_from_id_idx`;

-- AlterTable
ALTER TABLE `sch_collection_center` DROP COLUMN `inv_cc_type`,
    DROP COLUMN `pms_cc_type`;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `tock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
