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

-- DropForeignKey
ALTER TABLE `inv_stock_transfer` DROP FOREIGN KEY `inv_stock_transfer_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `inv_stock_transfer` DROP FOREIGN KEY `stock_transfer_from_id_idx`;

-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `pms_stock_transfer_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `pms_stock_transfer` DROP FOREIGN KEY `tock_transfer_from_id_idx`;

-- AlterTable
ALTER TABLE `core_audit_config` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL;

-- AlterTable
ALTER TABLE `core_common_audit` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL;

-- AlterTable
ALTER TABLE `core_event_delivery` MODIFY `service` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL;

-- AlterTable
ALTER TABLE `core_pdf_template` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL;

-- AlterTable
ALTER TABLE `core_service_event` MODIFY `service` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL DEFAULT 'OPD';

-- AlterTable
ALTER TABLE `nopd_payment_transactions` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `source` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL;

-- AlterTable
ALTER TABLE `pathology_b2b_invoice_amount_summary` MODIFY `service_type` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL DEFAULT 'PATHOLOGY';

-- AlterTable
ALTER TABLE `pms_batch_job` MODIFY `type` ENUM('ITEM', 'ITEM_PRICING', 'VOUCHER_ENTRY', 'BANK_STATEMENT_UPLOAD') NOT NULL;

-- AlterTable
ALTER TABLE `sch_collection_center` ADD COLUMN `companyId` INTEGER NULL;

