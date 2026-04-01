/*
  Warnings:

  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `bookings`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `core_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_email` BOOLEAN NOT NULL DEFAULT true,
    `is_sms` BOOLEAN NOT NULL DEFAULT false,
    `is_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `expiry_in_month` INTEGER NOT NULL,
    `county_code` VARCHAR(191) NULL,
    `slow_moving_time_in_month` INTEGER NULL,
    `batch_size` INTEGER NOT NULL DEFAULT 100,
    `default_precision` INTEGER NOT NULL DEFAULT 2,
    `grn_calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `sell_calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `grn_rounded_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `sell_rounded_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'ROUND',
    `sell_final_round_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'SPECIAL_ROUND',
    `grn_final_round_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
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
CREATE TABLE `core_dynamic_short_code` (
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

    UNIQUE INDEX `core_dynamic_short_code_short_code_key`(`short_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_uin_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'GATE_PASS', 'SELL', 'SELL_RETURN', 'ITEM', 'STR', 'BATCH_JOB', 'TEMP_CODE') NOT NULL,
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
CREATE TABLE `countries` (
    `num_code` INTEGER NOT NULL AUTO_INCREMENT,
    `alpha_2_code` VARCHAR(191) NULL,
    `alpha_3_code` VARCHAR(191) NULL,
    `en_short_name` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,

    PRIMARY KEY (`num_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_state` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `country_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `state_country_id_idx`(`country_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_city` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `state_id` INTEGER NOT NULL,
    `country_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `city_state_id_idx`(`state_id`),
    INDEX `city_countryId_id_idx`(`country_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_country_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `country_code` VARCHAR(191) NOT NULL,
    `country_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `core_country_code_country_code_key`(`country_code`),
    UNIQUE INDEX `core_country_code_country_id_key`(`country_id`),
    INDEX `core_country_code_country_id_idx`(`country_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_collection_center` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `collection_center_id` INTEGER NOT NULL,
    `is_main_lab` ENUM('N', 'Y') NOT NULL,
    `added_on` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_on` DATETIME(0) NOT NULL,
    `is_active` ENUM('0', '1') NOT NULL,

    INDEX `staff_collection_center_collection_center_id_idx`(`collection_center_id`),
    INDEX `staff_collection_center_staff_id_idx`(`staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sch_collection_center` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `col_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `lang_id` INTEGER NOT NULL,
    `date_format` VARCHAR(100) NOT NULL,
    `time_format` VARCHAR(100) NOT NULL,
    `currency` VARCHAR(100) NOT NULL,
    `currency_symbol` VARCHAR(50) NOT NULL,
    `timezone` VARCHAR(50) NOT NULL,
    `test_prefix` VARCHAR(50) NOT NULL,
    `barcode_prefix` VARCHAR(50) NOT NULL,
    `invoice_prefix` VARCHAR(50) NOT NULL,
    `disabled_on` DATETIME(3) NULL,
    `disabled_by` VARCHAR(100) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `collection_abbreviation_name` VARCHAR(255) NULL,
    `is_sub_organization` ENUM('0', '1') NOT NULL DEFAULT '0',
    `dise_code` VARCHAR(100) NOT NULL,
    `connection_code` VARCHAR(100) NOT NULL,
    `barcode_printer_name` VARCHAR(255) NULL,
    `is_active` ENUM('0', '1') NOT NULL DEFAULT '1',
    `pms_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH',
    `inv_cc_type` ENUM('BRANCH', 'WAREHOUSE') NOT NULL DEFAULT 'BRANCH',

    UNIQUE INDEX `sch_collection_center_connection_code_key`(`connection_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` VARCHAR(200) NOT NULL,
    `department` VARCHAR(100) NULL,
    `designation` VARCHAR(100) NOT NULL,
    `qualification` VARCHAR(500) NULL,
    `work_exp` VARCHAR(200) NULL,
    `specialization` VARCHAR(200) NULL,
    `name` VARCHAR(200) NOT NULL,
    `surname` VARCHAR(200) NULL,
    `father_name` VARCHAR(200) NULL,
    `mother_name` VARCHAR(200) NULL,
    `contact_no` VARCHAR(200) NULL,
    `emergency_contact_name` VARCHAR(200) NULL,
    `emergency_contact_no` VARCHAR(200) NULL,
    `email` VARCHAR(200) NOT NULL,
    `dob` DATE NULL,
    `marital_status` VARCHAR(100) NULL,
    `date_of_joining` DATE NULL,
    `local_address` VARCHAR(300) NULL,
    `permanent_address` VARCHAR(200) NULL,
    `note` VARCHAR(200) NULL,
    `image` VARCHAR(200) NULL,
    `digital_sign` VARCHAR(255) NULL,
    `password` VARCHAR(250) NOT NULL,
    `gender` VARCHAR(50) NULL,
    `blood_group` VARCHAR(100) NULL,
    `account_title` VARCHAR(200) NULL,
    `bank_account_no` VARCHAR(200) NULL,
    `bank_name` VARCHAR(200) NULL,
    `ifsc_code` VARCHAR(200) NULL,
    `bank_branch` VARCHAR(100) NULL,
    `payscale` VARCHAR(200) NULL,
    `basic_salary` VARCHAR(200) NULL,
    `epf_no` VARCHAR(200) NULL,
    `contract_type` VARCHAR(100) NULL,
    `shift` VARCHAR(100) NULL,
    `location` VARCHAR(100) NULL,
    `facebook` VARCHAR(200) NULL,
    `twitter` VARCHAR(200) NULL,
    `linkedin` VARCHAR(200) NULL,
    `instagram` VARCHAR(200) NULL,
    `resume` VARCHAR(200) NULL,
    `joining_letter` VARCHAR(200) NULL,
    `resignation_letter` VARCHAR(200) NULL,
    `other_document_name` VARCHAR(200) NULL,
    `other_document_file` VARCHAR(200) NULL,
    `user_id` INTEGER NULL,
    `is_active` INTEGER NOT NULL,
    `is_eligible_discount` ENUM('0', '1') NULL,
    `is_eligible_consumption` ENUM('0', '1') NULL,
    `verification_code` VARCHAR(100) NULL,
    `no_of_children` INTEGER NULL,
    `age` INTEGER NULL,
    `staff_place_of_birth` VARCHAR(100) NULL,
    `staff_nationality` VARCHAR(100) NULL,
    `staff_hometown` VARCHAR(255) NULL,
    `staff_religion` VARCHAR(100) NULL,
    `denomination` VARCHAR(100) NULL,
    `profilePhoto` VARCHAR(255) NULL,
    `hourse_of_works` VARCHAR(100) NULL,
    `holiday_entitlement` VARCHAR(255) NULL,
    `national_health_insurance_no` VARCHAR(255) NULL,
    `ssnit_no` VARCHAR(255) NULL,
    `other_scheme` VARCHAR(255) NULL,
    `spouse_name` VARCHAR(255) NULL,
    `spouse_sex` VARCHAR(100) NULL,
    `spouse_nationality` VARCHAR(100) NULL,
    `spouse_phone` VARCHAR(20) NULL,
    `spouse_address` TEXT NULL,
    `is_disc_allowed` ENUM('0', '1') NOT NULL DEFAULT '0',
    `doctor_registration_no` VARCHAR(100) NULL,
    `loan_amount` DECIMAL(25, 2) NULL DEFAULT 0.00,
    `tenure` INTEGER NULL DEFAULT 0,
    `interest_percentage` DECIMAL(25, 2) NULL DEFAULT 0.00,
    `total_interest_amount` DECIMAL(25, 2) NULL DEFAULT 0.00,
    `monthly_installment` DECIMAL(25, 2) NULL DEFAULT 0.00,
    `effective_from` VARCHAR(50) NULL,
    `attendance_payroll_eligibility` ENUM('0', '1') NULL DEFAULT '0',
    `incentive_eligibility` ENUM('0', '1') NULL DEFAULT '0',
    `is_clinical_consultant` ENUM('0', '1') NULL DEFAULT '0',
    `reporting_head` INTEGER NULL,
    `remember_token` VARCHAR(255) NULL,
    `opd_department_id` INTEGER NULL,
    `prefix_id` INTEGER NULL,
    `license_name` VARCHAR(100) NULL,
    `is_opd_consultant` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `employee_id`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_staff_employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `designation_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `core_staff_employee_staff_id_key`(`staff_id`),
    INDEX `StaffEmployee_designationId_idx`(`designation_id`),
    INDEX `StaffEmployee_departmentId_idx`(`department_id`),
    INDEX `StaffEmployee_staffId_idx`(`staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_designation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `designation` VARCHAR(200) NOT NULL,
    `is_active` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_name` VARCHAR(200) NOT NULL,
    `dept_id` VARCHAR(50) NOT NULL,
    `dept_display_text` VARCHAR(100) NOT NULL,
    `dept_sequence` INTEGER NOT NULL,
    `is_sample` ENUM('0', '1') NOT NULL,
    `is_analyte` ENUM('0', '1') NULL,
    `master_dept` INTEGER NOT NULL,
    `tat_data` LONGTEXT NULL,
    `print_in_trs` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `is_active` ENUM('yes', 'no') NOT NULL,
    `designation` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_service_event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL DEFAULT 'OPD',
    `service_domain` ENUM('FIXUJI', 'AV6', 'LEVEL2') NOT NULL DEFAULT 'AV6',
    `allow_email` BOOLEAN NOT NULL DEFAULT false,
    `allow_sms` BOOLEAN NOT NULL DEFAULT false,
    `allow_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `allow_app_notification` BOOLEAN NOT NULL DEFAULT false,
    `allow_web_notification` BOOLEAN NOT NULL DEFAULT false,
    `master_phone` VARCHAR(191) NULL,
    `wp_api_url` VARCHAR(191) NULL,
    `wp_api_key` TEXT NULL,
    `country_code` VARCHAR(191) NULL DEFAULT '+91',
    `wp_language` VARCHAR(191) NULL DEFAULT 'en',
    `wp_callback_data` VARCHAR(191) NULL,
    `sms_api_url` VARCHAR(191) NULL,
    `sms_api_key` TEXT NULL,
    `sms_sender_id` VARCHAR(191) NULL,
    `app_notification_api_url` VARCHAR(191) NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_service_event_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_event_id` INTEGER NOT NULL,
    `event_name` VARCHAR(191) NOT NULL,
    `short_code` VARCHAR(191) NOT NULL,
    `allow_email` BOOLEAN NOT NULL DEFAULT false,
    `allow_sms` BOOLEAN NOT NULL DEFAULT false,
    `allow_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `allow_app_notification` BOOLEAN NOT NULL DEFAULT false,
    `allow_web_notification` BOOLEAN NOT NULL DEFAULT false,
    `attachment_required` ENUM('REQUIRED', 'OPTIONAL', 'NOT_REQUIRED') NOT NULL DEFAULT 'NOT_REQUIRED',
    `notification_type` ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL DEFAULT 'INFO',
    `priority` ENUM('PRIMARY', 'SECONDARY', 'TERTIARY') NOT NULL DEFAULT 'SECONDARY',
    `channel_id` VARCHAR(191) NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `core_service_event_config_service_event_id_event_name_key`(`service_event_id`, `event_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_event_config_key` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `default_value` VARCHAR(191) NOT NULL,
    `event_config_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `event_config_key_event_config_id_idx`(`event_config_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_event_recipient_rule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_config_id` INTEGER NOT NULL,
    `template_type` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'APP_NOTIFICATION', 'WEB_NOTIFICATION') NOT NULL,
    `source_type` ENUM('HARDCODE', 'ROLES', 'STAFFS', 'KEY_VALUE') NOT NULL,
    `config` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    INDEX `core_event_recipient_rule_event_config_id_template_type_idx`(`event_config_id`, `template_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `role_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `source` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL DEFAULT 'INFO',
    `priority` ENUM('PRIMARY', 'SECONDARY', 'TERTIARY') NOT NULL DEFAULT 'SECONDARY',
    `action_type` VARCHAR(100) NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(255) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `notification_level1_id_idx`(`cc_id`),
    INDEX `notification_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_event_delivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `event_name` VARCHAR(191) NOT NULL,
    `event_config_id` INTEGER NOT NULL,
    `service` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL,
    `priority` ENUM('PRIMARY', 'SECONDARY', 'TERTIARY') NULL,
    `payload` JSON NULL,
    `total_count` INTEGER NOT NULL DEFAULT 0,
    `success_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,

    INDEX `event_delivery_event_config_id_idx`(`event_config_id`),
    INDEX `event_delivery_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_event_delivery_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `delivery_id` INTEGER NOT NULL,
    `notification_type` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'APP_NOTIFICATION', 'WEB_NOTIFICATION') NOT NULL,
    `recipient` VARCHAR(255) NULL,
    `message_content` TEXT NULL,
    `third_party_response` JSON NULL,
    `is_sent` BOOLEAN NOT NULL DEFAULT false,
    `sent_at` DATETIME(3) NULL,
    `error` TEXT NULL,
    `external_id` VARCHAR(255) NULL,

    INDEX `core_event_delivery_item_delivery_id_idx`(`delivery_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_code` VARCHAR(191) NOT NULL,
    `template_name` VARCHAR(191) NOT NULL,
    `template_type` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'APP_NOTIFICATION', 'WEB_NOTIFICATION') NOT NULL,
    `url` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `body_html` TEXT NULL,
    `body_text` TEXT NULL,
    `extra` JSON NULL,
    `event_config_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `core_template_template_code_key`(`template_code`),
    INDEX `template_event_config_id_idx`(`event_config_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_audit_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL,
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
CREATE TABLE `core_common_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL,
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
CREATE TABLE `core_pdf_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_name` VARCHAR(191) NOT NULL,
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL,
    `template_type` ENUM('BILL', 'INVOICE', 'REPORT') NOT NULL,
    `body_json` JSON NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `sample_image_url` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `income_head` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `income_category` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `is_active` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `is_deleted` VARCHAR(255) NOT NULL DEFAULT 'no',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `income` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inc_head_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `invoice_no` VARCHAR(200) NOT NULL,
    `date` DATE NULL,
    `amount` DECIMAL(15, 2) NULL,
    `note` TEXT NULL,
    `is_active` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `is_deleted` VARCHAR(255) NOT NULL DEFAULT 'no',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `documents` VARCHAR(255) NULL,
    `cc_id` INTEGER NOT NULL DEFAULT 1,
    `is_master` ENUM('ML', 'CC') NOT NULL DEFAULT 'ML',

    INDEX `income_inc_head_id_idx`(`inc_head_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_head` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exp_category` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `is_active` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `is_deleted` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exp_head_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `invoice_no` VARCHAR(200) NOT NULL,
    `date` DATE NULL,
    `amount` DECIMAL(15, 2) NULL,
    `documents` VARCHAR(255) NULL,
    `note` TEXT NULL,
    `is_active` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `is_deleted` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `cc_id` INTEGER NOT NULL DEFAULT 1,
    `is_master` ENUM('ML', 'CC') NULL DEFAULT 'ML',

    INDEX `expense_expense_head_id_idx`(`exp_head_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_approval_service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_config` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `email_type` VARCHAR(100) NULL,
    `smtp_server` VARCHAR(100) NULL,
    `smtp_port` VARCHAR(100) NULL,
    `smtp_username` VARCHAR(100) NULL,
    `smtp_password` VARCHAR(100) NULL,
    `ssl_tls` VARCHAR(100) NULL,
    `is_active` VARCHAR(10) NOT NULL DEFAULT 'no',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_unique_id` INTEGER NOT NULL,
    `admission_date` VARCHAR(100) NULL,
    `patient_name` VARCHAR(100) NULL,
    `age` VARCHAR(10) NOT NULL,
    `month` VARCHAR(200) NOT NULL,
    `days` VARCHAR(255) NULL,
    `image` VARCHAR(100) NULL,
    `mobileno` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `dob` DATE NULL,
    `gender` VARCHAR(100) NULL,
    `marital_status` VARCHAR(100) NULL,
    `blood_group` VARCHAR(200) NULL,
    `address` TEXT NOT NULL,
    `guardian_name` VARCHAR(100) NULL,
    `guardian_phone` VARCHAR(100) NULL,
    `guardian_address` TEXT NULL,
    `guardian_email` VARCHAR(100) NULL,
    `is_active` VARCHAR(255) NULL DEFAULT 'no',
    `discharged` VARCHAR(100) NULL,
    `patient_type` VARCHAR(200) NOT NULL,
    `credit_limit` VARCHAR(50) NULL,
    `organisation` VARCHAR(100) NULL,
    `known_allergies` VARCHAR(200) NULL,
    `old_patient` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `disable_at` DATETIME(3) NULL,
    `note` VARCHAR(200) NOT NULL,
    `is_ipd` VARCHAR(200) NULL,
    `cc_id` INTEGER NULL,
    `is_master` ENUM('ML', 'CC') NULL,
    `unique_sequence_number` INTEGER NOT NULL,
    `aadhar` VARCHAR(100) NULL,
    `passport` VARCHAR(100) NULL,
    `nationality` VARCHAR(100) NULL,
    `area` VARCHAR(100) NULL,
    `pincode` VARCHAR(100) NULL,
    `height` VARCHAR(100) NULL,
    `weight` VARCHAR(100) NULL,
    `patient_code` VARCHAR(100) NULL,
    `user_login` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `user_relationship` VARCHAR(100) NULL,
    `pid` VARCHAR(100) NULL,
    `local_id` VARCHAR(100) NULL,
    `street` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `pin_code` VARCHAR(10) NULL,
    `country` INTEGER NULL,
    `remarks` VARCHAR(155) NULL,
    `patient_image` VARCHAR(255) NULL,
    `emergency_first_name` VARCHAR(255) NULL,
    `emergency_last_name` VARCHAR(255) NULL,
    `emergency_relation` VARCHAR(255) NULL,
    `emergency_phone_number` VARCHAR(15) NULL,
    `emergency_email` VARCHAR(255) NULL,
    `emergency_marital_status` VARCHAR(50) NULL,
    `emergency_address` TEXT NULL,
    `emergency_state` VARCHAR(100) NULL,
    `emergency_country` VARCHAR(100) NULL,
    `patient_signature` TEXT NULL,
    `patient_occupation` VARCHAR(255) NULL,
    `employee_id` VARCHAR(191) NULL,
    `client_id` INTEGER NULL,

    INDEX `patient_unique_id`(`patient_unique_id`),
    INDEX `note`(`note`),
    INDEX `email`(`email`),
    INDEX `patients_mobileno_patient_name_IDX`(`mobileno`, `patient_name`),
    INDEX `patients_patient_name_IDX`(`patient_name`),
    INDEX `patients_mobileno_IDX`(`mobileno`),
    INDEX `patients_client_id`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patients_insurance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insurer_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `insurance_type` ENUM('primary', 'secondary', 'tertiary') NOT NULL,
    `insurance_plan` VARCHAR(100) NULL,
    `policy_number` VARCHAR(100) NULL,
    `relationship` VARCHAR(50) NULL,
    `issue_date` DATE NULL,
    `expire_date` DATE NULL,
    `card_front_image` VARCHAR(255) NULL,
    `card_back_image` VARCHAR(255) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `patient_insurance_insurer_id_idx`(`insurer_id`),
    INDEX `patient_insurance_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_code` VARCHAR(50) NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `contact_no` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `business_type_1` CHAR(10) NULL,
    `customer_plan_1` CHAR(100) NULL,
    `business_type` ENUM('b2c', 'b2b') NOT NULL DEFAULT 'b2c',
    `customer_plan` ENUM('prepaid', 'postpaid') NOT NULL DEFAULT 'postpaid',
    `customer_type` INTEGER NULL,
    `is_cash_client` CHAR(3) NULL,
    `credit_amt` DECIMAL(11, 2) NULL,
    `credit_limit` VARCHAR(500) NULL,
    `as_adv` DECIMAL(11, 2) NULL,
    `additional_credit_limit` DECIMAL(10, 2) NULL,
    `credit_period_in_days` VARCHAR(10) NULL,
    `min_invoice_payment` CHAR(10) NULL,
    `invoice_ageing` CHAR(10) NULL,
    `created_user` CHAR(100) NULL,
    `created_date` DATETIME(3) NULL,
    `customer_active_from` DATETIME(3) NULL,
    `customer_status` CHAR(10) NULL,
    `status` ENUM('active', 'block', 'suspend', 'deactivate') NOT NULL DEFAULT 'active',
    `bill_email` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `bill_sms` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `report_email` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `report_sms` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `report_with_header` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `logo_image` VARCHAR(255) NULL DEFAULT 'uploads/patient_images/no_image.png',
    `parent_client_name` VARCHAR(100) NULL,
    `adhaar` VARCHAR(100) NULL,
    `pan` VARCHAR(100) NULL,
    `gst_no` VARCHAR(100) NULL,
    `view_dashboard` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `view_registration` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `view_service_rate` CHAR(3) NULL,
    `cc_id` INTEGER NULL,
    `is_master` ENUM('ML', 'CC') NULL,
    `report_max_limit_to_print_download` INTEGER NULL,
    `report_allow_print_download` ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    `custome_customer_code` VARCHAR(255) NOT NULL,
    `sap_code` VARCHAR(100) NULL,
    `prepaid_threshold_amount` DECIMAL(10, 0) NOT NULL,
    `prepaid_account_balance` DECIMAL(10, 0) NOT NULL,
    `security_deposit_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `additional_credit_period_in_days` INTEGER NULL,
    `status_change_remark` VARCHAR(255) NULL,
    `bill_print_email_gross_net` ENUM('net', 'gross') NOT NULL DEFAULT 'gross',
    `bill_print` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `bill_address` LONGTEXT NULL,
    `shift_address` LONGTEXT NULL,
    `uploaded_documents` LONGTEXT NULL,
    `portal_access_config` LONGTEXT NULL,
    `print_config` LONGTEXT NULL,
    `notification_config` LONGTEXT NULL,
    `client_head` INTEGER NULL,
    `odc_collection_center_key` VARCHAR(100) NULL,
    `odc_organization_key` VARCHAR(100) NULL,
    `odc_initial` VARCHAR(100) NULL,
    `odc_code` VARCHAR(100) NULL,
    `attachments` LONGTEXT NULL,
    `parent_client_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurer_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_code` VARCHAR(255) NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `contact_no` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `contact_person_name` VARCHAR(255) NOT NULL,
    `contact_person_phone` VARCHAR(255) NOT NULL,
    `contact_person_email` VARCHAR(255) NOT NULL,
    `created_user` CHAR(100) NULL,
    `created_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customer_active_from` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customer_status` CHAR(10) NULL,
    `status` ENUM('active', 'block', 'suspend', 'deactivate') NOT NULL DEFAULT 'active',
    `logo_image` VARCHAR(255) NULL DEFAULT 'uploads/patient_images/no_image.png',
    `adhaar` VARCHAR(100) NULL,
    `pan` VARCHAR(100) NULL,
    `gst_no` VARCHAR(100) NULL,
    `cc_id` INTEGER NULL DEFAULT 1,
    `is_master` ENUM('ML', 'CC') NULL DEFAULT 'ML',
    `sap_code` VARCHAR(100) NULL,
    `status_change_remark` VARCHAR(255) NULL,
    `bill_address` LONGTEXT NULL,
    `shift_address` LONGTEXT NULL,
    `portal_access_config` LONGTEXT NULL,
    `print_config` LONGTEXT NULL,
    `notification_config` LONGTEXT NULL,
    `attachments` LONGTEXT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `payment_mode` ENUM('amount_in_cash', 'co_payment') NULL DEFAULT 'amount_in_cash',
    `insurance_type` ENUM('corporate', 'national', 'others') NULL DEFAULT 'corporate',
    `pathology_payment_type` ENUM('percentage', 'amount') NULL DEFAULT 'percentage',
    `opd_payment_type` ENUM('percentage', 'amount') NULL DEFAULT 'percentage',
    `pharmacy_payment_type` ENUM('percentage', 'amount') NULL DEFAULT 'percentage',
    `opd_payment_value` DECIMAL(65, 30) NULL DEFAULT 0.00,
    `pathology_payment_value` DECIMAL(65, 30) NULL DEFAULT 0.00,
    `pharmacy_payment_value` DECIMAL(65, 30) NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurer_business_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insurer_id` INTEGER NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `is_default` CHAR(3) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `insurer_business_mapping_insurer_id_idx`(`insurer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_n_bank_head` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `bank_no` BIGINT NULL,
    `head_code` INTEGER NOT NULL,
    `status` ENUM('0', '1') NOT NULL DEFAULT '1',
    `card` ENUM('0', '1') NOT NULL,
    `cheque` ENUM('0', '1') NOT NULL,
    `momo` ENUM('0', '1') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobile_money_methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `bank_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_dynamic_short_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(191) NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `is_dto` BOOLEAN NOT NULL DEFAULT false,
    `is_cacheable` BOOLEAN NOT NULL DEFAULT false,
    `is_drop_down` BOOLEAN NOT NULL DEFAULT false,
    `permission` VARCHAR(191) NULL,
    `config` JSON NULL,
    `is_single_dto` BOOLEAN NOT NULL DEFAULT true,
    `where_clause` JSON NULL,
    `select_clause` JSON NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inv_dynamic_short_code_short_code_key`(`short_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_email` BOOLEAN NOT NULL DEFAULT true,
    `is_sms` BOOLEAN NOT NULL DEFAULT false,
    `is_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `expiry_in_month` INTEGER NOT NULL,
    `county_code` VARCHAR(191) NULL,
    `batch_size` INTEGER NOT NULL DEFAULT 100,
    `default_precision` INTEGER NOT NULL DEFAULT 2,
    `grn_calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `grn_rounded_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `grn_final_round_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `warehouse_mode` BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE `inv_uin_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'ITEM', 'BATCH_JOB', 'CN', 'STAJ') NOT NULL,
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
CREATE TABLE `inv_item_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_auto_consumption` BOOLEAN NOT NULL DEFAULT false,
    `is_lock` BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE `inv_item_store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `item_store_name` VARCHAR(191) NOT NULL,
    `item_stock_code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_lock` BOOLEAN NOT NULL DEFAULT false,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_cc_id`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_unit_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `packaging_type_name` VARCHAR(191) NOT NULL,
    `packaging_size` VARCHAR(191) NOT NULL,
    `default_value` INTEGER NULL,
    `default_unit` ENUM('PACK', 'BOX', 'LITER', 'ML') NULL,
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
CREATE TABLE `inv_tax_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NOT NULL,
    `billTo` VARCHAR(191) NULL,
    `shipTo` VARCHAR(191) NULL,
    `branch_details_id` INTEGER NOT NULL,
    `vendor_type` ENUM('LOCAL', 'EXPORTED') NULL,
    `sales_person` VARCHAR(191) NULL,
    `sales_person_phone` VARCHAR(191) NULL,
    `sales_person_email` VARCHAR(191) NULL,
    `proprietary_person_name` VARCHAR(191) NULL,
    `proprietary_person_phone` VARCHAR(191) NULL,
    `proprietary_person_email` VARCHAR(191) NULL,
    `tax_details_id` INTEGER NULL,
    `terms_and_conditions` VARCHAR(191) NULL,
    `stock_shipment_details` VARCHAR(191) NULL,
    `contact_person_name` VARCHAR(191) NULL,
    `contact_person_phone` VARCHAR(191) NULL,
    `contact_person_email` VARCHAR(191) NULL,
    `is_po_whatsapp` BOOLEAN NULL DEFAULT false,
    `is_po_email` BOOLEAN NULL DEFAULT false,
    `is_grn_whatsapp` BOOLEAN NULL DEFAULT false,
    `is_grn_email` BOOLEAN NULL DEFAULT false,
    `is_return_whatsapp` BOOLEAN NULL DEFAULT false,
    `is_return_email` BOOLEAN NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `is_lock` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_tax_details_id`(`tax_details_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_tax_identification_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_identification_name` VARCHAR(191) NOT NULL,
    `tax_identification_value` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `itemSupplierId` INTEGER NULL,

    INDEX `idx_item_supplier_id`(`itemSupplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_bank_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_no` INTEGER NOT NULL,
    `account_holder_name` VARCHAR(191) NULL,
    `type_of_account` VARCHAR(191) NULL,
    `ifsc_code` VARCHAR(191) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `bank_address` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `itemSupplierId` INTEGER NULL,

    INDEX `idx_item_supplier_id`(`itemSupplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_purchase_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_number` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `store_id` INTEGER NULL,
    `cc_id` INTEGER NOT NULL,
    `grand_total` DOUBLE NOT NULL,
    `status` ENUM('SENT_FOR_APPROVAL', 'APPROVED', 'REJECTED', 'DRAFT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'PARTIALLY_APPROVED') NOT NULL DEFAULT 'SENT_FOR_APPROVAL',
    `notes` TEXT NULL,
    `currency` VARCHAR(191) NULL,
    `payment_terms` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `verified_by_1` INTEGER NULL,
    `verified_by_2` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `verified_at_1` DATETIME(3) NULL,
    `verified_at_2` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `purchase_order_supplier_id_idx`(`supplier_id`),
    INDEX `purchase_order_store_id_idx`(`store_id`),
    INDEX `purchase_order_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_purchase_order_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `purchased_price` DOUBLE NOT NULL,
    `packing_qty` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL,
    `received_qty` DOUBLE NOT NULL DEFAULT 0,
    `total_amount` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `purchase_order_details_item_id_idx`(`item_id`),
    INDEX `purchase_order_details_purchase_id_idx`(`purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item` VARCHAR(191) NOT NULL,
    `item_code` VARCHAR(191) NULL,
    `item_category_id` INTEGER NOT NULL,
    `storage_id` INTEGER NULL,
    `unit_id` INTEGER NOT NULL,
    `base_price` DOUBLE NULL,
    `re_order_level` INTEGER NULL,
    `tax_details_id` INTEGER NULL,
    `item_description` VARCHAR(191) NULL,
    `is_batch_number` BOOLEAN NOT NULL DEFAULT false,
    `is_expire_date` BOOLEAN NOT NULL DEFAULT false,
    `is_returnable` BOOLEAN NOT NULL DEFAULT false,
    `front_image` VARCHAR(191) NULL,
    `back_image` VARCHAR(191) NULL,
    `left_side_image` VARCHAR(191) NULL,
    `right_side_image` VARCHAR(191) NULL,
    `is_lock` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_item_category_id`(`item_category_id`),
    INDEX `idx_unit_id`(`unit_id`),
    INDEX `idx_tax_details_id`(`tax_details_id`),
    INDEX `idx_storage_id`(`storage_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_supplier_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `purchase_price` DOUBLE NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `is_lock` BOOLEAN NULL DEFAULT false,
    `entry_on` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valid_upto` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_item_id`(`item_id`),
    INDEX `idx_supplier_id`(`supplier_id`),
    INDEX `idx_cc_id`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_branch` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gst_n` VARCHAR(191) NOT NULL,
    `tinNo` VARCHAR(191) NOT NULL,
    `business_subline` VARCHAR(191) NULL,
    `pharmacist_name` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NULL,
    `pin_code` INTEGER NULL,
    `latitude_longitude` VARCHAR(191) NULL,
    `is_main` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_branch_id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_warehouse` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `vat_no` VARCHAR(191) NOT NULL,
    `tin_no` VARCHAR(191) NOT NULL,
    `business_subline_name` VARCHAR(191) NULL,
    `contact_person` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NULL,
    `pin_code` INTEGER NULL,
    `latitude_longitude` VARCHAR(191) NULL,
    `is_main` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `idx_warehouse_id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_stock_adjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `target_cc_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `ref_no` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `status` ENUM('DRAFT', 'COMPLETED') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `stock_adjustment_cc_id_idx`(`cc_id`),
    INDEX `stock_adjustment_target_cc_id_idx`(`target_cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_stock_adjustment_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock_adjustment_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `is_foc` BOOLEAN NULL DEFAULT false,
    `quantity` INTEGER NOT NULL,
    `adjust_type` ENUM('ADDITION', 'SUBTRACTION', 'UPDATE') NOT NULL,
    `available_qty` INTEGER NULL,
    `batch_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `stock_adjustment_details_stock_adjustment_id_idx`(`stock_adjustment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_batch_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ITEM', 'ITEM_PRICING') NOT NULL,
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
CREATE TABLE `inv_batch_job_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_id` INTEGER NOT NULL,
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
CREATE TABLE `inv_item_supplier_map_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `from` INTEGER NULL,
    `to` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `action_by` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_supplier_map_audit_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `audit_id` INTEGER NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `change_from` VARCHAR(191) NULL,
    `change_to` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `item_Supplier_map_audit_details_audit_id_idx`(`audit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_supplier_map_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `row_no` INTEGER NOT NULL,
    `item_code` VARCHAR(191) NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_category` VARCHAR(191) NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `base_price` DOUBLE NOT NULL,
    `supplier_price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_good_receive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_id` INTEGER NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `store_id` INTEGER NULL,
    `cc_id` INTEGER NOT NULL,
    `po_number` VARCHAR(191) NOT NULL,
    `grn_number` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `returned_amount` DOUBLE NOT NULL DEFAULT 0,
    `net_total` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `net_discount` DOUBLE NOT NULL,
    `notes` TEXT NULL,
    `payment_status` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('DRAFT', 'COMPLETED', 'PENDING') NOT NULL DEFAULT 'COMPLETED',
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `net_tax` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `good_receive_po_id_idx`(`po_id`),
    INDEX `good_receive_supplier_id_idx`(`supplier_id`),
    INDEX `good_receive_store_id_idx`(`store_id`),
    INDEX `good_receive_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_good_receive_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `good_receive_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `purchased_price` DOUBLE NOT NULL,
    `foc_quantity` DOUBLE NOT NULL,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `net_tax` DOUBLE NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `return_quantity` DOUBLE NOT NULL DEFAULT 0,
    `order_quantity` DOUBLE NOT NULL DEFAULT 0,
    `total_amount` DOUBLE NOT NULL,
    `net_amount` DOUBLE NOT NULL,
    `net_discount` DOUBLE NOT NULL,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount_amount` DOUBLE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `unitMasterId` INTEGER NULL,

    INDEX `good_receive_details_good_receive_id_idx`(`good_receive_id`),
    INDEX `good_receive_details_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_good_receive_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grn_id` INTEGER NOT NULL,
    `po_number` VARCHAR(191) NOT NULL,
    `grn_number` VARCHAR(191) NOT NULL,
    `po_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `net_discount` DOUBLE NULL,
    `net_total` DOUBLE NOT NULL,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `payment_status` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `net_tax` DOUBLE NOT NULL,
    `approved_by` INTEGER NULL,
    `approve_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `rejected_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,

    INDEX `good_receive_return_grn_id_idx`(`grn_id`),
    INDEX `good_receive_return_po_id_idx`(`po_id`),
    INDEX `good_receive_return_cc_id_idx`(`cc_id`),
    INDEX `item_supplier_id_idx`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_good_receive_return_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `good_receive_return_id` INTEGER NOT NULL,
    `good_receive_detail_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `total_amount` DOUBLE NOT NULL,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `net_tax` DOUBLE NOT NULL,
    `net_amount` DOUBLE NOT NULL,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount` DOUBLE NULL,
    `net_Discount` DOUBLE NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `order_quantity` DOUBLE NOT NULL,
    `grn_qty` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `good_receive_return_details_grn_return_id_idx`(`good_receive_return_id`),
    INDEX `good_receive_return_details_item_id_idx`(`item_id`),
    INDEX `good_receive_details_id_idx`(`good_receive_detail_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `item_id` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `is_foc` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `item_stock_item_id_idx`(`item_id`),
    INDEX `item_stock_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_item_stock_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_stock_id` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `action` ENUM('ADDITION', 'SUBTRACTION', 'UPDATE') NOT NULL,
    `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT') NOT NULL,
    `ref_id` INTEGER NULL,
    `ref_details_id` INTEGER NULL,
    `ref_no` VARCHAR(191) NULL,
    `ref_date` DATETIME(3) NULL,
    `ref_approved_by` INTEGER NULL,
    `ref_approved_at` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `item_stock_history_item_stock_id_idx`(`item_stock_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_store_requisition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sr_number` VARCHAR(191) NOT NULL,
    `req_from` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `store_req_status` ENUM('Draft', 'Pending', 'Partially_Approved', 'Approved', 'Reject') NOT NULL DEFAULT 'Pending',
    `store_req_ack_status` ENUM('ACK_PENDING', 'ACK_PARTIALLY_RECEIVED', 'ACK_RECEIVED') NOT NULL DEFAULT 'ACK_PENDING',
    `store_req_details` TEXT NULL,
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

    INDEX `store_requisition_requisition_from_idx`(`req_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_store_requisition_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_id` INTEGER NOT NULL,
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

    INDEX `store_requisition_id_idx`(`store_requisition_id`),
    INDEX `item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_requisition_item_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_id` INTEGER NOT NULL,
    `store_requisition_details_id` INTEGER NOT NULL,
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

    INDEX `store_requisition_id_idx`(`store_requisition_id`),
    INDEX `store_requisition_details_id_idx`(`store_requisition_details_id`),
    INDEX `item_id_idx`(`item_id`),
    INDEX `item_stock_id_idx`(`item_stock_id`),
    INDEX `warehouse_id_idx`(`cc_id`),
    INDEX `branch_id_idx`(`ack_cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_in_transit_stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_id` INTEGER NOT NULL,
    `to_Id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `is_foc` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `in_transit_stock_from_id_idx`(`from_id`),
    INDEX `in_transit_stock_to_id_idx`(`to_Id`),
    INDEX `in_transit_stock_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_in_transit_stock_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inTransitStockId` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `action` ENUM('ADDITION', 'SUBTRACTION', 'UPDATE') NOT NULL,
    `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'CONSUMPTION', 'STOCK_ADJUSTMENT') NOT NULL,
    `ref_id` INTEGER NULL,
    `ref_details_id` INTEGER NULL,
    `ref_no` VARCHAR(191) NULL,
    `ref_date` DATE NULL,
    `ref_approved_by` INTEGER NULL,
    `ref_approved_at` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `item_stock_history_in_transit_stock_id_idx`(`inTransitStockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_consumption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `consumption_no` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approval_from` INTEGER NOT NULL,
    `priority` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SENT_FOR_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL,
    `requested_by` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `rejected_by` INTEGER NULL,
    `rejected_at` DATETIME(3) NULL,

    INDEX `consumption_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_consumption_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consumption_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATETIME(3) NULL,
    `requested_qty` INTEGER NOT NULL,
    `consumed_qty` INTEGER NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `consumption_details_consumption_id_idx`(`consumption_id`),
    INDEX `consumption_details_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_event_email` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(191) NOT NULL,
    `email_type` ENUM('GENERAL', 'LOW_STOCK_ALERT', 'EXPIRED_ITEM_ALERT', 'EXPIRING_ITEM_ALERT', 'ERROR_ALERT') NOT NULL,
    `is_signature` BOOLEAN NOT NULL DEFAULT false,
    `email_body` LONGTEXT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `inv_event_email_email_type_key`(`email_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_storage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_dynamic_short_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(191) NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `is_dto` BOOLEAN NOT NULL DEFAULT false,
    `is_cacheable` BOOLEAN NOT NULL DEFAULT false,
    `is_drop_down` BOOLEAN NOT NULL DEFAULT false,
    `permission` VARCHAR(191) NULL,
    `is_single_dto` BOOLEAN NOT NULL DEFAULT true,
    `where_clause` JSON NULL,
    `select_clause` JSON NULL,
    `config` JSON NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nopd_dynamic_short_code_short_code_key`(`short_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_email` BOOLEAN NOT NULL DEFAULT true,
    `is_sms` BOOLEAN NOT NULL DEFAULT false,
    `is_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `county_code` VARCHAR(191) NULL,
    `batch_size` INTEGER NOT NULL DEFAULT 100,
    `default_precision` INTEGER NOT NULL DEFAULT 2,
    `calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `rounded_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `final_round_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `default_email_postfix` VARCHAR(191) NULL,
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
CREATE TABLE `nopd_uin_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` ENUM('AID', 'HRMS', 'MED', 'PROID', 'INV', 'TRANS', 'BATCH_JOB') NOT NULL,
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
CREATE TABLE `nopd_doctor_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doc_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `week_id` INTEGER NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `max_patient` INTEGER NULL,
    `time_taken` INTEGER NOT NULL,
    `first_visit_price` DOUBLE NULL DEFAULT 0.00,
    `follow_up_price` DOUBLE NULL DEFAULT 0.00,
    `vip_first_visit_price` DOUBLE NULL DEFAULT 0.00,
    `vip_follow_up_price` DOUBLE NULL DEFAULT 0.00,
    `special_first_visit_price` DOUBLE NULL DEFAULT 0.00,
    `special_follow_up_price` DOUBLE NULL DEFAULT 0.00,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `opd_doctor_schedule_collection_center_id_idx`(`cc_id`),
    INDEX `opd_doctor_schedule_doc_id_idx`(`doc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_consultation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `temperature` DOUBLE NOT NULL DEFAULT 0.00,
    `weight` DOUBLE NOT NULL DEFAULT 0.00,
    `blood_pressure` VARCHAR(20) NULL,
    `spO2` INTEGER NULL,
    `pulse` INTEGER NULL,
    `notes` TEXT NULL,
    `height` DOUBLE NOT NULL DEFAULT 0.00,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    `bmi` DOUBLE NOT NULL DEFAULT 0.00,
    `systolic_bp` INTEGER NULL,
    `diastolic_bp` INTEGER NULL,
    `respiratory_rate` INTEGER NULL,
    `heart_rate_bpm` INTEGER NULL,
    `urine_output` DOUBLE NULL DEFAULT 0.00,
    `blood_sugar_f` DOUBLE NULL DEFAULT 0.00,
    `blood_sugar_r` DOUBLE NULL DEFAULT 0.00,
    `oxygen_supplementation` INTEGER NULL,
    `intake` DOUBLE NULL DEFAULT 0.00,
    `output` DOUBLE NULL DEFAULT 0.00,
    `comments` TEXT NULL,
    `blood` VARCHAR(200) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `patient_consultation_appointment_id_idx`(`appointment_id`),
    INDEX `patient_consultation_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_consultation_complaints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `complaints` TEXT NOT NULL,
    `appointment_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `consultation_complaints_appointment_id_idx`(`appointment_id`),
    INDEX `consultation_complaints_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_advice_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `advice` TEXT NOT NULL,
    `initial_complaint` TEXT NOT NULL,
    `refer_to_emergency` BOOLEAN NOT NULL DEFAULT false,
    `refer_to_admission` BOOLEAN NOT NULL DEFAULT false,
    `visit_complete` BOOLEAN NOT NULL DEFAULT false,
    `refer_to_mental_health` BOOLEAN NOT NULL DEFAULT false,
    `refer_to_antenatal_care` BOOLEAN NOT NULL DEFAULT false,
    `surgery_request` BOOLEAN NOT NULL DEFAULT false,
    `refer_to_outside_hospital` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `consultation_complaints_appointment_id_idx`(`appointment_id`),
    INDEX `patient_advice_details_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_type` ENUM('PRIMARY', 'SECONDARY') NOT NULL DEFAULT 'PRIMARY',
    `department_name` VARCHAR(191) NOT NULL,
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
CREATE TABLE `nopd_department_prefix` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opd_department_id` INTEGER NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `license_type` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `opd_department_prefix_opd_department_id_idx`(`opd_department_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_clinical_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `is_sulphur_drugs` BOOLEAN NOT NULL DEFAULT false,
    `is_codeine` BOOLEAN NOT NULL DEFAULT false,
    `is_penicillin` BOOLEAN NOT NULL DEFAULT false,
    `is_aspirin` BOOLEAN NOT NULL DEFAULT false,
    `is_ibuprofen` BOOLEAN NOT NULL DEFAULT false,
    `is_iodine` BOOLEAN NOT NULL DEFAULT false,
    `allergies_note` VARCHAR(191) NULL,
    `is_diabetes` BOOLEAN NOT NULL DEFAULT false,
    `is_cancer` BOOLEAN NOT NULL DEFAULT false,
    `is_hypertension` BOOLEAN NOT NULL DEFAULT false,
    `is_asthma` BOOLEAN NOT NULL DEFAULT false,
    `is_std` BOOLEAN NOT NULL DEFAULT false,
    `is_ulcer` BOOLEAN NOT NULL DEFAULT false,
    `is_g6pd_partial_defect` BOOLEAN NOT NULL DEFAULT false,
    `is_sickle_cell_disease` BOOLEAN NOT NULL DEFAULT false,
    `is_other_disease` BOOLEAN NOT NULL DEFAULT false,
    `other_note` VARCHAR(191) NULL,
    `is_smoke` BOOLEAN NOT NULL DEFAULT false,
    `is_drink` BOOLEAN NOT NULL DEFAULT false,
    `is_surgery` BOOLEAN NOT NULL DEFAULT false,
    `surgery_note` VARCHAR(191) NULL,
    `is_medication` BOOLEAN NOT NULL DEFAULT false,
    `medication_note` VARCHAR(191) NULL,
    `is_pregnant` BOOLEAN NOT NULL DEFAULT false,
    `is_breast_feeding` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `opd_clinical_history_patient_id_idx`(`patient_id`),
    INDEX `opd_clinical_history_appointment_id_idx`(`appointment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_time_slot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doc_id` INTEGER NOT NULL,
    `appointment_id` INTEGER NOT NULL,
    `booked_time` VARCHAR(191) NOT NULL,
    `booked_date` DATE NOT NULL,
    `is_booked` BOOLEAN NOT NULL,
    `is_booked_with_money` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `time_slot_doc_id_idx`(`doc_id`),
    INDEX `time_slot_appointment_id_idx`(`appointment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_appointments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` VARCHAR(191) NOT NULL,
    `patient_unique_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `client_id` INTEGER NULL,
    `visit_id` VARCHAR(191) NULL,
    `week_id` INTEGER NOT NULL,
    `appointment_type` ENUM('WALK_IN', 'INSURANCE', 'CORPORATE') NOT NULL,
    `contact_number` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `is_vip_booking` BOOLEAN NULL,
    `is_special_booking` BOOLEAN NULL,
    `sub_total_amount` DOUBLE NOT NULL DEFAULT 0,
    `other_charge_amount` DOUBLE NOT NULL DEFAULT 0,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL DEFAULT 'EXCLUSIVE',
    `tax_value` DOUBLE NOT NULL DEFAULT 0,
    `tax_amount` DOUBLE NOT NULL DEFAULT 0,
    `additional_discount_mode` ENUM('PERCENTAGE', 'AMOUNT') NULL,
    `additional_discount_value` DOUBLE NULL DEFAULT 0,
    `discount_total_amount` DOUBLE NOT NULL DEFAULT 0,
    `net_amount` DOUBLE NOT NULL DEFAULT 0,
    `gross_amount` DOUBLE NOT NULL DEFAULT 0,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `refund_amount` DOUBLE NOT NULL DEFAULT 0,
    `refunded_amount` DOUBLE NOT NULL DEFAULT 0,
    `insurance_id` INTEGER NULL,
    `patient_insurance_id` INTEGER NULL,
    `copayment_type` ENUM('PERCENTAGE', 'AMOUNT') NULL DEFAULT 'PERCENTAGE',
    `copayment_value` DOUBLE NULL DEFAULT 0,
    `copayment_amount` DOUBLE NULL DEFAULT 0,
    `copayment_source` ENUM('MANUAL', 'SETTINGS') NOT NULL DEFAULT 'SETTINGS',
    `payment_status` ENUM('PENDING', 'REFUND', 'SETTLED', 'PARTIAL') NOT NULL DEFAULT 'PENDING',
    `status` ENUM('BOOKED', 'COMPLETE', 'CANCELLED', 'PENDING') NOT NULL DEFAULT 'BOOKED',
    `bill_id` VARCHAR(191) NULL,
    `referred_by` ENUM('NEW_PATIENT', 'FOLLOW_UP', 'PREVENTIVE_CASE_SERVICES') NULL,
    `is_foc` BOOLEAN NULL DEFAULT false,
    `foc_bill_reason` ENUM('NONE', 'GOVT_SCHEME', 'DOCTOR_REQUEST', 'CHARITY') NOT NULL DEFAULT 'NONE',
    `is_migrated` BOOLEAN NULL DEFAULT false,
    `is_rescheduled` BOOLEAN NOT NULL DEFAULT false,
    `procedure_status` ENUM('BOOKED', 'CANCELLED', 'PARTIALLY_CANCELLED') NULL,
    `pharmacy_status` ENUM('BOOKED', 'CANCELLED', 'PARTIALLY_CANCELLED') NULL,
    `selected_date` DATE NOT NULL,
    `selected_time` VARCHAR(191) NOT NULL,
    `cancellation_reason` VARCHAR(191) NULL,
    `cancelled_by` INTEGER NULL,
    `cancelled_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `appointments_table_patient_id_idx`(`patient_id`),
    INDEX `appointments_table_doctor_id_idx`(`doctor_id`),
    INDEX `appointments_table_cc_id_idx`(`cc_id`),
    INDEX `appointments_table_client_id_idx`(`client_id`),
    INDEX `appointments_table_insurance_id_idx`(`insurance_id`),
    INDEX `appointments_table_patient_insurance_id_idx`(`patient_insurance_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `document_type` ENUM('PATHOLOGY', 'RADIOLOGY', 'OTHERS') NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_documents_table_patient_id_idx`(`patient_id`),
    INDEX `patient_documents_table_appointment_id_idx`(`appointment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_refer_to_doctor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `visit_type` ENUM('GENERAL_VISIT', 'FOLLOW_UP', 'EMERGENCY_VISIT', 'MLC_VISIT') NOT NULL,
    `description` VARCHAR(191) NULL,
    `opd_department_id` INTEGER NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_refer_to_doctor_appointment_id_idx`(`appointment_id`),
    INDEX `patient_refer_to_doctor_patient_id_idx`(`patient_id`),
    INDEX `patient_refer_to_doctor_opd_department_id_idx`(`opd_department_id`),
    INDEX `patient_refer_to_doctor_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pathology_b2b_invoice_amount_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `b2b_client_id` INTEGER NOT NULL,
    `total_amount` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `creation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paid_date` DATE NOT NULL,
    `invoice_payment_id` INTEGER NULL,
    `mrp_rate` VARCHAR(191) NULL,
    `service_type` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL DEFAULT 'PATHOLOGY',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_follow_up` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `follow_up_days` INTEGER NOT NULL,
    `follow_up_date` DATE NOT NULL,
    `status` ENUM('UPCOMING', 'COMPLETED') NOT NULL DEFAULT 'UPCOMING',
    `is_current_date_reminder_sent` BOOLEAN NOT NULL DEFAULT false,
    `is_ahead_reminder_sent` BOOLEAN NOT NULL DEFAULT false,
    `is_reminder_sent` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_follow_up_appointment_id_idx`(`appointment_id`),
    INDEX `patient_follow_up_patient_id_idx`(`patient_id`),
    INDEX `patient_follow_up_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_chips_button_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctor_id` INTEGER NOT NULL,
    `chips_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `chips_doctor_mapping_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_consultation_icd_ten_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `icd_ten_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `attendance` VARCHAR(100) NULL,
    `type` ENUM('PRINCIPLE', 'PROVISIONAL') NULL,
    `status_of_diagnosis` ENUM('NEW', 'OLD') NULL,
    `category` ENUM('PRIMARY', 'ADDITIONAL') NULL,
    `adverse_effect` VARCHAR(150) NULL,
    `dgrg_code` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `consultation_icd_ten_list_icd_10_id_idx`(`icd_ten_id`),
    INDEX `consultation_icd_ten_list_appointment_id_idx`(`appointment_id`),
    INDEX `consultation_icd_ten_list_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_consultation_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultation_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_consultation_notes_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultation_notes_id` INTEGER NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `consultation_notes_mapping_consultation_notes_id_idx`(`consultation_notes_id`),
    INDEX `consultation_notes_mapping_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `icd_ten_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `icd_general_code` VARCHAR(191) NOT NULL,
    `seq_no` VARCHAR(191) NULL,
    `icd_specific_code` VARCHAR(191) NOT NULL,
    `icd_description` VARCHAR(191) NOT NULL,
    `icd_name` VARCHAR(191) NOT NULL,
    `insert_timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opd_insurer_payment_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insurer_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `type` ENUM('Procedure', 'Department', 'Doctor') NOT NULL DEFAULT 'Procedure',
    `type_id` INTEGER NOT NULL,
    `standard_charge` DOUBLE NOT NULL,
    `payment_mode` ENUM('co_pay', 'in_amount') NOT NULL,
    `payment_value` DOUBLE NOT NULL,
    `payment_amount` DOUBLE NULL,
    `first_visit_price` DOUBLE NULL DEFAULT 0.00,
    `followup_price` DOUBLE NULL DEFAULT 0.00,
    `vip_first_visit_price` DOUBLE NULL DEFAULT 0.00,
    `vip_followup_price` DOUBLE NULL DEFAULT 0.00,
    `special_first_visit_price` DOUBLE NULL DEFAULT 0.00,
    `special_followup_price` DOUBLE NULL DEFAULT 0.00,
    `status` ENUM('0', '1') NOT NULL DEFAULT '1',
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` INTEGER NULL,

    INDEX `opd_insurer_payment_setting_insurer_index`(`insurer_id`),
    INDEX `opd_insurer_payment_setting_location_index`(`location_id`),
    INDEX `opd_insurer_payment_setting_type_typeid_index`(`type`, `type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opd_client_master_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `type` ENUM('Procedure', 'Department', 'Doctor') NOT NULL DEFAULT 'Procedure',
    `type_id` INTEGER NOT NULL,
    `standard_charge` DOUBLE NOT NULL,
    `payment_mode` ENUM('in_percentage', 'in_amount') NOT NULL DEFAULT 'in_percentage',
    `payment_value` DOUBLE NOT NULL,
    `payment_amount` DOUBLE NULL,
    `first_visit_price` DOUBLE NOT NULL DEFAULT 0.00,
    `followup_price` DOUBLE NOT NULL DEFAULT 0.00,
    `vip_first_visit_price` DOUBLE NOT NULL DEFAULT 0.00,
    `vip_followup_price` DOUBLE NOT NULL DEFAULT 0.00,
    `special_first_visit_price` DOUBLE NOT NULL DEFAULT 0.00,
    `special_followup_price` DOUBLE NOT NULL DEFAULT 0.00,
    `status` ENUM('0', '1') NOT NULL DEFAULT '1',
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` INTEGER NULL,

    INDEX `opd_client_master_setting_location_index`(`location_id`),
    INDEX `opd_client_master_setting_client_id_idx`(`client_id`),
    INDEX `opd_client_master_setting_type_typeid_index`(`type`, `type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_consultation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `consultation_notes` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `consultation_appointment_id_idx`(`appointment_id`),
    INDEX `consultation_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pathology_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `analyteid` VARCHAR(191) NULL,
    `analytecode` VARCHAR(191) NOT NULL,
    `analyte_name` VARCHAR(191) NOT NULL,
    `department_name` VARCHAR(191) NULL,
    `method_name` VARCHAR(191) NULL,
    `sample_name` VARCHAR(191) NULL,
    `container_name` VARCHAR(191) NULL,
    `standard_charge` DOUBLE NOT NULL DEFAULT 500.00,
    `cc_id` INTEGER NOT NULL DEFAULT 1,
    `is_comment_required` ENUM('Yes', 'No') NOT NULL DEFAULT 'No',
    `orderable` VARCHAR(191) NOT NULL DEFAULT 'Yes',
    `is_active` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_test_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctor_id` INTEGER NOT NULL,
    `category_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `test_categories_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_tests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `test_category_id` INTEGER NOT NULL,
    `test_id` INTEGER NOT NULL,
    `test_code` VARCHAR(191) NOT NULL,
    `test_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `tests_test_category_id_idx`(`test_category_id`),
    INDEX `tests_test_id_idx`(`test_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_test` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `test_id` INTEGER NOT NULL,
    `test_code` VARCHAR(191) NOT NULL,
    `test_name` VARCHAR(191) NOT NULL,
    `visit_id` VARCHAR(191) NULL,
    `comment` VARCHAR(191) NULL,
    `process_location` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_test_appointment_id_idx`(`appointment_id`),
    INDEX `patient_test_patient_id_idx`(`patient_id`),
    INDEX `patient_test_test_id_idx`(`test_id`),
    INDEX `patient_test_process_location_idx`(`process_location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_procedure_master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `procedure_name` VARCHAR(191) NOT NULL,
    `procedure_charge` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `procedure_master_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_procedure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_procedure_ref_no` VARCHAR(191) NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `insurance_id` INTEGER NULL,
    `patient_insurance_id` INTEGER NULL,
    `client_id` INTEGER NULL,
    `additional_discount_mode` ENUM('PERCENTAGE', 'AMOUNT') NULL,
    `additional_discount_value` DOUBLE NOT NULL DEFAULT 0,
    `subtotal_amount` DOUBLE NOT NULL DEFAULT 0,
    `other_charge_amount` DOUBLE NOT NULL DEFAULT 0,
    `discount_total_amount` DOUBLE NOT NULL DEFAULT 0,
    `tax_amount` DOUBLE NOT NULL DEFAULT 0,
    `gross_amount` DOUBLE NOT NULL DEFAULT 0,
    `net_amount` DOUBLE NOT NULL DEFAULT 0,
    `co_payment_amount` DOUBLE NOT NULL DEFAULT 0,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `refund_amount` DOUBLE NOT NULL DEFAULT 0,
    `refunded_amount` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('PARTIAL', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `procedure_done_by` INTEGER NULL,
    `payment_status` ENUM('PENDING', 'SETTELED', 'PARTIAL', 'REFUND') NOT NULL DEFAULT 'PENDING',
    `bill_number` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `insurer_invoice_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_procedure_cc_id_idx`(`cc_id`),
    INDEX `patient_procedure_appointment_id_idx`(`appointment_id`),
    INDEX `patient_procedure_patient_id_idx`(`patient_id`),
    INDEX `patient_procedure_insurance_id_idx`(`insurance_id`),
    INDEX `patient_procedure_patient_insurance_id_idx`(`patient_insurance_id`),
    INDEX `patient_procedure_client_id_idx`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_procedure_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_procedure_id` INTEGER NOT NULL,
    `procedure_id` INTEGER NOT NULL,
    `procedure_name` VARCHAR(191) NOT NULL,
    `subtotal_amount` DOUBLE NOT NULL DEFAULT 0,
    `other_charge_amount` DOUBLE NOT NULL DEFAULT 0,
    `discount_mode` ENUM('PERCENTAGE', 'AMOUNT') NULL,
    `discount_value` DOUBLE NOT NULL DEFAULT 0,
    `discount_amount` DOUBLE NOT NULL DEFAULT 0,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NULL,
    `tax_value` DOUBLE NOT NULL DEFAULT 0,
    `tax_amount` DOUBLE NOT NULL DEFAULT 0,
    `gross_amount` DOUBLE NOT NULL,
    `net_amount` DOUBLE NOT NULL,
    `co_payment_mode` ENUM('PERCENTAGE', 'AMOUNT') NULL,
    `co_payment_value` DOUBLE NOT NULL DEFAULT 0,
    `co_payment_amount` DOUBLE NOT NULL DEFAULT 0,
    `is_returned` BOOLEAN NOT NULL DEFAULT false,
    `co_payment_source` ENUM('MANUAL', 'SETTINGS') NOT NULL DEFAULT 'SETTINGS',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_procedure_details_patient_procedure_id_idx`(`patient_procedure_id`),
    INDEX `patient_procedure_details_procedure_id_idx`(`procedure_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_financial_change_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(191) NOT NULL,
    `referenceId` INTEGER NOT NULL,
    `referenceType` VARCHAR(191) NOT NULL,
    `changeType` ENUM('CO_PAY', 'DISCOUNT') NOT NULL,
    `oldType` ENUM('PERCENTAGE', 'AMOUNT') NOT NULL,
    `oldValue` DOUBLE NOT NULL,
    `oldAmount` DOUBLE NOT NULL,
    `newType` ENUM('PERCENTAGE', 'AMOUNT') NOT NULL,
    `newValue` DOUBLE NOT NULL,
    `newAmount` DOUBLE NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('PENDING', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approvedLevel` INTEGER NULL,
    `approvedBy` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedBy` INTEGER NULL,
    `rejectedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `core_financial_change_request_reference_id_idx`(`referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_medicine_tab` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctor_id` INTEGER NOT NULL,
    `med_tab_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `medcine_tab_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_medicine_tab_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medicine_tab_id` INTEGER NOT NULL,
    `med_id` INTEGER NOT NULL,
    `morn` INTEGER NULL DEFAULT 0,
    `aft` INTEGER NULL DEFAULT 0,
    `night` INTEGER NULL DEFAULT 0,
    `sos` BOOLEAN NOT NULL DEFAULT false,
    `duration` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `medicine_tab_pharmacy_medicine_tab_id_idx`(`medicine_tab_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_medicine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `patient_unique_id` INTEGER NOT NULL,
    `medicine_group_number` VARCHAR(191) NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `project_type` ENUM('IPD', 'OPD') NOT NULL DEFAULT 'OPD',
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_medicine_master_appointment_id_idx`(`appointment_id`),
    INDEX `patient_medicine_master_patient_id_idx`(`patient_id`),
    INDEX `patient_medicine_master_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_patient_medicine_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `master_id` INTEGER NOT NULL,
    `med_id` INTEGER NOT NULL,
    `sell_id` INTEGER NULL,
    `sell_ref_no` VARCHAR(191) NULL,
    `morn` INTEGER NULL DEFAULT 0,
    `aft` INTEGER NULL DEFAULT 0,
    `night` INTEGER NULL DEFAULT 0,
    `sos` BOOLEAN NOT NULL DEFAULT false,
    `duration` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_medicine_detail_master_id_idx`(`master_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_payment_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_no` VARCHAR(191) NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `module` ENUM('PATHOLOGY', 'OPD', 'PHARMACY', 'INVENTORY', 'CORE', 'GENERAL_BILL', 'PROCEDURE', 'RADIOLOGY') NOT NULL,
    `reference_id` INTEGER NOT NULL,
    `reference_number` VARCHAR(191) NULL,
    `patient_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `collector_id` INTEGER NULL,
    `net_amount` DOUBLE NOT NULL DEFAULT 0,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `due_amount` DOUBLE NOT NULL DEFAULT 0,
    `refund_amount` DOUBLE NOT NULL DEFAULT 0,
    `remarks` VARCHAR(191) NULL,
    `transaction_type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `payment_mode` ENUM('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE_GATEWAY', 'WALLET') NOT NULL,
    `bank_name` VARCHAR(191) NULL,
    `account_number` VARCHAR(191) NULL,
    `card_no` VARCHAR(191) NULL,
    `card_holder_name` VARCHAR(191) NULL,
    `card_expiry_date` DATETIME(3) NULL,
    `transaction_id` VARCHAR(191) NULL,
    `bank_head_id` INTEGER NULL,
    `mobile_money_method_id` INTEGER NULL,
    `isReconciled` BOOLEAN NOT NULL DEFAULT false,
    `reconciliationDate` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_payment_cc_id`(`cc_id`),
    INDEX `idx_payment_collector_id`(`collector_id`),
    INDEX `idx_payment_patient_id`(`patient_id`),
    INDEX `idx_payment_transaction_no`(`transaction_no`),
    INDEX `idx_payment_reference`(`reference_id`, `module`),
    INDEX `idx_payment_trx_type`(`transaction_type`),
    INDEX `idx_payment_mode`(`payment_mode`),
    INDEX `idx_payment_bank_head_id`(`bank_head_id`),
    INDEX `idx_payment_mobile_money_method_id`(`mobile_money_method_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_general_bill_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `default_price` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_general_bill_pricing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `general_bill_item_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `general_bill_pricing_cc_id_idx`(`cc_id`),
    INDEX `general_bill_pricing_general_bill_item_id_idx`(`general_bill_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_batch_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('GENERAL_BILL_PRICING') NOT NULL,
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
CREATE TABLE `nopd_batch_job_details` (
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
CREATE TABLE `nopd_general_bill_pricing_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `general_bill_item_id` INTEGER NOT NULL,
    `general_bill_item_name` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `batch_job_id` INTEGER NOT NULL,

    INDEX `general_bill_pricing_excel_batch_job_id_idx`(`batch_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_general_billing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `patient_unique_id` INTEGER NOT NULL,
    `additional_discount_mode` ENUM('PERCENTAGE', 'AMOUNT') NULL,
    `additional_discount_value` DOUBLE NOT NULL DEFAULT 0,
    `subtotal_amount` DOUBLE NOT NULL DEFAULT 0,
    `other_charge_amount` DOUBLE NOT NULL DEFAULT 0,
    `discount_total_amount` DOUBLE NOT NULL DEFAULT 0,
    `tax_amount` DOUBLE NOT NULL DEFAULT 0,
    `gross_amount` DOUBLE NOT NULL DEFAULT 0,
    `net_amount` DOUBLE NOT NULL DEFAULT 0,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `refund_amount` DOUBLE NOT NULL DEFAULT 0,
    `refunded_amount` DOUBLE NOT NULL DEFAULT 0,
    `bill_number` VARCHAR(191) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `payment_status` ENUM('PENDING', 'REFUND', 'SETTLED', 'PARTIAL') NOT NULL DEFAULT 'PENDING',
    `status` ENUM('PARTIAL', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `patient_procedure_cc_id_idx`(`cc_id`),
    INDEX `patient_procedure_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nopd_general_billing_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `general_billing_id` INTEGER NOT NULL,
    `general_bill_item_id` INTEGER NOT NULL,
    `subtotal_amount` DOUBLE NOT NULL DEFAULT 0,
    `other_charge_amount` DOUBLE NOT NULL DEFAULT 0,
    `discount_mode` ENUM('PERCENTAGE', 'AMOUNT') NULL,
    `discount_value` DOUBLE NOT NULL DEFAULT 0,
    `discount_amount` DOUBLE NOT NULL DEFAULT 0,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NULL,
    `tax_value` DOUBLE NOT NULL DEFAULT 0,
    `tax_amount` DOUBLE NOT NULL DEFAULT 0,
    `gross_amount` DOUBLE NOT NULL,
    `net_amount` DOUBLE NOT NULL,
    `is_refunded` BOOLEAN NOT NULL DEFAULT false,
    `is_foc` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `general_billing_details_general_billing_id_idx`(`general_billing_id`),
    INDEX `general_billing_details_general_item_pricing_id_idx`(`general_bill_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_dynamic_short_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(191) NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `is_dto` BOOLEAN NOT NULL DEFAULT false,
    `is_cacheable` BOOLEAN NOT NULL DEFAULT false,
    `is_drop_down` BOOLEAN NOT NULL DEFAULT false,
    `permission` VARCHAR(191) NULL,
    `config` JSON NULL,
    `is_single_dto` BOOLEAN NOT NULL DEFAULT true,
    `where_clause` JSON NULL,
    `select_clause` JSON NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pms_dynamic_short_code_short_code_key`(`short_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_uin_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` ENUM('PO', 'GRN', 'POR', 'SRN', 'GATE_PASS', 'SELL', 'SELL_RETURN', 'ITEM', 'STR', 'BATCH_JOB', 'STAJ', 'BILL', 'SRR') NOT NULL,
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
CREATE TABLE `pms_med_composition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `med_compo_name` VARCHAR(191) NOT NULL,
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
CREATE TABLE `pms_med_unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
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
CREATE TABLE `pms_box_size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
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
CREATE TABLE `pms_med_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `min_margin_b2c_percentage` DOUBLE NOT NULL DEFAULT 0.00,
    `min_margin_b2b_percentage` DOUBLE NOT NULL DEFAULT 0.00,
    `loyalty_percentage` DOUBLE NOT NULL DEFAULT 0.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_medicine_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
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
CREATE TABLE `pms_med_package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_med_drug` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_manufacture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_medicine_dosage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_medicine_instruction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instruction_name` LONGTEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_number` VARCHAR(191) NULL,
    `medicine_name` VARCHAR(191) NOT NULL,
    `medicine_category_id` INTEGER NOT NULL,
    `storage_id` INTEGER NULL,
    `box_size_id` INTEGER NULL,
    `medicine_type_id` INTEGER NOT NULL,
    `medicine_composition_id` INTEGER NOT NULL,
    `medicine_unit_id` INTEGER NOT NULL,
    `manufacturer_id` INTEGER NOT NULL,
    `min_order_details` VARCHAR(191) NULL,
    `rack_location` VARCHAR(191) NULL,
    `default_disc` DECIMAL(13, 5) NOT NULL,
    `default_b2b_disc` DECIMAL(13, 5) NOT NULL,
    `is_lock_disc` BOOLEAN NOT NULL DEFAULT false,
    `is_lock_b2b_disc` BOOLEAN NOT NULL DEFAULT false,
    `min_stock` INTEGER NOT NULL,
    `max_stock` INTEGER NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `pack_size_id` INTEGER NOT NULL,
    `drug_type_id` INTEGER NOT NULL,
    `is_allow_loose_sale` BOOLEAN NOT NULL DEFAULT false,
    `accept_online_order` BOOLEAN NOT NULL DEFAULT true,
    `is_returnable` BOOLEAN NOT NULL DEFAULT true,
    `is_suggestion_lock` BOOLEAN NOT NULL DEFAULT false,
    `cess` DOUBLE NULL,
    `hsn_code` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    `purchase_amount` DECIMAL(13, 5) NOT NULL,
    `sale_amount` DECIMAL(13, 5) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `on_hold_sale` DATE NULL,
    `medicine_pack_type` ENUM('Tube', 'Strip', 'Bottle', 'Box', 'Sachet', 'Packet', 'Jar', 'Others') NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `item_alias` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `insurance_percentage` DECIMAL(13, 5) NOT NULL,
    `walk_in_percentage` DECIMAL(13, 5) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `med_category_id_idx`(`medicine_category_id`),
    INDEX `med_compo_id_idx`(`medicine_composition_id`),
    INDEX `med_type_id_idx`(`medicine_type_id`),
    INDEX `med_unit_id_idx`(`medicine_unit_id`),
    INDEX `pack_size_id_idx`(`pack_size_id`),
    INDEX `drug_type_id_idx`(`drug_type_id`),
    INDEX `manufacturer_id_idx`(`manufacturer_id`),
    INDEX `storage_id_idx`(`storage_id`),
    INDEX `item_box_size_id_idx`(`box_size_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item_dosage_map` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `dosage_id` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `item_medicine_dosage_map_dosage_id_idx`(`dosage_id`),
    UNIQUE INDEX `pms_item_dosage_map_item_id_dosage_id_key`(`item_id`, `dosage_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` ENUM('Front', 'Right', 'Left', 'Back') NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `item_id` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `item_images_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NULL,
    `mobile_no` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Others') NOT NULL,
    `address_1` VARCHAR(191) NOT NULL,
    `address_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `pin_code` INTEGER NULL,
    `lattitude_longitude` VARCHAR(191) NULL,
    `ghana_card_no` VARCHAR(191) NOT NULL,
    `tin_no` VARCHAR(191) NULL,
    `discount` DOUBLE NULL DEFAULT 0,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_warehouse` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `vat_no` VARCHAR(191) NOT NULL,
    `tin_no` VARCHAR(191) NOT NULL,
    `business_subline_name` VARCHAR(191) NULL,
    `contact_person` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `country_id` INTEGER NULL,
    `city_id` INTEGER NULL,
    `state_id` INTEGER NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NULL,
    `pin_code` INTEGER NULL,
    `latitude_longitude` VARCHAR(191) NULL,
    `is_main` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `warehouse_country_id_idx`(`country_id`),
    INDEX `warehouse_city_id_idx`(`city_id`),
    INDEX `warehouse_state_id_idx`(`state_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_distributor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pro_in_name` VARCHAR(191) NOT NULL,
    `pro_in_email` VARCHAR(191) NOT NULL,
    `pro_country_code` VARCHAR(191) NULL,
    `pro_in_phone` VARCHAR(191) NOT NULL,
    `dp_name` VARCHAR(191) NOT NULL,
    `dp_email` VARCHAR(191) NOT NULL,
    `dp_country_code` VARCHAR(191) NULL,
    `dp_phone` VARCHAR(191) NOT NULL,
    `pos_email` BOOLEAN NOT NULL DEFAULT false,
    `pos_phone_notification` BOOLEAN NOT NULL DEFAULT false,
    `pos_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `pos_sms` BOOLEAN NOT NULL DEFAULT false,
    `grn_email` BOOLEAN NOT NULL DEFAULT false,
    `grn_phone_notification` BOOLEAN NOT NULL DEFAULT false,
    `grn_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `grn_sms` BOOLEAN NOT NULL DEFAULT false,
    `return_email` BOOLEAN NOT NULL DEFAULT false,
    `return_phone_notification` BOOLEAN NOT NULL DEFAULT false,
    `return_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `return_sms` BOOLEAN NOT NULL DEFAULT false,
    `bill_to` TEXT NULL,
    `ship_to` TEXT NULL,
    `dist_lic_number` VARCHAR(191) NULL,
    `dist_lic_document` VARCHAR(191) NULL,
    `dist_agreement_doc` VARCHAR(191) NULL,
    `dist_ghana_doc` VARCHAR(191) NULL,
    `dist_drug_doc` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `bank_address` VARCHAR(191) NOT NULL,
    `bank_branch_name` VARCHAR(191) NOT NULL,
    `swift_ifsc_code` VARCHAR(191) NOT NULL,
    `bank_account_number` VARCHAR(191) NOT NULL,
    `bank_account_type` VARCHAR(191) NOT NULL,
    `term_and_condition` VARCHAR(191) NULL,
    `stock_shipment_details` VARCHAR(191) NULL,
    `due_date` INTEGER NOT NULL,
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
CREATE TABLE `pms_tax_identification_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `distributor_id` INTEGER NOT NULL,
    `tax_identification_name` VARCHAR(191) NOT NULL,
    `tax_identification_value` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `tax_identification_details_distributor_id_idx`(`distributor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_branch` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gst_n` VARCHAR(191) NOT NULL,
    `tinNo` VARCHAR(191) NOT NULL,
    `business_subline` VARCHAR(191) NULL,
    `pharmacist_name` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NULL,
    `pin_code` INTEGER NULL,
    `country_id` INTEGER NULL,
    `city_id` INTEGER NULL,
    `state_id` INTEGER NULL,
    `latitude_longitude` VARCHAR(191) NULL,
    `is_main` BOOLEAN NOT NULL DEFAULT false,
    `is_autonomous` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `branch_country_id_idx`(`country_id`),
    INDEX `branch_city_id_idx`(`city_id`),
    INDEX `branch_state_id_idx`(`state_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item_instruction_map` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `instruction_id` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `item_instruction_map_instruction_id_idx`(`instruction_id`),
    INDEX `item_instruction_map_item_id_idx`(`item_id`),
    UNIQUE INDEX `pms_item_instruction_map_item_id_instruction_id_key`(`item_id`, `instruction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `stock_code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `branch_id` INTEGER NULL,
    `wearHouse_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `store_branch_id_idx`(`branch_id`),
    INDEX `store_warehouse_id_idx`(`wearHouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_purchase_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_number` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
    `grand_total` DECIMAL(13, 5) NOT NULL,
    `status` ENUM('SENT_FOR_APPROVAL', 'APPROVED', 'REJECTED', 'DRAFT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'PARTIALLY_APPROVED') NOT NULL DEFAULT 'SENT_FOR_APPROVAL',
    `notes` TEXT NULL,
    `currency` VARCHAR(191) NULL,
    `store_id` INTEGER NULL,
    `paymentTerms` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `last_verified_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_verified_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `purchase_order_distributor_id_idx`(`distributor_id`),
    INDEX `purchase_order_warehouse_id_idx`(`warehouse_id`),
    INDEX `purchase_order_storage_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_po_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_of_measure` VARCHAR(191) NULL,
    `purchase_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_cat_id` INTEGER NULL,
    `item_medicine_category` VARCHAR(191) NOT NULL,
    `medicine_type` VARCHAR(191) NOT NULL,
    `medicine_composition` VARCHAR(191) NOT NULL,
    `medicine_unit` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `pack_size` VARCHAR(191) NOT NULL,
    `drug_type` VARCHAR(191) NOT NULL,
    `medicine_type_id` INTEGER NOT NULL,
    `medicine_composition_id` INTEGER NOT NULL,
    `medicine_unit_id` INTEGER NOT NULL,
    `manufacturer_Id` INTEGER NOT NULL,
    `pack_size_id` INTEGER NOT NULL,
    `drug_type_id` INTEGER NOT NULL,
    `mrp` DECIMAL(13, 5) NULL,
    `purchased_price` DECIMAL(13, 5) NOT NULL,
    `packing_qty` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL,
    `received_qty` DOUBLE NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `purchase_order_details_pack_size_id_idx`(`pack_size_id`),
    INDEX `purchase_order_details_med_unit_id_idx`(`medicine_unit_id`),
    INDEX `purchase_order_details_item_id_idx`(`item_id`),
    INDEX `purchase_order_details_purchase_id_idx`(`purchase_id`),
    INDEX `purchase_order_details_item_cat_id_idx`(`item_cat_id`),
    INDEX `purchase_order_details_med_type_id_idx`(`medicine_type_id`),
    INDEX `purchase_order_details_med_comp_id_idx`(`medicine_composition_id`),
    INDEX `purchase_order_details_manufacturer_id_idx`(`manufacturer_Id`),
    INDEX `purchase_order_details_drug_type_id_idx`(`drug_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_medicine_distributor_map` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `expiry_date` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `medicine_distributor_map_item_id_idx`(`item_id`),
    INDEX `medicine_distributor_map_distributor_id_idx`(`distributor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_store_requisition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sr_number` VARCHAR(191) NOT NULL,
    `req_from` INTEGER NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
    `store_req_status` ENUM('Draft', 'Pending', 'Partially_Approved', 'Approved', 'Reject') NOT NULL DEFAULT 'Pending',
    `store_req_ack_status` ENUM('ACK_PENDING', 'ACK_PARTIALLY_RECEIVED', 'ACK_RECEIVED') NOT NULL DEFAULT 'ACK_PENDING',
    `store_req_details` TEXT NULL,
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

    INDEX `store_requisition_requisition_from_idx`(`req_from`),
    INDEX `store_requisition_warehouse_id_idx`(`warehouse_id`),
    INDEX `store_requisition_to_branch_id_idx`(`branch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_store_requisition_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_category` VARCHAR(191) NOT NULL,
    `medicine_type` VARCHAR(191) NOT NULL,
    `medicine_composition` VARCHAR(191) NOT NULL,
    `medicine_unit` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `pack_size` VARCHAR(191) NOT NULL,
    `drug_type` VARCHAR(191) NOT NULL,
    `item_category_id` INTEGER NOT NULL,
    `medicine_type_id` INTEGER NOT NULL,
    `medicine_composition_id` INTEGER NOT NULL,
    `medicine_unit_id` INTEGER NOT NULL,
    `manufacturer_Id` INTEGER NOT NULL,
    `pack_size_id` INTEGER NOT NULL,
    `drug_type_id` INTEGER NOT NULL,
    `req_quantity` DOUBLE NOT NULL,
    `assigned_quantity` DOUBLE NOT NULL DEFAULT 0,
    `acknowledged_quantity` DOUBLE NOT NULL DEFAULT 0,
    `returned_quantity` DOUBLE NOT NULL DEFAULT 0,
    `comment` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `store_requisition_id_idx`(`store_requisition_id`),
    INDEX `item_id_idx`(`item_id`),
    INDEX `item_category_id_idx`(`item_category_id`),
    INDEX `med_type_id_idx`(`medicine_type_id`),
    INDEX `med_comp_id_idx`(`medicine_composition_id`),
    INDEX `med_unit_id_idx`(`medicine_unit_id`),
    INDEX `manufacturer_id_idx`(`manufacturer_Id`),
    INDEX `pack_size_id_idx`(`pack_size_id`),
    INDEX `drug_type_id_idx`(`drug_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_requisition_item_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_id` INTEGER NOT NULL,
    `store_requisition_details_id` INTEGER NOT NULL,
    `item_stock_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `assign_qty` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NOT NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NULL,
    `acknowledged_qty` INTEGER NOT NULL DEFAULT 0,
    `returned_qty` INTEGER NOT NULL DEFAULT 0,
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

    INDEX `store_requisition_id_idx`(`store_requisition_id`),
    INDEX `store_requisition_details_id_idx`(`store_requisition_details_id`),
    INDEX `item_id_idx`(`item_id`),
    INDEX `item_stock_id_idx`(`item_stock_id`),
    INDEX `warehouse_id_idx`(`cc_id`),
    INDEX `branch_id_idx`(`ack_cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_store_requisition_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srr_number` VARCHAR(191) NOT NULL,
    `store_requisition_id` INTEGER NOT NULL,
    `req_from` INTEGER NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
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

    INDEX `srr_store_requisition_id_idx`(`store_requisition_id`),
    INDEX `srr_requisition_from_idx`(`req_from`),
    INDEX `srr_branch_id_idx`(`branch_id`),
    INDEX `srr_warehouse_id_idx`(`warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_store_requisition_return_details` (
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

    INDEX `srrd_store_requisition_return_id_idx`(`store_requisition_return_id`),
    INDEX `srrd_store_requisition_details_id_idx`(`store_requisition_details_id`),
    INDEX `srrd_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_requisition_return_item_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_requisition_return_details_id` INTEGER NOT NULL,
    `requisition_item_details_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `return_qty` INTEGER NOT NULL,
    `acknowledged_qty` INTEGER NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NOT NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NULL,
    `comment` TEXT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `source_branch_id` INTEGER NOT NULL,
    `destination_warehouse_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `rrid_requisition_item_details_id_idx`(`requisition_item_details_id`),
    INDEX `rrid_store_requisition_return_details_id_idx`(`store_requisition_return_details_id`),
    INDEX `rrid_item_id_idx`(`item_id`),
    INDEX `rrid_source_branch_id_idx`(`source_branch_id`),
    INDEX `rrid_destination_warehouse_id_idx`(`destination_warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_good_receive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_number` VARCHAR(191) NOT NULL,
    `grn_number` VARCHAR(191) NOT NULL,
    `po_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `net_discount` DECIMAL(13, 5) NOT NULL,
    `net_total` DECIMAL(13, 5) NOT NULL,
    `paid_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `payment_status` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('DRAFT', 'COMPLETED', 'PENDING') NOT NULL DEFAULT 'COMPLETED',
    `bill_no` VARCHAR(191) NULL,
    `bill_date` DATE NULL,
    `due_date` DATE NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL,
    `shipping` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `returnedAmount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `margin` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `gate_pass_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `good_receive_po_id_idx`(`po_id`),
    INDEX `good_receive_distributor_id_idx`(`distributor_id`),
    INDEX `good_receive_warehouse_id_idx`(`warehouse_id`),
    INDEX `good_receive_gate_pass_id_idx`(`gate_pass_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_good_receive_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `good_receive_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_cat_id` INTEGER NULL,
    `item_medicine_category` VARCHAR(191) NOT NULL,
    `medicine_type` VARCHAR(191) NOT NULL,
    `medicine_composition` VARCHAR(191) NOT NULL,
    `medicine_unit` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `pack_size` VARCHAR(191) NOT NULL,
    `drug_type` VARCHAR(191) NOT NULL,
    `medicine_type_id` INTEGER NOT NULL,
    `medicine_composition_id` INTEGER NOT NULL,
    `medicine_unit_id` INTEGER NOT NULL,
    `manufacturer_Id` INTEGER NOT NULL,
    `pack_size_id` INTEGER NOT NULL,
    `drug_type_id` INTEGER NOT NULL,
    `mrp` DECIMAL(13, 5) NULL,
    `purchased_price` DECIMAL(13, 5) NOT NULL,
    `foc_quantity` DOUBLE NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `batch_no` VARCHAR(191) NOT NULL,
    `expiry_date` DATE NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `return_quantity` DOUBLE NOT NULL DEFAULT 0,
    `order_quantity` DOUBLE NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `net_amount` DECIMAL(13, 5) NOT NULL,
    `net_discount` DECIMAL(13, 5) NOT NULL,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount_amount` DECIMAL(13, 5) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `good_receive_details_good_receive_id_idx`(`good_receive_id`),
    INDEX `good_receive_details_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item_stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NULL,
    `branch_id` INTEGER NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `is_foc` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `item_stock_branch_id_idx`(`branch_id`),
    INDEX `item_stock_item_id_idx`(`item_id`),
    INDEX `item_stock_warehouse_id_idx`(`warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item_stock_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_stock_id` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `action` ENUM('ADDITION', 'SUBTRACTION', 'UPDATE') NOT NULL,
    `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'STORE_REQUISITION_RETURN', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'STOCK_ADJUSTMENT', 'STOCK_INITIALIZATION', 'EXPIRY_UPDATE') NOT NULL,
    `ref_id` INTEGER NULL,
    `ref_details_id` INTEGER NULL,
    `ref_no` VARCHAR(191) NULL,
    `ref_date` DATE NULL,
    `ref_approved_by` INTEGER NULL,
    `ref_approved_at` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `item_stock_history_item_stock_id_idx`(`item_stock_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_good_receive_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grn_id` INTEGER NOT NULL,
    `po_number` VARCHAR(191) NOT NULL,
    `grn_number` VARCHAR(191) NOT NULL,
    `po_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `net_discount` DECIMAL(13, 5) NULL,
    `net_total` DECIMAL(13, 5) NOT NULL,
    `paid_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `payment_status` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `bill_no` VARCHAR(191) NULL,
    `bill_date` DATE NULL,
    `due_date` DATE NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL,
    `shipping` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `credit_note_type` VARCHAR(191) NOT NULL,
    `credit_note_` DOUBLE NOT NULL,
    `approved_by` INTEGER NULL,
    `approve_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `rejected_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,

    INDEX `good_receive_return_grn_id_idx`(`grn_id`),
    INDEX `good_receive_return_po_id_idx`(`po_id`),
    INDEX `good_receive_return_distributor_id_idx`(`distributor_id`),
    INDEX `good_receive_return_warehouse_id_idx`(`warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_good_receive_return_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `good_receive_return_id` INTEGER NOT NULL,
    `good_receive_detail_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_cat_id` INTEGER NULL,
    `item_medicine_category` VARCHAR(191) NOT NULL,
    `batch_no` VARCHAR(191) NOT NULL,
    `expiry_date` DATE NULL,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `net_amount` DECIMAL(13, 5) NOT NULL,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount` DECIMAL(13, 5) NULL,
    `net_Discount` DECIMAL(13, 5) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `order_quantity` DOUBLE NOT NULL,
    `grn_qty` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `good_receive_return_details_grn_return_id_idx`(`good_receive_return_id`),
    INDEX `good_receive_return_details_item_id_idx`(`item_id`),
    INDEX `good_receive_details_id_idx`(`good_receive_detail_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_stock_transfer` (
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
CREATE TABLE `pms_stock_transfer_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `st_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NOT NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `acknowledged_quantity` DOUBLE NOT NULL DEFAULT 0,
    `return_quantity` DOUBLE NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE `pms_gate_pass` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `distributor_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
    `total_quantity` DOUBLE NOT NULL,
    `po_number` VARCHAR(191) NOT NULL,
    `po_date` DATE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `box_count` INTEGER NOT NULL,
    `bill_amount` DECIMAL(13, 5) NOT NULL,
    `gate_pass_number` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `priority` ENUM('HIGH', 'MEDIUM', 'LOW', 'NORMAL') NULL DEFAULT 'NORMAL',
    `status` ENUM('PENDING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `gate_pass_distributor_id_idx`(`distributor_id`),
    INDEX `gate_pass_warehouse_id_idx`(`warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_email` BOOLEAN NOT NULL DEFAULT true,
    `is_sms` BOOLEAN NOT NULL DEFAULT false,
    `is_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `expiry_in_month` INTEGER NOT NULL,
    `county_code` VARCHAR(191) NULL,
    `slow_moving_time_in_month` INTEGER NULL,
    `batch_size` INTEGER NOT NULL DEFAULT 100,
    `default_precision` INTEGER NOT NULL DEFAULT 2,
    `po_precision` INTEGER NOT NULL DEFAULT 2,
    `item_precision` INTEGER NOT NULL DEFAULT 2,
    `sell_precision` INTEGER NOT NULL DEFAULT 2,
    `grn_precision` INTEGER NOT NULL DEFAULT 2,
    `po_calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'STEP_WISE',
    `grn_calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `sell_calculation_method` ENUM('STEP_WISE', 'FINAL') NOT NULL DEFAULT 'FINAL',
    `grn_rounded_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `sell_rounded_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'ROUND',
    `sell_final_round_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'SPECIAL_ROUND',
    `grn_final_round_format` ENUM('ROUND', 'SPECIAL_ROUND', 'TO_FIXED', 'CEIL', 'FLOOR', 'TRUNC', 'NONE') NOT NULL DEFAULT 'TO_FIXED',
    `default_email_postfix` VARCHAR(191) NULL,
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
CREATE TABLE `pms_sell` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sell_ref_no` VARCHAR(191) NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `staff_id` INTEGER NULL,
    `apt_id` INTEGER NULL,
    `apt_no` VARCHAR(191) NULL,
    `delivery_type` ENUM('OPD', 'IPD', 'WALK_IN') NOT NULL,
    `payment_mode` ENUM('in_percentage', 'in_amount') NULL,
    `is_home_delivery` BOOLEAN NULL DEFAULT false,
    `bill_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customer_id` INTEGER NOT NULL,
    `patient_unique_id` INTEGER NULL,
    `billing_for` ENUM('SELF', 'OTHERS') NOT NULL,
    `insurance_id` INTEGER NULL,
    `patient_insurance_id` INTEGER NULL,
    `corporate_client_id` INTEGER NULL,
    `doctor_id` INTEGER NOT NULL,
    `net_amount` DECIMAL(13, 5) NOT NULL,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `discount_note` VARCHAR(255) NULL,
    `bill_no` VARCHAR(191) NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `paid_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `co_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `customer_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `payment_status` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID', 'REFUND', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('DRAFT', 'COMPLETED', 'PARTIALLY_RETURNED', 'RETURNED') NOT NULL DEFAULT 'COMPLETED',
    `return_status` ENUM('PENDING', 'COMPLETED') NULL,
    `returned_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `total_returned_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `is_stock_adjusted` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `sell_details_cc_id_idx`(`cc_id`),
    INDEX `sell_customer_id_idx`(`customer_id`),
    INDEX `sell_doctor_id_idx`(`doctor_id`),
    INDEX `sell_insurance_id_idx`(`insurance_id`),
    INDEX `sell_patient_insurance_id_idx`(`patient_insurance_id`),
    INDEX `sell_corporate_client_id_idx`(`corporate_client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_sell_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sell_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_category` VARCHAR(191) NOT NULL,
    `medicine_type` VARCHAR(191) NOT NULL,
    `medicine_composition` VARCHAR(191) NOT NULL,
    `medicine_unit` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `pack_size` VARCHAR(191) NOT NULL,
    `drug_type` VARCHAR(191) NOT NULL,
    `item_category_id` INTEGER NOT NULL,
    `medicine_type_id` INTEGER NOT NULL,
    `medicine_composition_id` INTEGER NOT NULL,
    `medicine_unit_id` INTEGER NOT NULL,
    `manufacturer_Id` INTEGER NOT NULL,
    `pack_size_id` INTEGER NOT NULL,
    `drug_type_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NOT NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NOT NULL,
    `mrp` DECIMAL(13, 5) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `return_quantity` DOUBLE NOT NULL DEFAULT 0,
    `net_amount` DECIMAL(13, 5) NOT NULL,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `co_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `customer_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `copayment_value` DECIMAL(65, 30) NULL,
    `copayment_type` ENUM('co_pay', 'in_amount') NULL,
    `co_payment_source` ENUM('MANUAL', 'SETTINGS') NULL,
    `co_pay_modofication_status` ENUM('pending', 'approved', 'rejected') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `sell_details_sell_id_idx`(`sell_id`),
    INDEX `sell_details_item_id_idx`(`item_id`),
    INDEX `sell_details_item_category_id_idx`(`item_category_id`),
    INDEX `sell_details_medicine_type_id_idx`(`medicine_type_id`),
    INDEX `sell_details_medicine_composition_id_idx`(`medicine_composition_id`),
    INDEX `sell_details_medicine_unit_id_idx`(`medicine_unit_id`),
    INDEX `sell_details_manufacturer_id_idx`(`manufacturer_Id`),
    INDEX `sell_details_pack_size_id_idx`(`pack_size_id`),
    INDEX `sell_details_drug_type_id_idx`(`drug_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_sell_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sell_id` INTEGER NOT NULL,
    `sell_number` VARCHAR(191) NOT NULL,
    `sell_return_ref_number` VARCHAR(191) NULL,
    `cc_id` INTEGER NOT NULL,
    `staff_id` INTEGER NULL,
    `apt_id` INTEGER NULL,
    `apt_no` VARCHAR(191) NULL,
    `delivery_type` ENUM('OPD', 'IPD', 'WALK_IN') NOT NULL,
    `payment_mode` ENUM('in_percentage', 'in_amount') NULL,
    `is_home_delivery` BOOLEAN NULL DEFAULT false,
    `bill_date` DATETIME(3) NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `patient_unique_id` INTEGER NULL,
    `billing_for` ENUM('SELF', 'OTHERS') NOT NULL,
    `insurance_id` INTEGER NULL,
    `patient_insurance_id` INTEGER NULL,
    `corporate_client_id` INTEGER NULL,
    `doctor_id` INTEGER NOT NULL,
    `return_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `discount_note` VARCHAR(255) NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_amount` DECIMAL(13, 5) NOT NULL,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `paid_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `credit_note_no` VARCHAR(191) NULL,
    `co_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `customer_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `payment_status` ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID', 'REFUND', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `rejected_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,

    INDEX `sell_return_details_cc_id_idx`(`cc_id`),
    INDEX `sell_return_customer_id_idx`(`customer_id`),
    INDEX `sell_return_doctor_id_idx`(`doctor_id`),
    INDEX `sell_return_ins_id_idx`(`insurance_id`),
    INDEX `sell_return_patient_ins_id_idx`(`patient_insurance_id`),
    INDEX `sell_return_corp_cli_id_idx`(`corporate_client_id`),
    INDEX `sell_return_sell_id_idx`(`sell_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_sell_return_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sell_return_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `sell_details_id` INTEGER NOT NULL,
    `item_category` VARCHAR(191) NOT NULL,
    `medicine_type` VARCHAR(191) NOT NULL,
    `medicine_composition` VARCHAR(191) NOT NULL,
    `medicine_unit` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `pack_size` VARCHAR(191) NOT NULL,
    `drug_type` VARCHAR(191) NOT NULL,
    `item_category_id` INTEGER NOT NULL,
    `medicine_type_id` INTEGER NOT NULL,
    `medicine_composition_id` INTEGER NOT NULL,
    `medicine_unit_id` INTEGER NOT NULL,
    `manufacturer_Id` INTEGER NOT NULL,
    `pack_size_id` INTEGER NOT NULL,
    `drug_type_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NOT NULL,
    `is_foc` BOOLEAN NOT NULL,
    `expiry_date` DATE NOT NULL,
    `mrp` DECIMAL(13, 5) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `net_amount` DECIMAL(13, 5) NOT NULL,
    `sell_quantity` DOUBLE NOT NULL DEFAULT 0,
    `discount_method` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_discount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `net_tax` DECIMAL(13, 5) NOT NULL,
    `total_amount` DECIMAL(13, 5) NOT NULL,
    `co_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `customer_pay_amount` DECIMAL(13, 5) NOT NULL DEFAULT 0,
    `co_pay_payment_value` DECIMAL(65, 30) NULL,
    `co_pay_payment_type` ENUM('co_pay', 'in_amount') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `sell_details_sell_return_id_idx`(`sell_return_id`),
    INDEX `sell_details_id_sell_return_id_idx`(`sell_details_id`),
    INDEX `sell_return_details_item_id_idx`(`item_id`),
    INDEX `sell_return_details_item_category_id_idx`(`item_category_id`),
    INDEX `sell_return_details_medicine_type_id_idx`(`medicine_type_id`),
    INDEX `sell_return_details_medicine_composition_id_idx`(`medicine_composition_id`),
    INDEX `sell_return_details_medicine_unit_id_idx`(`medicine_unit_id`),
    INDEX `sell_return_details_manufacturer_id_idx`(`manufacturer_Id`),
    INDEX `sell_return_details_pack_size_id_idx`(`pack_size_id`),
    INDEX `sell_return_details_drug_type_id_idx`(`drug_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_branch_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `default_disc` DECIMAL(13, 5) NULL,
    `default_b2b_disc` DECIMAL(13, 5) NULL,
    `tax` DECIMAL(13, 5) NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NULL,
    `purchase_amount` DECIMAL(13, 5) NULL,
    `sale_amount` DECIMAL(13, 5) NULL,
    `insurance_percentage` DECIMAL(13, 5) NULL,
    `walk_in_percentage` DECIMAL(13, 5) NULL,
    `on_hold_sale` DATE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    INDEX `branch_sell_amount_item_id_idx`(`item_id`),
    INDEX `branch_sell_amount_branch_id_idx`(`branch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_in_transit_stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_id` INTEGER NOT NULL,
    `to_Id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `batch_no` VARCHAR(191) NOT NULL,
    `expiry_date` DATE NULL,
    `is_foc` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `in_transit_stock_from_id_idx`(`from_id`),
    INDEX `in_transit_stock_to_id_idx`(`to_Id`),
    INDEX `in_transit_stock_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_in_transit_stock_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inTransitStockId` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `action` ENUM('ADDITION', 'SUBTRACTION', 'UPDATE') NOT NULL,
    `operation` ENUM('GOOD_RECEIVE', 'GOOD_RECEIVE_RETURN', 'STORE_REQUISITION', 'STORE_REQUISITION_RETURN', 'SELL', 'SELL_RETURN', 'STOCK_TRANSFER', 'GRN_RETURN_APPROVAL', 'SELL_RETURN_APPROVAL', 'STOCK_ADJUSTMENT', 'STOCK_INITIALIZATION', 'EXPIRY_UPDATE') NOT NULL,
    `ref_id` INTEGER NULL,
    `ref_details_id` INTEGER NULL,
    `ref_no` VARCHAR(191) NULL,
    `ref_date` DATE NULL,
    `ref_approved_by` INTEGER NULL,
    `ref_approved_at` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `item_stock_history_in_transit_stock_id_idx`(`inTransitStockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_storage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pharmacy_insurer_payment_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insurance_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `type` ENUM('Pharmacy') NOT NULL DEFAULT 'Pharmacy',
    `med_id` INTEGER NOT NULL,
    `mrp` DECIMAL(10, 2) NOT NULL,
    `insurance_percentage` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `payment_mode` ENUM('co_pay', 'in_amount') NOT NULL,
    `payment_value` DECIMAL(10, 2) NOT NULL,
    `co_pay` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `patient_pay` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pharmacy_insurer_payment_settings_insurance_id_idx`(`insurance_id`),
    INDEX `pharmacy_insurer_payment_settings_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_item_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `row_no` INTEGER NULL,
    `item_number` VARCHAR(191) NULL,
    `medicine_name` VARCHAR(191) NOT NULL,
    `medicine_category` VARCHAR(191) NOT NULL,
    `medicine_type` VARCHAR(191) NOT NULL,
    `medicine_composition` VARCHAR(191) NOT NULL,
    `medicine_unit` VARCHAR(191) NOT NULL,
    `box_size` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `min_order_details` VARCHAR(191) NULL,
    `rack_location` VARCHAR(191) NULL,
    `default_disc` DECIMAL(13, 5) NOT NULL,
    `default_b2b_disc` DECIMAL(13, 5) NOT NULL,
    `is_lock_disc` BOOLEAN NOT NULL DEFAULT false,
    `is_lock_b2b_disc` BOOLEAN NOT NULL DEFAULT false,
    `min_stock` INTEGER NOT NULL,
    `max_stock` INTEGER NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `pack_size` VARCHAR(191) NOT NULL,
    `drug_type` VARCHAR(191) NOT NULL,
    `is_allow_loose_sale` BOOLEAN NOT NULL DEFAULT false,
    `accept_online_order` BOOLEAN NOT NULL DEFAULT true,
    `is_returnable` BOOLEAN NOT NULL DEFAULT true,
    `is_suggestion_lock` BOOLEAN NOT NULL DEFAULT false,
    `cess` DOUBLE NULL,
    `hsn_code` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    `purchase_amount` DECIMAL(13, 5) NOT NULL,
    `sale_amount` DECIMAL(13, 5) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `on_hold_sale` DATE NULL,
    `medicine_pack_type` ENUM('Tube', 'Strip', 'Bottle', 'Box', 'Sachet', 'Packet', 'Jar', 'Others') NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `item_alias` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `insurance_percentage` DECIMAL(13, 5) NOT NULL,
    `walk_in_percentage` DECIMAL(13, 5) NOT NULL,
    `batch_job_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `quantity` INTEGER NULL,

    INDEX `item_excel_batch_job_id_idx`(`batch_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_batch_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ITEM', 'ITEM_PRICING') NOT NULL,
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
CREATE TABLE `pms_batch_job_details` (
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
CREATE TABLE `core_approval_flow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service` VARCHAR(191) NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `flow_type` ENUM('STATUS', 'CO_PAY', 'INDIVIDUAL_DISCOUNT', 'OVERALL_DISCOUNT', 'SPECIAL_DISCOUNT', 'REFUND') NOT NULL DEFAULT 'STATUS',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_approval_step` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flow_id` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `min_amount` DECIMAL(65, 30) NULL,
    `max_amount` DECIMAL(65, 30) NULL,
    `step_type` ENUM('MIN_MAX', 'NORMAL') NOT NULL DEFAULT 'MIN_MAX',
    `config` JSON NULL,
    `child_config` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `approval_step_flow_id_idx`(`flow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_approval_step_cc_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `step_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `approval_step_cc_mapping_step_id_idx`(`step_id`),
    INDEX `approval_step_cc_mapping_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_approver_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NULL,
    `step_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `role_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `approver_mapping_staff_id_idx`(`staff_id`),
    INDEX `approver_mapping_step_id_idx`(`step_id`),
    INDEX `approver_mapping_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_approval_instance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flow_id` INTEGER NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `ref_no` VARCHAR(191) NULL,
    `current_step` INTEGER NOT NULL,
    `net_total` DECIMAL(65, 30) NULL,
    `status` ENUM('PENDING', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `extra` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `approval_instance_flow_id_idx`(`flow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_approval_action` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instance_id` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `acted_by` INTEGER NOT NULL,
    `status_after` ENUM('PENDING', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL,
    `comment` VARCHAR(191) NULL,
    `acted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `approval_action_approval_instance_id_idx`(`instance_id`),
    INDEX `approval_action_acted_by_idx`(`acted_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_child_common_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `child_id` INTEGER NOT NULL,
    `parent_id` INTEGER NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `discount_value` DECIMAL(13, 5) NULL,
    `discount_type` ENUM('FIXED', 'PERCENTAGE') NULL,
    `discount_amount` DECIMAL(13, 5) NULL,
    `co_pay_value` DECIMAL(13, 5) NULL,
    `co_pay_type` ENUM('FIXED', 'PERCENTAGE') NULL,
    `co_pay_amount` DECIMAL(13, 5) NULL,
    `co_pay_modofication_status` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_parent_common_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `refund_amount` DECIMAL(13, 5) NULL,
    `discount_type` ENUM('FIXED', 'PERCENTAGE') NULL,
    `discount_value` DECIMAL(13, 5) NULL,
    `discount_amount` DECIMAL(13, 5) NULL,
    `due_amount` DECIMAL(13, 5) NULL,
    `gross_amount` DECIMAL(13, 5) NULL,
    `net_amount` DECIMAL(13, 5) NULL,
    `total_copayment_amount` DECIMAL(13, 5) NULL,
    `is_approved` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `payment_status` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_branch_item_map_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `from_Branch` INTEGER NULL,
    `to_Branch` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `action_by` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_branch_item_map_audit_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `audit_id` INTEGER NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `change_from` VARCHAR(191) NULL,
    `change_to` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `branch_item_map_audit_details_audit_id_idx`(`audit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_branch_item_map_excel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `row_no` INTEGER NULL,
    `branch_id` INTEGER NOT NULL,
    `branch_map` VARCHAR(191) NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_number` VARCHAR(191) NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `item_category` VARCHAR(191) NOT NULL,
    `default_disc` DECIMAL(13, 5) NOT NULL,
    `default_b2b_disc` DECIMAL(13, 5) NOT NULL,
    `tax` DECIMAL(13, 5) NOT NULL,
    `tax_method` ENUM('INCLUSIVE', 'EXCLUSIVE') NOT NULL,
    `purchase_amount` DECIMAL(13, 5) NOT NULL,
    `sale_amount` DECIMAL(13, 5) NOT NULL,
    `insurance_percentage` DECIMAL(13, 5) NOT NULL,
    `walk_in_percentage` DECIMAL(13, 5) NOT NULL,
    `on_hold_sale` DATE NULL,
    `batch_job_id` INTEGER NOT NULL,

    INDEX `branch_item_map_excel_batch_job_id_idx`(`batch_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `core_printer_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `printer_name` VARCHAR(191) NOT NULL,
    `printer_type` ENUM('THERMAL', 'LASER', 'BARCODE', 'LABEL', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
    `printer_width` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `printer_settings_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pharmacy_client_payment_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `cc_id` INTEGER NOT NULL,
    `type` ENUM('Pharmacy') NOT NULL DEFAULT 'Pharmacy',
    `med_id` INTEGER NOT NULL,
    `payment_mode` ENUM('Exclude', 'Include') NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pharmacy_client_payment_settings_client_id_idx`(`client_id`),
    INDEX `pharmacy_client_payment_settings_cc_id_idx`(`cc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_feature_flag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(191) NOT NULL,
    `flag_name` VARCHAR(191) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL,
    `description` LONGTEXT NOT NULL,
    `feature_config` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_migration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ref_type` ENUM('SELL_NO', 'APPOINTMENT_NO') NOT NULL,
    `ref_no` VARCHAR(191) NOT NULL,
    `migration_type` ENUM('CO_PAY') NOT NULL,
    `ref` JSON NOT NULL,
    `ref_details` JSON NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_branch_category_map` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `branch_category_map_branch_id_idx`(`branch_id`),
    INDEX `branch_category_map_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_stock_adjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cc_id` INTEGER NOT NULL,
    `branch_id` INTEGER NULL,
    `warehouse_id` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `ref_no` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `status` ENUM('DRAFT', 'COMPLETED') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `stock_adjustment_cc_id_idx`(`cc_id`),
    INDEX `stock_adjustment_branch_id_idx`(`branch_id`),
    INDEX `stock_adjustment_warehouse_id_idx`(`warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_stock_adjustment_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock_adjustment_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `batch_no` VARCHAR(191) NULL,
    `expiry_date` DATE NULL,
    `is_foc` BOOLEAN NULL DEFAULT false,
    `quantity` INTEGER NOT NULL,
    `adjust_type` ENUM('ADDITION', 'SUBTRACTION', 'UPDATE') NOT NULL,
    `available_qty` INTEGER NULL,
    `batch_id` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    INDEX `stock_adjustment_details_stock_adjustment_id_idx`(`stock_adjustment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_auto_alert_email` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` ENUM('LOW_STOCK', 'EXPIRED_ITEMS', 'EXPIRING_ITEMS') NOT NULL,
    `to` TEXT NOT NULL,
    `cc` TEXT NULL,
    `bcc` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pms_auto_alert_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipient_id` INTEGER NULL,
    `run_date` DATETIME(3) NOT NULL,
    `delivery_method` ENUM('EMAIL', 'SMS', 'WHATSAPP') NOT NULL,
    `alert_type` ENUM('LOW_STOCK', 'EXPIRED_ITEMS', 'EXPIRING_ITEMS') NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `error_msg` TEXT NULL,
    `is_resend` BOOLEAN NOT NULL DEFAULT false,
    `resend_master_id` INTEGER NULL,
    `success_date` DATETIME(3) NULL,
    `alert_mode` ENUM('SYSTEM', 'MANUAL') NOT NULL DEFAULT 'SYSTEM',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    INDEX `auto_alert_audit_recipient_id_idx`(`recipient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `master_state` ADD CONSTRAINT `master_state_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`num_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_city` ADD CONSTRAINT `master_city_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `master_state`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_city` ADD CONSTRAINT `master_city_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`num_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_country_code` ADD CONSTRAINT `core_country_code_country_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`num_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_collection_center` ADD CONSTRAINT `staff_collection_center_collection_center_id_fkey` FOREIGN KEY (`collection_center_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_collection_center` ADD CONSTRAINT `staff_collection_center_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_staff_employee` ADD CONSTRAINT `core_staff_employee_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_staff_employee` ADD CONSTRAINT `core_staff_employee_designation_id_fkey` FOREIGN KEY (`designation_id`) REFERENCES `staff_designation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_staff_employee` ADD CONSTRAINT `core_staff_employee_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_service_event_config` ADD CONSTRAINT `core_service_event_config_service_event_id_fkey` FOREIGN KEY (`service_event_id`) REFERENCES `core_service_event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_event_config_key` ADD CONSTRAINT `core_event_config_key_event_config_id_fkey` FOREIGN KEY (`event_config_id`) REFERENCES `core_service_event_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_event_recipient_rule` ADD CONSTRAINT `core_event_recipient_rule_event_config_id_fkey` FOREIGN KEY (`event_config_id`) REFERENCES `core_service_event_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_event_delivery` ADD CONSTRAINT `core_event_delivery_event_config_id_fkey` FOREIGN KEY (`event_config_id`) REFERENCES `core_service_event_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_event_delivery` ADD CONSTRAINT `core_event_delivery_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `core_service_event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_event_delivery_item` ADD CONSTRAINT `core_event_delivery_item_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `core_event_delivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_template` ADD CONSTRAINT `core_template_event_config_id_fkey` FOREIGN KEY (`event_config_id`) REFERENCES `core_service_event_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `income` ADD CONSTRAINT `income_inc_head_id_fkey` FOREIGN KEY (`inc_head_id`) REFERENCES `income_head`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_exp_head_id_fkey` FOREIGN KEY (`exp_head_id`) REFERENCES `expense_head`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patients_insurance` ADD CONSTRAINT `patients_insurance_insurer_id_fkey` FOREIGN KEY (`insurer_id`) REFERENCES `insurer_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patients_insurance` ADD CONSTRAINT `patients_insurance_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurer_business_mapping` ADD CONSTRAINT `insurer_business_mapping_insurer_id_fkey` FOREIGN KEY (`insurer_id`) REFERENCES `insurer_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_store` ADD CONSTRAINT `inv_item_store_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_supplier` ADD CONSTRAINT `inv_item_supplier_tax_details_id_fkey` FOREIGN KEY (`tax_details_id`) REFERENCES `inv_tax_details`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_tax_identification_details` ADD CONSTRAINT `inv_tax_identification_details_itemSupplierId_fkey` FOREIGN KEY (`itemSupplierId`) REFERENCES `inv_item_supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_bank_details` ADD CONSTRAINT `inv_bank_details_itemSupplierId_fkey` FOREIGN KEY (`itemSupplierId`) REFERENCES `inv_item_supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_purchase_order` ADD CONSTRAINT `inv_purchase_order_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `inv_item_supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_purchase_order` ADD CONSTRAINT `inv_purchase_order_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `inv_item_store`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_purchase_order` ADD CONSTRAINT `inv_purchase_order_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_purchase_order_details` ADD CONSTRAINT `inv_purchase_order_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_purchase_order_details` ADD CONSTRAINT `inv_purchase_order_details_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `inv_purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_master` ADD CONSTRAINT `inv_item_master_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `inv_item_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_master` ADD CONSTRAINT `inv_item_master_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `inv_unit_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_master` ADD CONSTRAINT `inv_item_master_tax_details_id_fkey` FOREIGN KEY (`tax_details_id`) REFERENCES `inv_tax_details`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_master` ADD CONSTRAINT `inv_item_master_storage_id_fkey` FOREIGN KEY (`storage_id`) REFERENCES `inv_storage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_supplier_mapping` ADD CONSTRAINT `inv_item_supplier_mapping_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_supplier_mapping` ADD CONSTRAINT `inv_item_supplier_mapping_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `inv_item_supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_supplier_mapping` ADD CONSTRAINT `inv_item_supplier_mapping_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_branch` ADD CONSTRAINT `inv_branch_id_fkey` FOREIGN KEY (`id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_warehouse` ADD CONSTRAINT `inv_warehouse_id_fkey` FOREIGN KEY (`id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_adjustment` ADD CONSTRAINT `inv_stock_adjustment_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_adjustment` ADD CONSTRAINT `inv_stock_adjustment_target_cc_id_fkey` FOREIGN KEY (`target_cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_stock_adjustment_details` ADD CONSTRAINT `inv_stock_adjustment_details_stock_adjustment_id_fkey` FOREIGN KEY (`stock_adjustment_id`) REFERENCES `inv_stock_adjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_batch_job_details` ADD CONSTRAINT `inv_batch_job_details_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `inv_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_supplier_map_audit_details` ADD CONSTRAINT `inv_item_supplier_map_audit_details_audit_id_fkey` FOREIGN KEY (`audit_id`) REFERENCES `inv_item_supplier_map_audit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive` ADD CONSTRAINT `inv_good_receive_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `inv_purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive` ADD CONSTRAINT `inv_good_receive_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `inv_item_supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive` ADD CONSTRAINT `inv_good_receive_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `inv_item_store`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive` ADD CONSTRAINT `inv_good_receive_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_details` ADD CONSTRAINT `inv_good_receive_details_good_receive_id_fkey` FOREIGN KEY (`good_receive_id`) REFERENCES `inv_good_receive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_details` ADD CONSTRAINT `inv_good_receive_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return` ADD CONSTRAINT `inv_good_receive_return_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `inv_good_receive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return` ADD CONSTRAINT `inv_good_receive_return_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `inv_purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return` ADD CONSTRAINT `inv_good_receive_return_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return` ADD CONSTRAINT `inv_good_receive_return_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `inv_item_supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return_details` ADD CONSTRAINT `inv_good_receive_return_details_good_receive_return_id_fkey` FOREIGN KEY (`good_receive_return_id`) REFERENCES `inv_good_receive_return`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return_details` ADD CONSTRAINT `inv_good_receive_return_details_good_receive_detail_id_fkey` FOREIGN KEY (`good_receive_detail_id`) REFERENCES `inv_good_receive_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_good_receive_return_details` ADD CONSTRAINT `inv_good_receive_return_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_stock` ADD CONSTRAINT `inv_item_stock_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_stock` ADD CONSTRAINT `inv_item_stock_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_item_stock_audit` ADD CONSTRAINT `inv_item_stock_audit_item_stock_id_fkey` FOREIGN KEY (`item_stock_id`) REFERENCES `inv_item_stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_store_requisition_details` ADD CONSTRAINT `inv_store_requisition_details_store_requisition_id_fkey` FOREIGN KEY (`store_requisition_id`) REFERENCES `inv_store_requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_store_requisition_details` ADD CONSTRAINT `inv_store_requisition_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_requisition_item_details` ADD CONSTRAINT `inv_requisition_item_details_store_requisition_id_fkey` FOREIGN KEY (`store_requisition_id`) REFERENCES `inv_store_requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_requisition_item_details` ADD CONSTRAINT `inv_requisition_item_details_store_requisition_details_id_fkey` FOREIGN KEY (`store_requisition_details_id`) REFERENCES `inv_store_requisition_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_requisition_item_details` ADD CONSTRAINT `inv_requisition_item_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_requisition_item_details` ADD CONSTRAINT `inv_requisition_item_details_item_stock_id_fkey` FOREIGN KEY (`item_stock_id`) REFERENCES `inv_item_stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_requisition_item_details` ADD CONSTRAINT `inv_requisition_item_details_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `inv_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_requisition_item_details` ADD CONSTRAINT `inv_requisition_item_details_ack_cc_id_fkey` FOREIGN KEY (`ack_cc_id`) REFERENCES `inv_branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_in_transit_stock` ADD CONSTRAINT `inv_in_transit_stock_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_in_transit_stock` ADD CONSTRAINT `inv_in_transit_stock_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_in_transit_stock` ADD CONSTRAINT `inv_in_transit_stock_to_id_idx` FOREIGN KEY (`to_Id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_in_transit_stock_audit` ADD CONSTRAINT `inv_in_transit_stock_audit_inTransitStockId_fkey` FOREIGN KEY (`inTransitStockId`) REFERENCES `inv_in_transit_stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_consumption` ADD CONSTRAINT `inv_consumption_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_consumption_details` ADD CONSTRAINT `inv_consumption_details_consumption_id_fkey` FOREIGN KEY (`consumption_id`) REFERENCES `inv_consumption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_consumption_details` ADD CONSTRAINT `inv_consumption_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inv_item_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_doctor_schedule` ADD CONSTRAINT `nopd_doctor_schedule_doc_id_fkey` FOREIGN KEY (`doc_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_doctor_schedule` ADD CONSTRAINT `nopd_doctor_schedule_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_consultation` ADD CONSTRAINT `nopd_patient_consultation_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_consultation` ADD CONSTRAINT `nopd_patient_consultation_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_complaints` ADD CONSTRAINT `nopd_consultation_complaints_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_complaints` ADD CONSTRAINT `nopd_consultation_complaints_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_advice_details` ADD CONSTRAINT `nopd_patient_advice_details_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_advice_details` ADD CONSTRAINT `nopd_patient_advice_details_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_department_prefix` ADD CONSTRAINT `nopd_department_prefix_opd_department_id_fkey` FOREIGN KEY (`opd_department_id`) REFERENCES `nopd_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_clinical_history` ADD CONSTRAINT `nopd_clinical_history_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_clinical_history` ADD CONSTRAINT `nopd_clinical_history_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_time_slot` ADD CONSTRAINT `nopd_time_slot_doc_id_fkey` FOREIGN KEY (`doc_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_time_slot` ADD CONSTRAINT `nopd_time_slot_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_appointments` ADD CONSTRAINT `nopd_appointments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_appointments` ADD CONSTRAINT `nopd_appointments_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_appointments` ADD CONSTRAINT `nopd_appointments_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_appointments` ADD CONSTRAINT `nopd_appointments_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_appointments` ADD CONSTRAINT `nopd_appointments_insurance_id_fkey` FOREIGN KEY (`insurance_id`) REFERENCES `insurer_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_appointments` ADD CONSTRAINT `nopd_appointments_patient_insurance_id_fkey` FOREIGN KEY (`patient_insurance_id`) REFERENCES `patients_insurance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_documents` ADD CONSTRAINT `nopd_patient_documents_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_documents` ADD CONSTRAINT `nopd_patient_documents_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_refer_to_doctor` ADD CONSTRAINT `nopd_patient_refer_to_doctor_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_refer_to_doctor` ADD CONSTRAINT `nopd_patient_refer_to_doctor_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_refer_to_doctor` ADD CONSTRAINT `nopd_patient_refer_to_doctor_opd_department_id_fkey` FOREIGN KEY (`opd_department_id`) REFERENCES `nopd_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_refer_to_doctor` ADD CONSTRAINT `nopd_patient_refer_to_doctor_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_follow_up` ADD CONSTRAINT `nopd_patient_follow_up_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_follow_up` ADD CONSTRAINT `nopd_patient_follow_up_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_follow_up` ADD CONSTRAINT `nopd_patient_follow_up_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_chips_button_mapping` ADD CONSTRAINT `nopd_chips_button_mapping_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_icd_ten_list` ADD CONSTRAINT `nopd_consultation_icd_ten_list_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_icd_ten_list` ADD CONSTRAINT `nopd_consultation_icd_ten_list_icd_ten_id_fkey` FOREIGN KEY (`icd_ten_id`) REFERENCES `icd_ten_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_icd_ten_list` ADD CONSTRAINT `nopd_consultation_icd_ten_list_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_notes_mapping` ADD CONSTRAINT `nopd_consultation_notes_mapping_consultation_notes_id_fkey` FOREIGN KEY (`consultation_notes_id`) REFERENCES `nopd_consultation_notes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation_notes_mapping` ADD CONSTRAINT `nopd_consultation_notes_mapping_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_insurer_payment_settings` ADD CONSTRAINT `opd_insurer_payment_settings_insurer_id_fkey` FOREIGN KEY (`insurer_id`) REFERENCES `insurer_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_insurer_payment_settings` ADD CONSTRAINT `opd_insurer_payment_settings_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_client_master_settings` ADD CONSTRAINT `opd_client_master_settings_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_client_master_settings` ADD CONSTRAINT `opd_client_master_settings_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation` ADD CONSTRAINT `nopd_consultation_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_consultation` ADD CONSTRAINT `nopd_consultation_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_test_categories` ADD CONSTRAINT `nopd_test_categories_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_tests` ADD CONSTRAINT `nopd_tests_test_category_id_fkey` FOREIGN KEY (`test_category_id`) REFERENCES `nopd_test_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_tests` ADD CONSTRAINT `nopd_tests_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `pathology_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_test` ADD CONSTRAINT `nopd_patient_test_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_test` ADD CONSTRAINT `nopd_patient_test_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_test` ADD CONSTRAINT `nopd_patient_test_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `pathology_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_test` ADD CONSTRAINT `nopd_patient_test_process_location_fkey` FOREIGN KEY (`process_location`) REFERENCES `sch_collection_center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_procedure_master` ADD CONSTRAINT `nopd_procedure_master_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure` ADD CONSTRAINT `nopd_patient_procedure_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure` ADD CONSTRAINT `nopd_patient_procedure_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure` ADD CONSTRAINT `nopd_patient_procedure_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure` ADD CONSTRAINT `nopd_patient_procedure_insurance_id_fkey` FOREIGN KEY (`insurance_id`) REFERENCES `insurer_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure` ADD CONSTRAINT `nopd_patient_procedure_patient_insurance_id_fkey` FOREIGN KEY (`patient_insurance_id`) REFERENCES `patients_insurance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure` ADD CONSTRAINT `nopd_patient_procedure_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure_details` ADD CONSTRAINT `nopd_patient_procedure_details_patient_procedure_id_fkey` FOREIGN KEY (`patient_procedure_id`) REFERENCES `nopd_patient_procedure`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_procedure_details` ADD CONSTRAINT `nopd_patient_procedure_details_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `nopd_procedure_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_financial_change_request` ADD CONSTRAINT `core_financial_change_request_referenceId_fkey` FOREIGN KEY (`referenceId`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_medicine_tab` ADD CONSTRAINT `nopd_medicine_tab_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_medicine_tab_details` ADD CONSTRAINT `nopd_medicine_tab_details_medicine_tab_id_fkey` FOREIGN KEY (`medicine_tab_id`) REFERENCES `nopd_medicine_tab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_medicine` ADD CONSTRAINT `nopd_patient_medicine_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_medicine` ADD CONSTRAINT `nopd_patient_medicine_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `nopd_appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_patient_medicine_detail` ADD CONSTRAINT `nopd_patient_medicine_detail_master_id_fkey` FOREIGN KEY (`master_id`) REFERENCES `nopd_patient_medicine`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_payment_transactions` ADD CONSTRAINT `nopd_payment_transactions_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_payment_transactions` ADD CONSTRAINT `nopd_payment_transactions_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_payment_transactions` ADD CONSTRAINT `nopd_payment_transactions_collector_id_fkey` FOREIGN KEY (`collector_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_payment_transactions` ADD CONSTRAINT `nopd_payment_transactions_bank_head_id_fkey` FOREIGN KEY (`bank_head_id`) REFERENCES `cash_n_bank_head`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_payment_transactions` ADD CONSTRAINT `nopd_payment_transactions_mobile_money_method_id_fkey` FOREIGN KEY (`mobile_money_method_id`) REFERENCES `mobile_money_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_bill_pricing` ADD CONSTRAINT `nopd_general_bill_pricing_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_bill_pricing` ADD CONSTRAINT `nopd_general_bill_pricing_general_bill_item_id_fkey` FOREIGN KEY (`general_bill_item_id`) REFERENCES `nopd_general_bill_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_batch_job_details` ADD CONSTRAINT `nopd_batch_job_details_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `nopd_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_bill_pricing_excel` ADD CONSTRAINT `nopd_general_bill_pricing_excel_batch_job_id_fkey` FOREIGN KEY (`batch_job_id`) REFERENCES `nopd_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_billing` ADD CONSTRAINT `nopd_general_billing_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_billing` ADD CONSTRAINT `nopd_general_billing_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_billing_details` ADD CONSTRAINT `nopd_general_billing_details_general_billing_id_fkey` FOREIGN KEY (`general_billing_id`) REFERENCES `nopd_general_billing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nopd_general_billing_details` ADD CONSTRAINT `nopd_general_billing_details_general_bill_item_id_fkey` FOREIGN KEY (`general_bill_item_id`) REFERENCES `nopd_general_bill_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_medicine_category_id_fkey` FOREIGN KEY (`medicine_category_id`) REFERENCES `pms_med_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_medicine_type_id_fkey` FOREIGN KEY (`medicine_type_id`) REFERENCES `pms_medicine_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_medicine_composition_id_fkey` FOREIGN KEY (`medicine_composition_id`) REFERENCES `pms_med_composition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_medicine_unit_id_fkey` FOREIGN KEY (`medicine_unit_id`) REFERENCES `pms_med_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_pack_size_id_fkey` FOREIGN KEY (`pack_size_id`) REFERENCES `pms_med_package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_drug_type_id_fkey` FOREIGN KEY (`drug_type_id`) REFERENCES `pms_med_drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_manufacturer_id_fkey` FOREIGN KEY (`manufacturer_id`) REFERENCES `pms_manufacture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_storage_id_fkey` FOREIGN KEY (`storage_id`) REFERENCES `pms_storage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item` ADD CONSTRAINT `pms_item_box_size_id_fkey` FOREIGN KEY (`box_size_id`) REFERENCES `pms_box_size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_dosage_map` ADD CONSTRAINT `pms_item_dosage_map_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_dosage_map` ADD CONSTRAINT `pms_item_dosage_map_dosage_id_fkey` FOREIGN KEY (`dosage_id`) REFERENCES `pms_medicine_dosage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_images` ADD CONSTRAINT `pms_item_images_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_warehouse` ADD CONSTRAINT `pms_warehouse_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`num_code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_warehouse` ADD CONSTRAINT `pms_warehouse_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `master_city`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_warehouse` ADD CONSTRAINT `pms_warehouse_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `master_state`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_warehouse` ADD CONSTRAINT `pms_warehouse_id_fkey` FOREIGN KEY (`id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_tax_identification_details` ADD CONSTRAINT `pms_tax_identification_details_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `pms_distributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch` ADD CONSTRAINT `pms_branch_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`num_code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch` ADD CONSTRAINT `pms_branch_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `master_city`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch` ADD CONSTRAINT `pms_branch_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `master_state`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch` ADD CONSTRAINT `pms_branch_id_fkey` FOREIGN KEY (`id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_instruction_map` ADD CONSTRAINT `pms_item_instruction_map_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_instruction_map` ADD CONSTRAINT `pms_item_instruction_map_instruction_id_fkey` FOREIGN KEY (`instruction_id`) REFERENCES `pms_medicine_instruction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store` ADD CONSTRAINT `pms_store_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store` ADD CONSTRAINT `pms_store_wearHouse_id_fkey` FOREIGN KEY (`wearHouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_purchase_order` ADD CONSTRAINT `pms_purchase_order_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `pms_distributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_purchase_order` ADD CONSTRAINT `pms_purchase_order_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_purchase_order` ADD CONSTRAINT `pms_purchase_order_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `pms_storage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `pms_purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_item_cat_id_fkey` FOREIGN KEY (`item_cat_id`) REFERENCES `pms_med_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_medicine_type_id_fkey` FOREIGN KEY (`medicine_type_id`) REFERENCES `pms_medicine_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_medicine_composition_id_fkey` FOREIGN KEY (`medicine_composition_id`) REFERENCES `pms_med_composition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_medicine_unit_id_fkey` FOREIGN KEY (`medicine_unit_id`) REFERENCES `pms_med_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_manufacturer_Id_fkey` FOREIGN KEY (`manufacturer_Id`) REFERENCES `pms_manufacture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_pack_size_id_fkey` FOREIGN KEY (`pack_size_id`) REFERENCES `pms_med_package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_po_details` ADD CONSTRAINT `pms_po_details_drug_type_id_fkey` FOREIGN KEY (`drug_type_id`) REFERENCES `pms_med_drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_medicine_distributor_map` ADD CONSTRAINT `pms_medicine_distributor_map_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_medicine_distributor_map` ADD CONSTRAINT `pms_medicine_distributor_map_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `pms_distributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition` ADD CONSTRAINT `pms_store_requisition_req_from_fkey` FOREIGN KEY (`req_from`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition` ADD CONSTRAINT `pms_store_requisition_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition` ADD CONSTRAINT `pms_store_requisition_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_store_requisition_id_fkey` FOREIGN KEY (`store_requisition_id`) REFERENCES `pms_store_requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `pms_med_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_medicine_type_id_fkey` FOREIGN KEY (`medicine_type_id`) REFERENCES `pms_medicine_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_medicine_composition_id_fkey` FOREIGN KEY (`medicine_composition_id`) REFERENCES `pms_med_composition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_medicine_unit_id_fkey` FOREIGN KEY (`medicine_unit_id`) REFERENCES `pms_med_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_manufacturer_Id_fkey` FOREIGN KEY (`manufacturer_Id`) REFERENCES `pms_manufacture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_pack_size_id_fkey` FOREIGN KEY (`pack_size_id`) REFERENCES `pms_med_package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_details` ADD CONSTRAINT `pms_store_requisition_details_drug_type_id_fkey` FOREIGN KEY (`drug_type_id`) REFERENCES `pms_med_drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_item_details` ADD CONSTRAINT `pms_requisition_item_details_store_requisition_id_fkey` FOREIGN KEY (`store_requisition_id`) REFERENCES `pms_store_requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_item_details` ADD CONSTRAINT `pms_requisition_item_details_store_requisition_details_id_fkey` FOREIGN KEY (`store_requisition_details_id`) REFERENCES `pms_store_requisition_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_item_details` ADD CONSTRAINT `pms_requisition_item_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_item_details` ADD CONSTRAINT `pms_requisition_item_details_item_stock_id_fkey` FOREIGN KEY (`item_stock_id`) REFERENCES `pms_item_stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_item_details` ADD CONSTRAINT `pms_requisition_item_details_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_item_details` ADD CONSTRAINT `pms_requisition_item_details_ack_cc_id_fkey` FOREIGN KEY (`ack_cc_id`) REFERENCES `pms_branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return` ADD CONSTRAINT `fk_srr_store_requisition_id` FOREIGN KEY (`store_requisition_id`) REFERENCES `pms_store_requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return` ADD CONSTRAINT `fk_srr_req_from` FOREIGN KEY (`req_from`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return` ADD CONSTRAINT `fk_srr_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return` ADD CONSTRAINT `fk_srr_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return_details` ADD CONSTRAINT `fk_srrd_srr_id` FOREIGN KEY (`store_requisition_return_id`) REFERENCES `pms_store_requisition_return`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return_details` ADD CONSTRAINT `fk_srrd_sr_id` FOREIGN KEY (`store_requisition_details_id`) REFERENCES `pms_store_requisition_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_store_requisition_return_details` ADD CONSTRAINT `fk_srrd_item_id` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_return_item_details` ADD CONSTRAINT `fk_rrid_item_id` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_return_item_details` ADD CONSTRAINT `fk_rrid_source_branch_id` FOREIGN KEY (`source_branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_return_item_details` ADD CONSTRAINT `fk_rrid_dest_warehouse_id` FOREIGN KEY (`destination_warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_return_item_details` ADD CONSTRAINT `fk_rrid_srrd_id` FOREIGN KEY (`store_requisition_return_details_id`) REFERENCES `pms_store_requisition_return_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_requisition_return_item_details` ADD CONSTRAINT `fk_rrid_orig_req_item_details_id` FOREIGN KEY (`requisition_item_details_id`) REFERENCES `pms_requisition_item_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive` ADD CONSTRAINT `pms_good_receive_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `pms_purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive` ADD CONSTRAINT `pms_good_receive_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `pms_distributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive` ADD CONSTRAINT `pms_good_receive_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive` ADD CONSTRAINT `pms_good_receive_gate_pass_id_fkey` FOREIGN KEY (`gate_pass_id`) REFERENCES `pms_gate_pass`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_details` ADD CONSTRAINT `pms_good_receive_details_good_receive_id_fkey` FOREIGN KEY (`good_receive_id`) REFERENCES `pms_good_receive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_details` ADD CONSTRAINT `pms_good_receive_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_stock` ADD CONSTRAINT `pms_item_stock_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_stock` ADD CONSTRAINT `pms_item_stock_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_stock` ADD CONSTRAINT `pms_item_stock_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_stock_audit` ADD CONSTRAINT `pms_item_stock_audit_item_stock_id_fkey` FOREIGN KEY (`item_stock_id`) REFERENCES `pms_item_stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return` ADD CONSTRAINT `pms_good_receive_return_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `pms_good_receive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return` ADD CONSTRAINT `pms_good_receive_return_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `pms_purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return` ADD CONSTRAINT `pms_good_receive_return_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `pms_distributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return` ADD CONSTRAINT `pms_good_receive_return_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return_details` ADD CONSTRAINT `pms_good_receive_return_details_good_receive_return_id_fkey` FOREIGN KEY (`good_receive_return_id`) REFERENCES `pms_good_receive_return`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return_details` ADD CONSTRAINT `pms_good_receive_return_details_good_receive_detail_id_fkey` FOREIGN KEY (`good_receive_detail_id`) REFERENCES `pms_good_receive_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_good_receive_return_details` ADD CONSTRAINT `pms_good_receive_return_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `tock_transfer_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer` ADD CONSTRAINT `pms_stock_transfer_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer_details` ADD CONSTRAINT `pms_stock_transfer_details_st_id_fkey` FOREIGN KEY (`st_id`) REFERENCES `pms_stock_transfer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_transfer_details` ADD CONSTRAINT `pms_stock_transfer_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_gate_pass` ADD CONSTRAINT `pms_gate_pass_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `pms_distributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_gate_pass` ADD CONSTRAINT `pms_gate_pass_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell` ADD CONSTRAINT `pms_sell_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell` ADD CONSTRAINT `pms_sell_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell` ADD CONSTRAINT `pms_sell_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell` ADD CONSTRAINT `pms_sell_patient_insurance_id_fkey` FOREIGN KEY (`patient_insurance_id`) REFERENCES `patients_insurance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell` ADD CONSTRAINT `pms_sell_insurance_id_fkey` FOREIGN KEY (`insurance_id`) REFERENCES `insurer_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell` ADD CONSTRAINT `pms_sell_corporate_client_id_fkey` FOREIGN KEY (`corporate_client_id`) REFERENCES `client_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_sell_id_fkey` FOREIGN KEY (`sell_id`) REFERENCES `pms_sell`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `pms_med_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_medicine_type_id_fkey` FOREIGN KEY (`medicine_type_id`) REFERENCES `pms_medicine_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_medicine_composition_id_fkey` FOREIGN KEY (`medicine_composition_id`) REFERENCES `pms_med_composition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_medicine_unit_id_fkey` FOREIGN KEY (`medicine_unit_id`) REFERENCES `pms_med_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_manufacturer_Id_fkey` FOREIGN KEY (`manufacturer_Id`) REFERENCES `pms_manufacture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_pack_size_id_fkey` FOREIGN KEY (`pack_size_id`) REFERENCES `pms_med_package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_details` ADD CONSTRAINT `pms_sell_details_drug_type_id_fkey` FOREIGN KEY (`drug_type_id`) REFERENCES `pms_med_drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_patient_insurance_id_fkey` FOREIGN KEY (`patient_insurance_id`) REFERENCES `patients_insurance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_insurance_id_fkey` FOREIGN KEY (`insurance_id`) REFERENCES `insurer_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_corporate_client_id_fkey` FOREIGN KEY (`corporate_client_id`) REFERENCES `client_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return` ADD CONSTRAINT `pms_sell_return_sell_id_fkey` FOREIGN KEY (`sell_id`) REFERENCES `pms_sell`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_sell_return_id_fkey` FOREIGN KEY (`sell_return_id`) REFERENCES `pms_sell_return`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_sell_details_id_fkey` FOREIGN KEY (`sell_details_id`) REFERENCES `pms_sell_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `pms_med_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_medicine_type_id_fkey` FOREIGN KEY (`medicine_type_id`) REFERENCES `pms_medicine_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_medicine_composition_id_fkey` FOREIGN KEY (`medicine_composition_id`) REFERENCES `pms_med_composition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_medicine_unit_id_fkey` FOREIGN KEY (`medicine_unit_id`) REFERENCES `pms_med_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_manufacturer_Id_fkey` FOREIGN KEY (`manufacturer_Id`) REFERENCES `pms_manufacture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_pack_size_id_fkey` FOREIGN KEY (`pack_size_id`) REFERENCES `pms_med_package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_sell_return_details` ADD CONSTRAINT `pms_sell_return_details_drug_type_id_fkey` FOREIGN KEY (`drug_type_id`) REFERENCES `pms_med_drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch_item` ADD CONSTRAINT `pms_branch_item_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch_item` ADD CONSTRAINT `pms_branch_item_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_in_transit_stock` ADD CONSTRAINT `pms_in_transit_stock_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `pms_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_in_transit_stock` ADD CONSTRAINT `in_transit_stock_from_id_idx` FOREIGN KEY (`from_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_in_transit_stock` ADD CONSTRAINT `in_transit_stock_item_id_idx` FOREIGN KEY (`to_Id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_in_transit_stock_audit` ADD CONSTRAINT `pms_in_transit_stock_audit_inTransitStockId_fkey` FOREIGN KEY (`inTransitStockId`) REFERENCES `pms_in_transit_stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_insurer_payment_settings` ADD CONSTRAINT `pharmacy_insurer_payment_settings_insurance_id_fkey` FOREIGN KEY (`insurance_id`) REFERENCES `insurer_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_insurer_payment_settings` ADD CONSTRAINT `pharmacy_insurer_payment_settings_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_item_excel` ADD CONSTRAINT `pms_item_excel_batch_job_id_fkey` FOREIGN KEY (`batch_job_id`) REFERENCES `pms_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_batch_job_details` ADD CONSTRAINT `pms_batch_job_details_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `pms_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approval_step` ADD CONSTRAINT `core_approval_step_flow_id_fkey` FOREIGN KEY (`flow_id`) REFERENCES `core_approval_flow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approval_step_cc_mapping` ADD CONSTRAINT `core_approval_step_cc_mapping_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `core_approval_step`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approval_step_cc_mapping` ADD CONSTRAINT `core_approval_step_cc_mapping_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approver_mapping` ADD CONSTRAINT `core_approver_mapping_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approver_mapping` ADD CONSTRAINT `core_approver_mapping_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `core_approval_step`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approver_mapping` ADD CONSTRAINT `core_approver_mapping_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approval_instance` ADD CONSTRAINT `core_approval_instance_flow_id_fkey` FOREIGN KEY (`flow_id`) REFERENCES `core_approval_flow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approval_action` ADD CONSTRAINT `core_approval_action_instance_id_fkey` FOREIGN KEY (`instance_id`) REFERENCES `core_approval_instance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_approval_action` ADD CONSTRAINT `core_approval_action_acted_by_fkey` FOREIGN KEY (`acted_by`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch_item_map_audit_details` ADD CONSTRAINT `pms_branch_item_map_audit_details_audit_id_fkey` FOREIGN KEY (`audit_id`) REFERENCES `pms_branch_item_map_audit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch_item_map_excel` ADD CONSTRAINT `pms_branch_item_map_excel_batch_job_id_fkey` FOREIGN KEY (`batch_job_id`) REFERENCES `pms_batch_job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `core_printer_settings` ADD CONSTRAINT `core_printer_settings_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_client_payment_settings` ADD CONSTRAINT `pharmacy_client_payment_settings_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_client_payment_settings` ADD CONSTRAINT `pharmacy_client_payment_settings_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch_category_map` ADD CONSTRAINT `pms_branch_category_map_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_branch_category_map` ADD CONSTRAINT `pms_branch_category_map_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `pms_med_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_adjustment` ADD CONSTRAINT `pms_stock_adjustment_cc_id_fkey` FOREIGN KEY (`cc_id`) REFERENCES `sch_collection_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_adjustment` ADD CONSTRAINT `pms_stock_adjustment_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `pms_branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_adjustment` ADD CONSTRAINT `pms_stock_adjustment_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `pms_warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_stock_adjustment_details` ADD CONSTRAINT `pms_stock_adjustment_details_stock_adjustment_id_fkey` FOREIGN KEY (`stock_adjustment_id`) REFERENCES `pms_stock_adjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pms_auto_alert_audit` ADD CONSTRAINT `pms_auto_alert_audit_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `pms_auto_alert_email`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
