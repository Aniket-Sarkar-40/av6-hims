import { db } from "@/client.js";
import { Prisma } from "@repo/db/generated/prisma/client";

import { createClient } from "redis";

interface DynamicShortCodeSeeder {
  shortCode: string;
  tableName: string;
  isDTO: boolean;
  isCacheable: boolean;
  permission?: string;
  isDropDown?: boolean;
  isSingleDto?: boolean;
  whereClause?: string;
  selectClause?: string;
}

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

const redisPrefix = process.env.REDIS_PREFIX || "";
const DYNAMIC_SC_CACHE_KEY = `${redisPrefix}opd:dynamicShortCode:all`;

async function updateDynamicShortCodeConfigsByShortCode(
  input: Record<string, Prisma.InputJsonObject>
) {
  const mapping = Object.entries(input);

  await db.$transaction(
    mapping.map(([shortCode, config]) =>
      db.opdDynamicShortCode.updateMany({
        where: { shortCode },
        data: { config },
      })
    )
  );
}

export async function runSeed() {
  await redis.connect();

  const rows = await db.opdDynamicShortCode.findMany({
    select: { shortCode: true, config: true },
    where: { config: { not: Prisma.JsonNull } },
  });

  const map: Record<string, any> = {};
  for (const r of rows) map[r.shortCode] = r.config;

  console.log("🧹 Truncating tables...");
  await db.$executeRawUnsafe("TRUNCATE TABLE `nopd_dynamic_short_code`;");

  await redis.del(DYNAMIC_SC_CACHE_KEY);

  const dynamicShortCodes: DynamicShortCodeSeeder[] = [
    {
      shortCode: "SETTINGS",
      tableName: "opdSettings",
      isDTO: false,
      isCacheable: false,
      permission: "opd:settings:view",
      isDropDown: true,
    },
    {
      shortCode: "PATIENTS",
      tableName: "patient",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patients:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({
        id: "id",
        patientUniqueId: "patientUniqueId",
        value: "patientName",
        mobileNo: "mobileNo",
      }),
    },
    {
      shortCode: "OPD_DEPARTMENT",
      tableName: "opdDepartment",
      isDTO: true,
      isCacheable: true,
      permission: "opd:opd-department:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "departmentName" }),
    },
    {
      shortCode: "MEDICINE_TAB",
      tableName: "medicineTab",
      isDTO: true,
      isCacheable: true,
      permission: "opd:medicine-tab:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "medTabName",
        doctorId: "doctorId",
      }),
    },
    {
      shortCode: "MEDICINE_TAB_DETAILS",
      tableName: "medicineTabDetails",
      isDTO: true,
      isCacheable: false,
      permission: "opd:medicine-tab-details:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        medicineTabId: "medicineTabId",
      }),
    },
    {
      shortCode: "CLINICAL_HISTORY",
      tableName: "clinicalHistory",
      isDTO: true,
      isCacheable: false,
      permission: "opd:clinical-history:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        patientId: "patientId",
        appointmentId: "appointmentId",
      }),
    },
    {
      shortCode: "LAST_VISIT",
      tableName: "appointment",
      isDTO: true,
      isCacheable: false,
      permission: "opd:last-visit:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        patientId: "patientId",
      }),
    },
    {
      shortCode: "CONSULTATION_COMPLAINT",
      tableName: "consultationComplaint",
      isDTO: true,
      isCacheable: false,
      permission: "opd:consultation-complaint:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        patientId: "patientId",
        appointmentId: "appointmentId",
        value: "complaint",
      }),
    },
    {
      shortCode: "GENERAL_BILL",
      tableName: "generalBilling",
      isDTO: true,
      isCacheable: false,
      permission: "opd:general-bill:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "billNumber",
        patientId: "patientId",
        ccId: "ccId",
      }),
    },
    {
      shortCode: "ICD_TEN",
      tableName: "iCDTen",
      isDTO: false,
      isCacheable: true,
      permission: "opd:icd-ten:view",
      isDropDown: true,
      selectClause: JSON.stringify({
        id: "id",
        value: "icdName",
        icdSpecificCode: "icdSpecificCode",
      }),
    },
    {
      shortCode: "CONSULTATION_NOTES",
      tableName: "consultationNotes",
      isDTO: true,
      isCacheable: true,
      permission: "opd:consultation-notes:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "consultationName" }),
    },
    {
      shortCode: "CONSULTATION_NOTES_MAPPINGS",
      tableName: "consultationNotesMapping",
      isDTO: true,
      isCacheable: true,
      permission: "opd:consultation-notes-mapping:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        consultationNotesId: "consultationNotesId",
        doctorId: "doctorId",
      }),
    },
    {
      shortCode: "CONSULTATION",
      tableName: "consultation",
      isDTO: true,
      isCacheable: true,
      permission: "opd:consultation:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        appointmentId: "appointmentId",
        patientId: "patientId",
      }),
    },
    {
      shortCode: "CHIPS_BUTTON_MAPPING",
      tableName: "chipsButtonMapping",
      isDTO: true,
      isCacheable: true,
      permission: "opd:chips-button-mapping:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "chipsName",
        doctorId: "doctorId",
      }),
    },
    {
      shortCode: "CONSULTATION_ICD_TEN_LIST",
      tableName: "consultationICDTenList",
      isDTO: true,
      isCacheable: false,
      permission: "opd:consultation-icd-ten-list:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true, patientId: "patientId" }),
    },
    {
      shortCode: "PATIENT_INSURANCE",
      tableName: "patientInsurance",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patient-insurance:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", patientId: "patientId" }),
    },

    {
      shortCode: "OPD_DEPARTMENT_PREFIX",
      tableName: "opdDepartmentPrefix",
      isDTO: true,
      isCacheable: true,
      permission: "opd:opd-department-prefix:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "prefix",
        licenseType: "licenseType",
      }),
    },
    {
      shortCode: "PATIENT_MEDICINE",
      tableName: "patientMedicine",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patient-medicine:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        appointmentId: "appointmentId",
      }),
    },

    {
      shortCode: "DOCUMENT",
      tableName: "patientDocument",
      isDTO: true,
      isCacheable: false,
      permission: "opd:document:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "documentType" }),
    },
    {
      shortCode: "DOCTOR",
      tableName: "staff",
      isDTO: true,
      isCacheable: false,
      permission: "opd:doctor:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: 1, designation: "2" }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        employeeId: "employeeId",
      }),
    },
    {
      shortCode: "PATIENT_CONSULTATION",
      tableName: "patientConsultation",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patient-consultation:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "UIN_CONFIG",
      tableName: "opdUINConfig",
      isDTO: true,
      isCacheable: true,
      permission: "opd:uin-config:view",
    },
    {
      shortCode: "REFER_TO_DOCTOR",
      tableName: "patientReferToDoctor",
      isDTO: true,
      isCacheable: false,
      permission: "opd:refer-to-doctor:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "APPOINTMENT",
      tableName: "appointment",
      isDTO: true,
      isCacheable: false,
      permission: "opd:appointment:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        patientUniqueId: "patientUniqueId",
        value: "appointmentId",
        patientId: "patientId",
      }),
    },

    {
      shortCode: "PATIENT_ADVICE_DETAILS",
      tableName: "patientAdviceDetails",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patient-advice-details:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        patientId: "patientId",
        value: "advice",
        appointmentId: "appointmentId",
      }),
    },

    {
      shortCode: "FOLLOW_UP",
      tableName: "patientFollowUp",
      isDTO: true,
      isCacheable: false,
      permission: "opd:follow-up:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        doctorId: "doctorId",
        appointmentId: "appointmentId",
        patientId: "patientId",
      }),
    },
    {
      shortCode: "CORPORATE_CLIENT",
      tableName: "clientMaster",
      isDTO: false,
      isCacheable: false,
      permission: "opd:client-master:view",
      isDropDown: true,
      whereClause: JSON.stringify({ status: "active" }),
      selectClause: JSON.stringify({ id: "id", value: "customerName" }),
    },
    {
      shortCode: "PATIENT_TEST",
      tableName: "patientTest",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patient-test:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "PROCEDURE",
      tableName: "procedureMaster",
      isDTO: true,
      isCacheable: true,
      permission: "opd:procedure:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "procedureName",
        procedureCharge: "procedureCharge",
      }),
    },
    {
      shortCode: "TEST_CATEGORIES",
      tableName: "testCategories",
      isDTO: false,
      isCacheable: false,
      permission: "opd:test-categories:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "PATIENT_PROCEDURE",
      tableName: "patientProcedure",
      isDTO: true,
      isCacheable: false,
      permission: "opd:patient-procedure:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "PAYMENT_TRANSACTION",
      tableName: "paymentTransaction",
      isDTO: false,
      isCacheable: false,
      permission: "opd:payment:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "BANK_HEAD",
      tableName: "cashNBankHead",
      isDTO: true,
      isCacheable: false,
      permission: "opd:cash-n-bank-head:view",
      isDropDown: true,
      whereClause: JSON.stringify({ status: 1 }),
    },
    {
      shortCode: "MOBILE_MONEY",
      tableName: "mobileMoneyMethod",
      isDTO: true,
      isCacheable: false,
      permission: "opd:mobile-money-method:view",
      isDropDown: true,
    },
    {
      shortCode: "GENERAL_BILL_ITEM",
      tableName: "generalBillItem",
      isDTO: true,
      isCacheable: true,
      permission: "opd:general-bill-item:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        defaultPrice: "defaultPrice",
      }),
    },
    {
      shortCode: "GENERAL_BILL_PRICING",
      tableName: "generalBillPricing",
      isDTO: true,
      isCacheable: false,
      permission: "opd:general-bill-pricing:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "price",
      }),
    },
  ];

  await db.opdDynamicShortCode.createMany({
    data: dynamicShortCodes,
  });

  await updateDynamicShortCodeConfigsByShortCode(map);

  await redis.disconnect();
  await db.$disconnect();
}