-- CreateTable
CREATE TABLE `accounting_dynamic_short_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(191) NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `is_dto` BOOLEAN NOT NULL DEFAULT false,
    `is_cacheable` BOOLEAN NOT NULL DEFAULT false,
    `is_drop_down` BOOLEAN NOT NULL DEFAULT false,
    `permission` VARCHAR(191) NULL,
    `where_clause` JSON NULL,
    `select_clause` JSON NULL,
    `config` JSON NULL,
    `is_single_dto` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accounting_dynamic_short_code_short_code_key`(`short_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_uin_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` ENUM('VOUCHER', 'BATCH_JOB') NOT NULL,
    `sequence_no` BIGINT NOT NULL DEFAULT 0,
    `seq_reset_date` DATE NOT NULL,
    `seq_reset_policy` ENUM('daily', 'weekly', 'monthly', 'yearly', 'no') NOT NULL DEFAULT 'no',
    `description` VARCHAR(191) NULL,
    `uin_segments` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_email_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email_type` VARCHAR(191) NULL,
    `smtp_server` VARCHAR(191) NULL,
    `smtp_port` VARCHAR(191) NULL,
    `smtp_username` VARCHAR(191) NULL,
    `smtp_password` VARCHAR(191) NULL,
    `ssl_tls` VARCHAR(191) NULL,
    `config_type` ENUM('USER', 'ADMIN', 'ISSUE') NULL DEFAULT 'ADMIN',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_audit_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `is_auditable` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_common_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `level1_id` INTEGER NULL,
    `level2_id` INTEGER NULL,
    `method_name` VARCHAR(191) NULL,
    `trace_id` VARCHAR(191) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `rounding_method` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'ROUND',
    `rounding_precision` INTEGER NOT NULL DEFAULT 2,
    `time_zone` VARCHAR(191) NULL,
    `excel_batch_size` INTEGER NOT NULL DEFAULT 100,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `legal_name` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `books_begin_from` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_company_address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `address_type` ENUM('REGISTERED', 'COMMUNICATION', 'BILLING') NOT NULL,
    `address_line_1` VARCHAR(191) NOT NULL,
    `address_line_2` VARCHAR(191) NULL,
    `city_id` INTEGER NOT NULL,
    `state_id` INTEGER NOT NULL,
    `country_id` INTEGER NOT NULL,
    `pin_code` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `company_address_company_id_idx`(`company_id`),
    INDEX `company_address_city_id_idx`(`city_id`),
    INDEX `company_address_state_id_idx`(`state_id`),
    INDEX `company_address_country_id_idx`(`country_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_company_statutory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `pan` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `cin` VARCHAR(191) NULL,
    `tan` VARCHAR(191) NULL,
    `msme_no` VARCHAR(191) NULL,
    `gst_registration_type` ENUM('REGULAR', 'COMPOSITION', 'UNREGISTERED', 'SEZ', 'EXPORT', 'OTHER') NULL,
    `gst_state_code` VARCHAR(191) NULL,
    `is_gst_enabled` BOOLEAN NOT NULL DEFAULT false,
    `gst_effective_from` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `accounting_company_statutory_company_id_key`(`company_id`),
    INDEX `company_statutory_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_company_financial_year` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `fy_name` VARCHAR(191) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `books_begin_from` DATE NOT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `company_financial_year_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_company_currency_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `base_currency_code` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `currency_name` VARCHAR(191) NOT NULL,
    `sub_unit_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `accounting_company_currency_settings_company_id_key`(`company_id`),
    INDEX `company_currency_settings_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_company_features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `enable_cost_center` BOOLEAN NOT NULL DEFAULT false,
    `enable_bill_wise_tracking` BOOLEAN NOT NULL DEFAULT true,
    `enable_bank_reconciliation` BOOLEAN NOT NULL DEFAULT false,
    `enable_gst` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `accounting_company_features_company_id_key`(`company_id`),
    INDEX `company_features_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NULL,
    `is_primary_group` BOOLEAN NOT NULL DEFAULT false,
    `parent_id` INTEGER NULL,
    `primary_category` ENUM('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE') NOT NULL,
    `report_type` ENUM('BALANCE_SHEET', 'PROFIT_LOSS') NOT NULL,
    `nature` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `affects_gross_profit` BOOLEAN NOT NULL DEFAULT false,
    `behaves_like_sub_ledger` BOOLEAN NOT NULL DEFAULT false,
    `net_dr_cr_for_reporting` BOOLEAN NOT NULL DEFAULT true,
    `used_for_calculation` BOOLEAN NOT NULL DEFAULT false,
    `is_reserved` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_group_company`(`company_id`),
    INDEX `idx_group_parent`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_ledger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `alias` VARCHAR(150) NULL,
    `ledgerType` ENUM('GENERAL', 'CUSTOMER', 'SUPPLIER', 'BANK', 'CASH', 'TAX') NOT NULL DEFAULT 'GENERAL',
    `is_bill_wise_on` BOOLEAN NOT NULL DEFAULT false,
    `is_cost_centre_on` BOOLEAN NOT NULL DEFAULT false,
    `is_bank_account` BOOLEAN NOT NULL DEFAULT false,
    `is_cash_account` BOOLEAN NOT NULL DEFAULT false,
    `is_reserved` BOOLEAN NOT NULL DEFAULT false,
    `bank_name` VARCHAR(120) NULL,
    `bank_ifsc` VARCHAR(20) NULL,
    `bank_account_no` VARCHAR(40) NULL,
    `upi_id` VARCHAR(120) NULL,
    `contact_name` VARCHAR(120) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(150) NULL,
    `address` TEXT NULL,
    `gst_type` ENUM('NA', 'REGISTERED', 'UNREGISTERED', 'COMPOSITION', 'SEZ', 'EXPORT', 'OTHER') NOT NULL DEFAULT 'NA',
    `gstin` VARCHAR(191) NULL,
    `place_of_supply_state_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_ledger_company`(`company_id`),
    INDEX `idx_ledger_group`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_ledger_opening_balances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `financial_year_id` INTEGER NOT NULL,
    `ledger_id` INTEGER NOT NULL,
    `as_on_date` DATE NOT NULL,
    `amount` DECIMAL(18, 5) NOT NULL,
    `dr_cr` ENUM('DR', 'CR') NOT NULL,
    `source` VARCHAR(30) NULL,
    `note` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_ledger_opening_balance_company`(`company_id`),
    INDEX `idx_ledger_opening_balance_financial_year`(`financial_year_id`),
    INDEX `idx_ledger_opening_balance_ledger`(`ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_voucher_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nature` ENUM('PAYMENT', 'RECEIPT', 'CONTRA', 'JOURNAL', 'SALES', 'SALES_RETURN', 'PURCHASE', 'PURCHASE_RETURN', 'DEBIT_NOTE', 'CREDIT_NOTE') NOT NULL,
    `numbering_mode` ENUM('MANUAL', 'AUTO') NOT NULL,
    `is_narration_mandatory` BOOLEAN NOT NULL DEFAULT false,
    `allow_zero_value_transactions` BOOLEAN NOT NULL DEFAULT false,
    `require_bank_or_cash` BOOLEAN NOT NULL DEFAULT false,
    `contra_only_bank_or_cash` BOOLEAN NOT NULL DEFAULT false,
    `enable_bill_wise_tracking` BOOLEAN NOT NULL DEFAULT false,
    `enable_cost_centers` BOOLEAN NOT NULL DEFAULT false,
    `is_reserved` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_voucher_type_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_cost_center` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `parent_id` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_cost_center_company`(`company_id`),
    INDEX `idx_cost_center_parent`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_voucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `financial_year_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `voucher_type_id` INTEGER NOT NULL,
    `voucher_no` VARCHAR(191) NOT NULL,
    `voucher_date` DATE NOT NULL,
    `ref_type` VARCHAR(191) NULL,
    `sub_ref_type` VARCHAR(191) NULL,
    `ref_no` VARCHAR(191) NULL,
    `ref_id` INTEGER NULL,
    `p_id` VARCHAR(191) NULL,
    `narration` TEXT NULL,
    `status` ENUM('DRAFT', 'POSTED', 'CANCELLED') NOT NULL DEFAULT 'POSTED',
    `total_debit` DECIMAL(18, 5) NULL,
    `total_credit` DECIMAL(18, 5) NULL,
    `currency_id` INTEGER NULL,
    `currency_conversion_rate` DECIMAL(18, 5) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,

    INDEX `idx_voucher_company`(`company_id`),
    INDEX `idx_voucher_financial_year`(`financial_year_id`),
    INDEX `idx_voucher_type`(`voucher_type_id`),
    INDEX `idx_voucher_collection_center`(`cc_id`),
    INDEX `idx_voucher_currency`(`currency_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_voucher_line` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_id` INTEGER NOT NULL,
    `line_no` INTEGER NOT NULL,
    `ledger_id` INTEGER NOT NULL,
    `dr_cr` ENUM('DR', 'CR') NOT NULL,
    `amount` DECIMAL(18, 5) NOT NULL,
    `description` VARCHAR(191) NULL,
    `instrument_no` VARCHAR(191) NULL,
    `instrument_date` DATETIME(3) NULL,
    `bank_reference_no` VARCHAR(191) NULL,
    `bank_transaction_date` DATE NULL,
    `bank_cleared_date` DATE NULL,
    `bank_reconcile_status` ENUM('UNRECONCILED', 'RECONCILED', 'PARTIALLY_RECONCILED', 'BOUNCED', 'CANCELLED', 'IGNORED') NOT NULL DEFAULT 'UNRECONCILED',
    `bank_reconcile_remarks` TEXT NULL,
    `last_reconciled_at` DATETIME(3) NULL,
    `last_reconciled_by` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_voucher_line_voucher`(`voucher_id`),
    INDEX `idx_voucher_line_ledger`(`ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_cost_center_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `voucher_id` INTEGER NOT NULL,
    `voucher_line_id` INTEGER NOT NULL,
    `cost_center_id` INTEGER NOT NULL,
    `dr_cr` ENUM('DR', 'CR') NOT NULL,
    `amount` DECIMAL(18, 5) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_cc_alloc_company`(`company_id`),
    INDEX `idx_cc_alloc_cost_center`(`cost_center_id`),
    INDEX `idx_cc_alloc_voucher`(`voucher_id`),
    INDEX `idx_cc_alloc_voucher_line`(`voucher_line_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_bill_document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `financial_year_id` INTEGER NOT NULL,
    `party_ledger_id` INTEGER NOT NULL,
    `bill_type` ENUM('RECEIVABLE', 'PAYABLE') NOT NULL,
    `ref_no` VARCHAR(191) NOT NULL,
    `ref_date` DATE NOT NULL,
    `due_date` DATE NULL,
    `amount` DECIMAL(18, 5) NOT NULL,
    `adjusted_amount` DECIMAL(18, 5) NOT NULL DEFAULT 0,
    `status` ENUM('OPEN', 'PARTIAL', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `source_voucher_id` INTEGER NULL,
    `note` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_bill_doc_company`(`company_id`),
    INDEX `idx_bill_doc_party_ledger`(`party_ledger_id`),
    INDEX `idx_bill_doc_financial_year`(`financial_year_id`),
    INDEX `idx_bill_doc_source_voucher`(`source_voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_bill_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `financial_year_id` INTEGER NOT NULL,
    `voucher_id` INTEGER NOT NULL,
    `voucher_line_id` INTEGER NOT NULL,
    `party_ledger_id` INTEGER NOT NULL,
    `allocation_type` ENUM('AGAINST_REF', 'NEW_REF', 'ON_ACCOUNT') NOT NULL,
    `bill_document_id` INTEGER NULL,
    `ref_no` VARCHAR(191) NULL,
    `ref_date` DATE NULL,
    `due_date` DATE NULL,
    `dr_cr` ENUM('DR', 'CR') NOT NULL,
    `amount` DECIMAL(18, 5) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_bill_alloc_company`(`company_id`),
    INDEX `idx_bill_alloc_financial_year`(`financial_year_id`),
    INDEX `idx_bill_alloc_voucher`(`voucher_id`),
    INDEX `idx_bill_alloc_voucher_line`(`voucher_line_id`),
    INDEX `idx_bill_alloc_party_ledger`(`party_ledger_id`),
    INDEX `idx_bill_alloc_bill_document`(`bill_document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_narration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `voucher_type_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_integration_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ref_type` ENUM('PHARMACY_GRN', 'PHARMACY_GRN_RETURN', 'PHARMACY_GRN_PAYMENT', 'PHARMACY_GRN_REFUND', 'PHARMACY_SELL', 'PHARMACY_SELL_DISCOUNT', 'PHARMACY_SELL_COPAY_INCREASE', 'PHARMACY_SELL_COPAY_DECREASE', 'PHARMACY_SELL_RETURN', 'PHARMACY_SELL_PAYMENT', 'PHARMACY_SELL_REFUND', 'PHARMACY_INCOME', 'PHARMACY_EXPENSE', 'OPD_APPOINTMENT', 'OPD_APPOINTMENT_DISCOUNT', 'OPD_APPOINTMENT_COPAY_INCREASE', 'OPD_APPOINTMENT_COPAY_DECREASE', 'OPD_APPOINTMENT_RETURN', 'OPD_APPOINTMENT_PAYMENT', 'OPD_APPOINTMENT_REFUND', 'PROCEDURE', 'PROCEDURE_DISCOUNT', 'PROCEDURE_COPAY_INCREASE', 'PROCEDURE_COPAY_DECREASE', 'PROCEDURE_RETURN', 'PROCEDURE_PAYMENT', 'PROCEDURE_REFUND', 'GENERAL_BILL', 'GENERAL_BILL_DISCOUNT', 'GENERAL_BILL_RETURN', 'GENERAL_BILL_PAYMENT', 'GENERAL_BILL_REFUND', 'INVESTIGATION', 'INVESTIGATION_DISCOUNT', 'INVESTIGATION_COPAY_INCREASE', 'INVESTIGATION_COPAY_DECREASE', 'INVESTIGATION_RETURN', 'INVESTIGATION_PAYMENT', 'INVESTIGATION_REFUND', 'INVENTORY_GRN', 'INVENTORY_GRN_RETURN', 'INVENTORY_GRN_PAYMENT', 'INVENTORY_GRN_REFUND', 'INVENTORY_INCOME', 'INVENTORY_EXPENSE', 'PREPAID_INSURANCE_PAYMENT', 'POSTPAID_INSURANCE_PAYMENT', 'PREPAID_CORPORATE_PAYMENT', 'POSTPAID_CORPORATE_PAYMENT', 'PREPAID_INSURANCE_REFUND', 'POSTPAID_INSURANCE_REFUND', 'PREPAID_CORPORATE_REFUND', 'POSTPAID_CORPORATE_REFUND') NOT NULL,
    `sub_ref_type` ENUM('WALK_IN', 'INSURANCE', 'CORPORATE') NULL,
    `voucher_type_id` INTEGER NOT NULL,
    `narration_text` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_integration_config_voucher_type`(`voucher_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_integration_config_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accounting_integration_config_id` INTEGER NOT NULL,
    `type` ENUM('FLAT', 'ARRAY') NOT NULL,
    `ledger_type` ENUM('ID', 'CREATABLE') NOT NULL,
    `ledger_value` VARCHAR(191) NOT NULL,
    `policy` ENUM('DR', 'CR') NOT NULL,
    `amount_key` VARCHAR(191) NOT NULL,
    `master_key` VARCHAR(191) NULL,
    `group_id` INTEGER NULL,
    `is_payment_related` BOOLEAN NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_integration_config_details_config`(`accounting_integration_config_id`),
    INDEX `idx_integration_config_details_group`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_client_ledger_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_type` ENUM('CORPORATE', 'INSURANCE', 'PMS_DISTRIBUTOR', 'INV_ITEM_SUPPLIER') NOT NULL,
    `client_id` INTEGER NOT NULL,
    `ledger_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_client_ledger_mapping_ledger`(`ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_batch_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ITEM', 'ITEM_PRICING', 'VOUCHER_ENTRY', 'BANK_STATEMENT_UPLOAD') NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `batch_job_no` VARCHAR(191) NULL,
    `total_qty` INTEGER NOT NULL,
    `processed_qty` INTEGER NOT NULL DEFAULT 0,
    `success_count` INTEGER NOT NULL DEFAULT 0,
    `failure_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_batch_job_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_id` INTEGER NOT NULL,
    `type` ENUM('CREATE', 'UPDATE') NOT NULL DEFAULT 'CREATE',
    `row_title` VARCHAR(191) NULL,
    `row_no` INTEGER NULL,
    `ref_id` INTEGER NULL,
    `ref_no` VARCHAR(191) NULL,
    `status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `error_msg` TEXT NULL,

    INDEX `batch_job_details_batch_id_idx`(`batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_voucher_entry_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `row_no` INTEGER NULL,
    `voucher_date` DATE NOT NULL,
    `voucher_type` VARCHAR(191) NOT NULL,
    `ref_type` VARCHAR(191) NULL,
    `sub_ref_type` VARCHAR(191) NULL,
    `ref_no` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'POSTED', 'CANCELLED') NOT NULL,
    `narration` VARCHAR(191) NOT NULL,
    `party_ledger` VARCHAR(191) NULL,
    `party_ledger_group` VARCHAR(191) NULL,
    `other_ledgers` JSON NOT NULL,
    `batch_job_id` INTEGER NOT NULL,

    INDEX `voucher_entry_excel_batch_job_id_idx`(`batch_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_bank_statement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `financial_year_id` INTEGER NOT NULL,
    `ledger_id` INTEGER NOT NULL,
    `file_url` VARCHAR(191) NULL,
    `statement_from` DATE NULL,
    `statement_to` DATE NULL,
    `remarks` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_bank_stmt_batch_company`(`company_id`),
    INDEX `idx_bank_stmt_batch_financial_year`(`financial_year_id`),
    INDEX `idx_bank_stmt_batch_ledger`(`ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_bank_statement_row` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_statement_id` INTEGER NULL,
    `source_type` ENUM('IMPORT', 'MANUAL') NOT NULL DEFAULT 'IMPORT',
    `transaction_date` DATE NOT NULL,
    `value_date` DATE NULL,
    `transaction_id` VARCHAR(191) NULL,
    `cheque_no` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `dr_cr` ENUM('DR', 'CR') NOT NULL,
    `amount` DECIMAL(18, 5) NOT NULL,
    `voucher_no` VARCHAR(191) NULL,
    `voucher_type` VARCHAR(191) NULL,
    `ledger_name` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `reconcile_status` ENUM('UNRECONCILED', 'RECONCILED', 'PARTIALLY_RECONCILED', 'BOUNCED', 'CANCELLED', 'IGNORED') NOT NULL DEFAULT 'UNRECONCILED',
    `reconcile_remarks` TEXT NULL,
    `last_reconciled_at` DATETIME(3) NULL,
    `last_reconciled_by` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_bank_stmt_row_bank_statement`(`bank_statement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_bank_reconciliation_match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_line_id` INTEGER NOT NULL,
    `bank_statement_row_id` INTEGER NOT NULL,
    `matched_amount` DECIMAL(18, 5) NOT NULL,
    `cleared_date` DATE NULL,
    `match_type` ENUM('MANUAL', 'AUTO') NOT NULL DEFAULT 'MANUAL',
    `match_confidence` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    `remarks` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_bank_recon_match_voucher_line`(`voucher_line_id`),
    INDEX `idx_bank_recon_match_stmt_row`(`bank_statement_row_id`),
    INDEX `idx_bank_recon_match_type`(`match_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_bank_statement_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_job_id` INTEGER NOT NULL,
    `row_no` INTEGER NULL,
    `transaction_date` DATE NOT NULL,
    `value_date` DATE NULL,
    `transaction_id` VARCHAR(191) NULL,
    `cheque_no` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `dr_cr` ENUM('DR', 'CR') NOT NULL,
    `transaction_amount` DECIMAL(18, 5) NOT NULL,
    `voucher_no` VARCHAR(191) NULL,
    `voucher_type` VARCHAR(191) NULL,
    `ledger_name` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,

    INDEX `idx_bank_stmt_excel_batch_job`(`batch_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sch_settings` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `lang_id` INTEGER NULL,
    `dise_code` VARCHAR(50) NULL,
    `date_format` VARCHAR(50) NOT NULL,
    `time_format` VARCHAR(20) NULL DEFAULT '24-hour',
    `currency` VARCHAR(50) NOT NULL,
    `currency_symbol` VARCHAR(50) NOT NULL,
    `is_rtl` VARCHAR(10) NULL DEFAULT 'disabled',
    `timezone` VARCHAR(30) NULL DEFAULT 'UTC',
    `session_id` INTEGER NULL,
    `start_month` VARCHAR(40) NOT NULL,
    `image` VARCHAR(100) NULL,
    `mini_logo` VARCHAR(200) NOT NULL,
    `theme` VARCHAR(200) NOT NULL DEFAULT 'default.jpg',
    `credit_limit` VARCHAR(255) NULL,
    `opd_record_month` VARCHAR(50) NULL,
    `is_active` VARCHAR(255) NULL DEFAULT 'no',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cron_secret_key` VARCHAR(100) NOT NULL,
    `fee_due_days` INTEGER NULL DEFAULT 0,
    `doctor_restriction` VARCHAR(100) NOT NULL,
    `superadmin_restriction` VARCHAR(200) NOT NULL,
    `active_queue` INTEGER NOT NULL,
    `waitting_queue` INTEGER NOT NULL,
    `is_registration_chargable` INTEGER NOT NULL,
    `collection_abbreviation_name` VARCHAR(255) NULL,
    `lab_openning_time` TIME NOT NULL,
    `lab_closing_time` TIME NOT NULL,
    `daily_cutoff_start` TIME NOT NULL,
    `daily_cutoff_end` TIME NOT NULL,
    `report_background` VARCHAR(100) NULL,
    `receipt_background` VARCHAR(100) NULL,
    `currency_logo` VARCHAR(100) NULL,
    `report_stamp` VARCHAR(100) NULL,
    `default_sign` VARCHAR(100) NULL,
    `default_menu` ENUM('b2c', 'b2b') NOT NULL DEFAULT 'b2c',
    `print_due_report` ENUM('0', '1') NOT NULL DEFAULT '0',
    `barcode_print_size` VARCHAR(10) NULL DEFAULT '60mmX22mm',
    `cc_id` INTEGER NOT NULL,
    `print_receipt_header` TEXT NULL,
    `contact_email` VARCHAR(255) NULL,
    `auto_consume` ENUM('0', '1') NOT NULL DEFAULT '0',
    `barcode_printer_name` VARCHAR(255) NULL,
    `mail_server` VARCHAR(255) NULL,
    `auto_fill_patho_amount` ENUM('0', '1') NOT NULL DEFAULT '1',
    `receipt_end_text` VARCHAR(256) NULL,
    `new_pharmacy` BOOLEAN NULL,
    `new_opd` BOOLEAN NULL,
    `corporate_referral_mode` ENUM('credit_control', 'corporate_client') NULL DEFAULT 'credit_control',
    `location_wise_role` ENUM('enabled', 'disabled') NULL DEFAULT 'disabled',
    `enable_sas` ENUM('Yes', 'No') NULL DEFAULT 'No',
    `financial_year_start` VARCHAR(100) NULL DEFAULT '04',
    `enable_location_wise_client_master` ENUM('Yes', 'No') NULL DEFAULT 'No',
    `enable_location_wise_insurer_master` ENUM('Yes', 'No') NULL DEFAULT 'No',

    UNIQUE INDEX `sch_settings_cc_id_key`(`cc_id`),
    INDEX `lang_id`(`lang_id`),
    INDEX `session_id`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounting_company_address` ADD CONSTRAINT `accounting_company_address_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_address` ADD CONSTRAINT `accounting_company_address_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `master_city`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_address` ADD CONSTRAINT `accounting_company_address_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `master_state`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_address` ADD CONSTRAINT `accounting_company_address_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`num_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_statutory` ADD CONSTRAINT `accounting_company_statutory_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_financial_year` ADD CONSTRAINT `accounting_company_financial_year_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_currency_settings` ADD CONSTRAINT `accounting_company_currency_settings_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_company_features` ADD CONSTRAINT `accounting_company_features_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_group` ADD CONSTRAINT `accounting_group_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_group` ADD CONSTRAINT `accounting_group_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `accounting_group`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accounting_ledger` ADD CONSTRAINT `accounting_ledger_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_ledger` ADD CONSTRAINT `accounting_ledger_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `accounting_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_ledger_opening_balances` ADD CONSTRAINT `accounting_ledger_opening_balances_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_ledger_opening_balances` ADD CONSTRAINT `accounting_ledger_opening_balances_financial_year_id_fkey` FOREIGN KEY (`financial_year_id`) REFERENCES `accounting_company_financial_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_ledger_opening_balances` ADD CONSTRAINT `accounting_ledger_opening_balances_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `accounting_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher_type` ADD CONSTRAINT `accounting_voucher_type_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_cost_center` ADD CONSTRAINT `accounting_cost_center_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_cost_center` ADD CONSTRAINT `accounting_cost_center_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `accounting_cost_center`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accounting_voucher` ADD CONSTRAINT `accounting_voucher_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher` ADD CONSTRAINT `accounting_voucher_financial_year_id_fkey` FOREIGN KEY (`financial_year_id`) REFERENCES `accounting_company_financial_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher` ADD CONSTRAINT `accounting_voucher_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher` ADD CONSTRAINT `accounting_voucher_voucher_type_id_fkey` FOREIGN KEY (`voucher_type_id`) REFERENCES `accounting_voucher_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher` ADD CONSTRAINT `accounting_voucher_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `core_currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher_line` ADD CONSTRAINT `accounting_voucher_line_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `accounting_voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher_line` ADD CONSTRAINT `accounting_voucher_line_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `accounting_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_cost_center_allocation` ADD CONSTRAINT `accounting_cost_center_allocation_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_cost_center_allocation` ADD CONSTRAINT `accounting_cost_center_allocation_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `accounting_voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_cost_center_allocation` ADD CONSTRAINT `accounting_cost_center_allocation_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `accounting_cost_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_cost_center_allocation` ADD CONSTRAINT `accounting_cost_center_allocation_voucher_line_id_fkey` FOREIGN KEY (`voucher_line_id`) REFERENCES `accounting_voucher_line`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_document` ADD CONSTRAINT `accounting_bill_document_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_document` ADD CONSTRAINT `accounting_bill_document_financial_year_id_fkey` FOREIGN KEY (`financial_year_id`) REFERENCES `accounting_company_financial_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_document` ADD CONSTRAINT `accounting_bill_document_party_ledger_id_fkey` FOREIGN KEY (`party_ledger_id`) REFERENCES `accounting_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_document` ADD CONSTRAINT `accounting_bill_document_source_voucher_id_fkey` FOREIGN KEY (`source_voucher_id`) REFERENCES `accounting_voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_allocation` ADD CONSTRAINT `accounting_bill_allocation_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_allocation` ADD CONSTRAINT `accounting_bill_allocation_financial_year_id_fkey` FOREIGN KEY (`financial_year_id`) REFERENCES `accounting_company_financial_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_allocation` ADD CONSTRAINT `accounting_bill_allocation_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `accounting_voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_allocation` ADD CONSTRAINT `accounting_bill_allocation_voucher_line_id_fkey` FOREIGN KEY (`voucher_line_id`) REFERENCES `accounting_voucher_line`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_allocation` ADD CONSTRAINT `accounting_bill_allocation_party_ledger_id_fkey` FOREIGN KEY (`party_ledger_id`) REFERENCES `accounting_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bill_allocation` ADD CONSTRAINT `accounting_bill_allocation_bill_document_id_fkey` FOREIGN KEY (`bill_document_id`) REFERENCES `accounting_bill_document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_integration_config` ADD CONSTRAINT `accounting_integration_config_voucher_type_id_fkey` FOREIGN KEY (`voucher_type_id`) REFERENCES `accounting_voucher_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_integration_config_details` ADD CONSTRAINT `accounting_integration_config_details_accounting_integratio_fkey` FOREIGN KEY (`accounting_integration_config_id`) REFERENCES `accounting_integration_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_integration_config_details` ADD CONSTRAINT `accounting_integration_config_details_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `accounting_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_client_ledger_mapping` ADD CONSTRAINT `accounting_client_ledger_mapping_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `accounting_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_batch_job_details` ADD CONSTRAINT `accounting_batch_job_details_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `accounting_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_voucher_entry_excel` ADD CONSTRAINT `accounting_voucher_entry_excel_batch_job_id_fkey` FOREIGN KEY (`batch_job_id`) REFERENCES `accounting_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_statement` ADD CONSTRAINT `accounting_bank_statement_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `accounting_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_statement` ADD CONSTRAINT `accounting_bank_statement_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `accounting_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_statement` ADD CONSTRAINT `accounting_bank_statement_financial_year_id_fkey` FOREIGN KEY (`financial_year_id`) REFERENCES `accounting_company_financial_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_statement_row` ADD CONSTRAINT `accounting_bank_statement_row_bank_statement_id_fkey` FOREIGN KEY (`bank_statement_id`) REFERENCES `accounting_bank_statement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_reconciliation_match` ADD CONSTRAINT `accounting_bank_reconciliation_match_voucher_line_id_fkey` FOREIGN KEY (`voucher_line_id`) REFERENCES `accounting_voucher_line`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_reconciliation_match` ADD CONSTRAINT `accounting_bank_reconciliation_match_bank_statement_row_id_fkey` FOREIGN KEY (`bank_statement_row_id`) REFERENCES `accounting_bank_statement_row`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_bank_statement_excel` ADD CONSTRAINT `accounting_bank_statement_excel_batch_job_id_fkey` FOREIGN KEY (`batch_job_id`) REFERENCES `accounting_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sch_collection_center` ADD CONSTRAINT `sch_collection_center_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `accounting_company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer` ADD CONSTRAINT `stock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_transfer` ADD CONSTRAINT `inv_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `tock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `inv_purchase_order` DROP COLUMN `verified_at_1`,
    DROP COLUMN `verified_at_2`,
    DROP COLUMN `verified_by_1`,
    DROP COLUMN `verified_by_2`,
    ADD COLUMN `last_verified_at` DATETIME(3) NULL,
    ADD COLUMN `last_verified_by` INTEGER NULL;

-- AlterTable
ALTER TABLE `inv_in_transit_stock_audit` MODIFY `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT', 'BRANCH_REQUISITION') NOT NULL;

-- AlterTable
ALTER TABLE `inv_item_stock_audit` MODIFY `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT', 'BRANCH_REQUISITION') NOT NULL;

-- AlterTable
ALTER TABLE `inv_uin_config` MODIFY `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'ITEM', 'BATCH_JOB', 'CN', 'STAJ', 'ST_TR', 'BRN') NOT NULL;

-- CreateTable
CREATE TABLE `inv_branch_requisition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sr_number` VARCHAR(191) NOT NULL,
    `req_from` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `branch_req_status` ENUM('Draft', 'Pending', 'Partially_Approved', 'Approved', 'Reject') NOT NULL DEFAULT 'Pending',
    `branch_req_ack_status` ENUM('ACK_PENDING', 'ACK_PARTIALLY_RECEIVED', 'ACK_RECEIVED') NOT NULL DEFAULT 'ACK_PENDING',
    `branch_req_details` TEXT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `reject_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `reject_at` DATETIME(3) NULL,
    `acknowledgement_by` INTEGER NULL,
    `acknowledgement_at` DATETIME(3) NULL,

    INDEX `branch_requisition_requisition_from_idx`(`req_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_branch_requisition_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_requisition_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `req_quantity` DOUBLE NOT NULL,
    `assigned_quantity` DOUBLE NOT NULL DEFAULT 0,
    `acknowledged_quantity` DOUBLE NOT NULL DEFAULT 0,
    `comment` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `branch_requisition_id_idx`(`branch_requisition_id`),
    INDEX `item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_branch_item_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_requisition_id` INTEGER NOT NULL,
    `branch_requisition_details_id` INTEGER NOT NULL,
    `item_stock_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `assign_qty` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NULL,
    `acknowledged_qty` INTEGER NOT NULL DEFAULT 0,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `ack_cc_id` INTEGER NULL,
    `cc_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `branch_requisition_id_idx`(`branch_requisition_id`),
    INDEX `branch_requisition_details_id_idx`(`branch_requisition_details_id`),
    INDEX `item_id_idx`(`item_id`),
    INDEX `item_stock_id_idx`(`item_stock_id`),
    INDEX `warehouse_id_idx`(`cc_id`),
    INDEX `branch_id_idx`(`ack_cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/*
  Warnings:

  - You are about to drop the column `sr_number` on the `inv_branch_requisition` table. All the data in the column will be lost.
  - Added the required column `br_number` to the `inv_branch_requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_id` to the `inv_branch_requisition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inv_branch_requisition` DROP COLUMN `sr_number`,
    ADD COLUMN `br_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `branch_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `branch_requisition_branch_id_idx` ON `inv_branch_requisition`(`branch_id`);

-- CreateIndex
CREATE INDEX `branch_requisition_cc_id_idx` ON `inv_branch_requisition`(`cc_id`);

-- AlterTable
ALTER TABLE `inv_settings` ADD COLUMN `is_accounting` BOOLEAN NOT NULL DEFAULT true;



-- AlterTable
ALTER TABLE `inv_in_transit_stock_audit` MODIFY `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT', 'BRANCH_REQUISITION', 'STORE_REQUISITION_RETURN') NOT NULL;

-- AlterTable
ALTER TABLE `inv_item_stock_audit` MODIFY `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT', 'BRANCH_REQUISITION', 'STORE_REQUISITION_RETURN') NOT NULL;

-- AlterTable
ALTER TABLE `inv_uin_config` MODIFY `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'ITEM', 'BATCH_JOB', 'CN', 'STAJ', 'ST_TR', 'BRN', 'SRR') NOT NULL;

-- CreateTable
CREATE TABLE `inv_store_requisition_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srr_number` VARCHAR(191) NOT NULL,
    `store_requisition_id` INTEGER NOT NULL,
    `req_from` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `return_status` ENUM('Draft', 'Pending', 'Partially_Approved', 'Approved', 'Reject') NOT NULL DEFAULT 'Pending',
    `ack_status` ENUM('ACK_PENDING', 'ACK_PARTIALLY_RECEIVED', 'ACK_RECEIVED') NOT NULL DEFAULT 'ACK_PENDING',
    `return_reason` TEXT NULL,
    `return_details` TEXT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `reject_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `reject_at` DATETIME(3) NULL,
    `acknowledgement_by` INTEGER NULL,
    `acknowledgement_at` DATETIME(3) NULL,

    INDEX `inv_srr_store_requisition_id_idx`(`store_requisition_id`),
    INDEX `inv_srr_requisition_from_idx`(`req_from`),
    INDEX `inv_srr_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_store_requisition_return_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_return_id` INTEGER NOT NULL,
    `store_requisition_details_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `requested_return_qty` DOUBLE NOT NULL,
    `acknowledged_return_qty` DOUBLE NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `inv_srrd_store_requisition_return_id_idx`(`store_requisition_return_id`),
    INDEX `inv_srrd_store_requisition_details_id_idx`(`store_requisition_details_id`),
    INDEX `inv_srrd_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_requisition_return_item_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_return_details_id` INTEGER NOT NULL,
    `requisition_item_details_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `return_qty` INTEGER NOT NULL,
    `acknowledged_qty` INTEGER NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NULL,
    `comment` TEXT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `req_from` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `inv_rrid_store_requisition_return_details_id_idx`(`store_requisition_return_details_id`),
    INDEX `inv_rrid_requisition_item_details_id_idx`(`requisition_item_details_id`),
    INDEX `inv_rrid_item_id_idx`(`item_id`),
    INDEX `inv_rrid_req_from_idx`(`req_from`),
    INDEX `inv_rrid_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `inv_requisition_item_details` ADD COLUMN `returned_qty` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `inv_branch_requisition_details` ADD COLUMN `returned_quantity` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `inv_in_transit_stock_audit` MODIFY `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT', 'BRANCH_REQUISITION', 'STORE_REQUISITION_RETURN', 'BRANCH_REQUISITION_RETURN') NOT NULL;

-- AlterTable
ALTER TABLE `inv_item_stock_audit` MODIFY `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT', 'BRANCH_REQUISITION', 'STORE_REQUISITION_RETURN', 'BRANCH_REQUISITION_RETURN') NOT NULL;

-- AlterTable
ALTER TABLE `inv_uin_config` MODIFY `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'ITEM', 'BATCH_JOB', 'CN', 'STAJ', 'ST_TR', 'BRN', 'SRR', 'BRR') NOT NULL;

-- CreateTable
CREATE TABLE `inv_branch_requisition_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brr_number` VARCHAR(191) NOT NULL,
    `branch_requisition_id` INTEGER NOT NULL,
    `req_from` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `return_status` ENUM('Draft', 'Pending', 'Partially_Approved', 'Approved', 'Reject') NOT NULL DEFAULT 'Pending',
    `ack_status` ENUM('ACK_PENDING', 'ACK_PARTIALLY_RECEIVED', 'ACK_RECEIVED') NOT NULL DEFAULT 'ACK_PENDING',
    `return_reason` TEXT NULL,
    `return_details` TEXT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `reject_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `reject_at` DATETIME(3) NULL,
    `acknowledgement_by` INTEGER NULL,
    `acknowledgement_at` DATETIME(3) NULL,

    INDEX `brr_branch_requisition_id_idx`(`branch_requisition_id`),
    INDEX `brr_requisition_from_idx`(`req_from`),
    INDEX `brr_cc_id_idx`(`cc_id`),
    INDEX `brr_branch_id_idx`(`branch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_branch_requisition_return_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_requisition_return_id` INTEGER NOT NULL,
    `branch_requisition_details_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `requested_return_qty` DOUBLE NOT NULL,
    `acknowledged_return_qty` DOUBLE NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `brrd_branch_requisition_return_id_idx`(`branch_requisition_return_id`),
    INDEX `brrd_branch_requisition_details_id_idx`(`branch_requisition_details_id`),
    INDEX `brrd_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_branch_return_item_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_requisition_return_details_id` INTEGER NOT NULL,
    `branch_item_details_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `return_qty` INTEGER NOT NULL,
    `acknowledged_qty` INTEGER NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NULL,
    `comment` TEXT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `branch_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `brid_branch_requisition_return_details_id_idx`(`branch_requisition_return_details_id`),
    INDEX `brid_branch_item_details_id_idx`(`branch_item_details_id`),
    INDEX `brid_item_id_idx`(`item_id`),
    INDEX `brid_branch_id_idx`(`branch_id`),
    INDEX `brid_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `inv_branch_item_details` ADD COLUMN `returned_qty` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `inv_store_requisition_details` ADD COLUMN `returned_quantity` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `core_mono_repo_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO core_mono_repo_modules
(module, is_active, created_at, updated_at, created_by, updated_by)
VALUES('CORE', 1, '2026-05-19 11:29:05.914', '2026-05-19 11:29:47.088', NULL, NULL);

-- AlterTable
ALTER TABLE `accounting_audit_config` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `accounting_common_audit` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `core_audit_config` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `core_common_audit` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `core_event_delivery` MODIFY `service` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `core_mono_repo_modules` ADD COLUMN `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `core_pdf_template` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `core_service_event` MODIFY `service` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL DEFAULT 'OPD';

-- AlterTable
ALTER TABLE `nopd_payment_transactions` MODIFY `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `source` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL;

-- AlterTable
ALTER TABLE `pathology_b2b_invoice_amount_summary` MODIFY `service_type` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY', 'FIXUJI', 'STARTER', 'AMS', 'ACCOUNTING') NOT NULL DEFAULT 'PATHOLOGY';


-- AlterTable
ALTER TABLE `core_mono_repo_modules` ADD COLUMN `deleted_at` DATETIME(3) NOT NULL,
    ADD COLUMN `deleted_by` INTEGER NULL;


-- DropIndex
DROP INDEX `in_transit_stock_from_id_idx` ON `inv_in_transit_stock`;

-- DropIndex
DROP INDEX `in_transit_stock_to_id_idx` ON `inv_in_transit_stock`;

-- AlterTable
ALTER TABLE `inv_in_transit_stock` DROP COLUMN `from_id`,
    DROP COLUMN `to_Id`,
    ADD COLUMN `from_cc_id` INTEGER NULL,
    ADD COLUMN `to_cc_id` INTEGER NULL,
    ADD COLUMN `user_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `inv_in_transit_stock_from_id_idx` ON `inv_in_transit_stock`(`from_cc_id`);

-- CreateIndex
CREATE INDEX `inv_in_transit_stock_to_id_idx` ON `inv_in_transit_stock`(`to_cc_id`);

-- CreateIndex
CREATE INDEX `inv_in_transit_stock_user_id_idx` ON `inv_in_transit_stock`(`user_id`);

-- RedefineIndex
CREATE INDEX `inv_in_transit_stock_item_id_idx` ON `inv_in_transit_stock`(`item_id`);
DROP INDEX `in_transit_stock_item_id_idx` ON `inv_in_transit_stock`;

-- CreateTable
CREATE TABLE `inv_item_master_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `row_no` INTEGER NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `item_code` VARCHAR(191) NULL,
    `item_category_id` INTEGER NOT NULL,
    `storage_id` INTEGER NULL,
    `unit_id` INTEGER NOT NULL,
    `base_price` DOUBLE NULL,
    `re_order_level` INTEGER NULL,
    `item_description` VARCHAR(191) NULL,
    `is_batch_number` BOOLEAN NOT NULL DEFAULT false,
    `is_expire_date` BOOLEAN NOT NULL DEFAULT false,
    `is_returnable` BOOLEAN NOT NULL DEFAULT false,
    `front_image` VARCHAR(191) NULL,
    `back_image` VARCHAR(191) NULL,
    `left_side_image` VARCHAR(191) NULL,
    `right_side_image` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `inv_tax_identification_details` ADD COLUMN `tax_identification_number` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inv_purchase_order` DROP COLUMN `currency`,
    ADD COLUMN `conversion_rate` DECIMAL(18, 5) NULL,
    ADD COLUMN `currency_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `purchase_order_currency_id_idx` ON `inv_purchase_order`(`currency_id`);