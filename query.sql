-- AlterTable
ALTER TABLE `sch_collection_center` ADD COLUMN `inv_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH',
    ADD COLUMN `pms_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH';


-- AlterTable
ALTER TABLE `core_approval_flow` ADD COLUMN `action_type` ENUM('CONFIG_EVENT', 'WEBHOOK') NOT NULL DEFAULT 'CONFIG_EVENT',
    ADD COLUMN `approve_action_url` VARCHAR(191) NULL,
    ADD COLUMN `partially_approve_action_url` VARCHAR(191) NULL,
    ADD COLUMN `reject_action_url` VARCHAR(191) NULL;