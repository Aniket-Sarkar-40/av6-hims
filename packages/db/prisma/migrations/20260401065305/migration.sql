-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `pms_stock_transfer_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `tock_transfer_from_id_idx`;

-- AlterTable
ALTER TABLE `sch_collection_center` ADD COLUMN `inv_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH',
    ADD COLUMN `pms_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH';

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `tock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
