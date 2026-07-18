import { db } from "@repo/db";
import {
  PdfTemplateType,
  Prisma,
  ServiceCode,
} from "@repo/db/generated/prisma/client";

import { createClient } from "redis";

interface DynamicShortCodeSeeder {
  shortCode: string;
  tableName: string;
  isDTO: boolean;
  isSingleDto?: boolean;
  isCacheable: boolean;
  permission?: string;
  isDropDown?: boolean;
  whereClause?: string;
  selectClause?: string;
}

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

const redisPrefix = process.env.REDIS_PREFIX || "";
const DYNAMIC_SC_CACHE_KEY = `${redisPrefix}accounting:dynamicShortCode:all`;

async function updateDynamicShortCodeConfigsByShortCode(
  input: Record<string, Prisma.InputJsonObject>
) {
  const mapping = Object.entries(input);

  await db.$transaction(
    mapping.map(([shortCode, config]) =>
      db.accDynamicShortCode.updateMany({
        where: { shortCode },
        data: { config },
      })
    )
  );
}

export async function runSeed() {
  await redis.connect();

  const rows = await db.accDynamicShortCode.findMany({
    select: { shortCode: true, config: true },
    where: { config: { not: Prisma.JsonNull } },
  });

  const map: Record<string, any> = {};
  for (const r of rows) map[r.shortCode] = r.config;

  console.log("🧹 Truncating tables...");
  await db.$executeRawUnsafe("TRUNCATE TABLE `accounting_dynamic_short_code`;");

  await redis.del(DYNAMIC_SC_CACHE_KEY);

  const dynamicShortCodes: DynamicShortCodeSeeder[] = [
    {
      shortCode: "DYNAMIC_SHORT_CODE",
      tableName: "accDynamicShortCode",
      isDTO: true,
      isCacheable: true,
      permission: "acc:dynamic-from:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "shortCode" }),
    },
    {
      shortCode: "AUDIT_CONFIG",
      tableName: "accAuditConfig",
      isDTO: true,
      isCacheable: true,
      permission: "acc:audit-config:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "module" }),
    },
    {
      shortCode: "UIN_CONFIG",
      tableName: "accUINConfig",
      isDTO: true,
      isCacheable: true,
      permission: "acc:uin-config:view",
    },
    {
      shortCode: "EMAIL_CONFIG",
      tableName: "accEmailConfig",
      isDTO: false,
      isCacheable: true,
      permission: "acc:email-config:view",
      isDropDown: true,
      isSingleDto: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "emailType",
      }),
    },
    {
      shortCode: "SETTINGS",
      tableName: "accSettings",
      isDTO: false,
      isCacheable: true,
      permission: "acc:settings:view",
      isDropDown: false,
      isSingleDto: true,
      whereClause: JSON.stringify({}),
    },
    {
      shortCode: "COMPANY",
      tableName: "company",
      isDTO: true,
      isCacheable: false,
      permission: "acc:company:view",
      isDropDown: true,
      isSingleDto: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "GROUP",
      tableName: "group",
      isDTO: true,
      isCacheable: true,
      permission: "acc:group:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "LEDGER",
      tableName: "ledger",
      isDTO: true,
      isCacheable: true,
      permission: "acc:ledger:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "VOUCHER_TYPE",
      tableName: "voucherType",
      isDTO: true,
      isCacheable: true,
      permission: "acc:voucher-type:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "COST_CENTER",
      tableName: "costCenter",
      isDTO: true,
      isCacheable: true,
      permission: "acc:cost-center:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "VOUCHER",
      tableName: "voucher",
      isDTO: true,
      isCacheable: false,
      permission: "acc:voucher:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "NARRATION",
      tableName: "narration",
      isDTO: true,
      isCacheable: true,
      permission: "acc:narration:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "COMPANY_FINANCIAL_YEAR",
      tableName: "companyFinancialYear",
      isDTO: true,
      isCacheable: false,
      permission: "acc:company-financial-year:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "fyName" }),
    },
    {
      shortCode: "INTEGRATION_CONFIG",
      tableName: "accountingIntegrationConfig",
      isDTO: true,
      isCacheable: false,
      permission: "acc:integration-config:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "BATCH_JOB",
      tableName: "batchJob",
      isDTO: false,
      isCacheable: false,
      permission: "acc:batch-job:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "batchJobNo" }),
    },
    {
      shortCode: "BATCH_JOB_DETAILS",
      tableName: "batchJobDetails",
      isDTO: false,
      isCacheable: false,
      permission: "acc:batch-job-details:view",
      isDropDown: true,
      isSingleDto: false,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "rowTitle" }),
    },
    {
      shortCode: "BANK_STATEMENT_ROW",
      tableName: "bankStatementRow",
      isDTO: true,
      isCacheable: false,
      permission: "acc:bank-statement-row:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "BANK_STATEMENT",
      tableName: "bankStatement",
      isDTO: true,
      isCacheable: false,
      permission: "acc:bank-statement:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "VOUCHER_UIN_CONFIG",
      tableName: "voucherUINConfig",
      isDTO: true,
      isCacheable: false,
      permission: "acc:voucher-uin-config:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "CHEQUE_MASTER",
      tableName: "chequeMaster",
      isDTO: true,
      isCacheable: true,
      permission: "acc:cheque-master:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "MULTI_VOUCHER",
      tableName: "multiVoucher",
      isDTO: true,
      isCacheable: false,
      permission: "acc:multi-voucher:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "CLIENT_LEDGER_MAPPING",
      tableName: "clientLedgerMapping",
      isDTO: true,
      isCacheable: false,
      permission: "acc:client-ledger-mapping:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "USED_CHEQUE_NUMBER",
      tableName: "usedChequeNumber",
      isDTO: true,
      isCacheable: false,
      permission: "acc:used-cheque-number:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "RATE_OF_EXCHANGE",
      tableName: "rateOfExchange",
      isDTO: true,
      isCacheable: true,
      permission: "acc:rate-of-exchange:view",
      isDropDown: false,
      isSingleDto: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
  ];

  await db.accDynamicShortCode.createMany({
    data: dynamicShortCodes,
  });

  await updateDynamicShortCodeConfigsByShortCode(map);

  await redis.disconnect();
  await db.$disconnect();
}
