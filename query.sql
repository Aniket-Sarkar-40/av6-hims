-- AlterTable
ALTER TABLE `sch_collection_center` ADD COLUMN `inv_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH',
    ADD COLUMN `pms_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH';


-- AlterTable
ALTER TABLE `core_approval_flow` ADD COLUMN `action_type` ENUM('CONFIG_EVENT', 'WEBHOOK') NOT NULL DEFAULT 'CONFIG_EVENT',
    ADD COLUMN `approve_action_url` VARCHAR(191) NULL,
    ADD COLUMN `partially_approve_action_url` VARCHAR(191) NULL,
    ADD COLUMN `reject_action_url` VARCHAR(191) NULL;

    -- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `pms_stock_transfer_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `tock_transfer_from_id_idx`;

-- AlterTable
ALTER TABLE `core_pdf_template` MODIFY `template_type` ENUM('BILL', 'INVOICE', 'REPORT', 'PURCHASE_ORDER') NOT NULL;

-- AlterTable
ALTER TABLE `inv_item_master` ADD COLUMN `last_purchased_price` DECIMAL(13, 5) NULL;

-- AlterTable
ALTER TABLE `inv_settings` ADD COLUMN `supplier_mode` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `inv_uin_config` MODIFY `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'ITEM', 'BATCH_JOB', 'CN', 'STAJ', 'ST_TR') NOT NULL;

-- CreateTable
CREATE TABLE `inv_stock_transfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock_transfer_number` VARCHAR(191) NOT NULL,
    `staff_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `from_id` INTEGER NOT NULL,
    `to_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('CREATED', 'DISPATCHED', 'ACKNOWLEDGED', 'PARTIALLY_ACKNOWLEDGED') NOT NULL DEFAULT 'CREATED',
    `return_status` ENUM('PENDING_RETURN', 'RETURNED') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `acknowledged_by` INTEGER NULL,
    `return_approved_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `acknowledge_at` DATETIME(3) NULL,
    `return_approved_at` DATETIME(3) NULL,

    INDEX `stock_transfer_cc_id_idx`(`cc_id`),
    INDEX `stock_transfer_from_id_idx`(`from_id`),
    INDEX `stock_transfer_to_id_idx`(`to_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_stock_transfer_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `st_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `acknowledged_quantity` INTEGER NOT NULL DEFAULT 0,
    `return_quantity` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `stock_transfer_details_st_id_idx`(`st_id`),
    INDEX `stock_transfer_details_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer` ADD CONSTRAINT `stock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer` ADD CONSTRAINT `inv_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer` ADD CONSTRAINT `inv_stock_transfer_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer_details` ADD CONSTRAINT `inv_stock_transfer_details_st_id_fkey` FOREIGN KEY (`st_id`) REFERENCES `inv_stock_transfer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer_details` ADD CONSTRAINT `inv_stock_transfer_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `tock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
