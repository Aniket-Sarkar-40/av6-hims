/*
  Warnings:

  - The values [in_percentage,in_amount] on the enum `pms_sell_return_payment_mode` will be removed. If these variants are still used in the database, this will fail.
  - The values [in_percentage,in_amount] on the enum `pms_sell_return_payment_mode` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `pms_stock_transfer_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `tock_transfer_from_id_idx`;

-- AlterTable
ALTER TABLE `pms_sell` MODIFY `payment_mode` ENUM('CASH', 'CHEQUE', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT', 'CREDIT_NOTE') NULL;

-- AlterTable
ALTER TABLE `pms_sell_return` MODIFY `payment_mode` ENUM('CASH', 'CHEQUE', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT', 'CREDIT_NOTE') NULL;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `tock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
