import { db } from "@repo/db";
import { EMAIL_TYPE, Prisma } from "@repo/db/generated/prisma/client";
import { SoftDeleteConfig } from "av6-core";

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
  deleteConfig?: string;
}

interface EventEmailSeeder {
  subject: string;
  emailType: EMAIL_TYPE;
  isSignature: boolean;
  emailBody: string;
}

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

const redisPrefix = process.env.REDIS_PREFIX || "";
const DYNAMIC_SC_CACHE_KEY = `${redisPrefix}inv:dynamicShortCode:all`;

async function updateDynamicShortCodeConfigsByShortCode(
  input: Record<string, Prisma.InputJsonObject>
) {
  const mapping = Object.entries(input);

  await db.$transaction(
    mapping.map(([shortCode, config]) =>
      db.invDynamicShortCode.updateMany({
        where: { shortCode },
        data: { config },
      })
    )
  );
}

const getDeleteConfigByTableName = (shortCode: string): SoftDeleteConfig => {
  switch (shortCode) {
    case "PO":
      return {
        children: [
          { tableName: "invPurchaseOrderDetails", foreignKey: "purchaseId" },
        ],
      };
    default:
      return {};
  }
};

export async function runSeed() {
  await redis.connect();

  const rows = await db.coreDynamicShortCode.findMany({
    select: { shortCode: true, config: true },
    where: { config: { not: Prisma.JsonNull } },
  });

  const map: Record<string, any> = {};
  for (const r of rows) map[r.shortCode] = r.config;

  console.log("🧹 Truncating tables...");
  await db.$executeRawUnsafe("TRUNCATE TABLE `inv_dynamic_short_code`;");

  await redis.del(DYNAMIC_SC_CACHE_KEY);

  const dynamicShortCodes: DynamicShortCodeSeeder[] = [
    {
      shortCode: "DYNAMIC_SHORT_CODE",
      tableName: "invDynamicShortCode",
      isDTO: true,
      isCacheable: false,
      permission: "inv:dynamic-from:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "shortCode" }),
    },
    {
      shortCode: "ITEM_CATEGORY",
      tableName: "invItemCategory",
      isDTO: false,
      isCacheable: true,
      isDropDown: true,
      permission: "inv:item-category:view",
      whereClause: JSON.stringify({ isActive: true, isLock: false }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "ITEM_STORE",
      tableName: "invItemStore",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      isDropDown: true,
      permission: "inv:item-store:view",
      whereClause: JSON.stringify({ isActive: true, isLock: false }),
      selectClause: JSON.stringify({ id: "id", value: "itemStoreName" }),
    },
    {
      shortCode: "UNIT_MASTER",
      tableName: "invUnitMaster",
      isDTO: false,
      isCacheable: true,
      isDropDown: true,
      permission: "inv:item-unit:view",
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "packagingTypeName" }),
    },
    {
      shortCode: "SETTINGS",
      tableName: "invSettings",
      isDTO: false,
      isCacheable: true,
      permission: "inv:settings:view",
    },
    {
      shortCode: "TAX_DETAILS",
      tableName: "taxDetails",
      isDropDown: true,
      isDTO: false,
      isCacheable: true,
      permission: "inv:tax-details:view",
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "STORAGE",
      tableName: "invStorage",
      isDTO: false,
      isCacheable: true,
      permission: "inv:storage:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },

    {
      shortCode: "UIN_CONFIG",
      tableName: "invUINConfig",
      isDTO: true,
      isCacheable: true,
      permission: "inv:uin-config:view",
      isDropDown: true,
    },
    {
      shortCode: "ITEM",
      tableName: "invItem",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "inv:item-master:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true, isLock: false }),
      selectClause: JSON.stringify({ id: "id", value: "item" }),
    },
    {
      shortCode: "ITEM_SUPPLIER",
      tableName: "invItemSupplier",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "inv:itemSupplier:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true, isLock: false }),
      selectClause: JSON.stringify({ id: "id", value: "vendorCompanyName" }),
    },
    {
      shortCode: "ITEM_SUPPLIER_MAP",
      tableName: "invItemSupplierMapping",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:itemSupplierMapping:view",
      isDropDown: true,
    },
    {
      shortCode: "BRANCH",
      tableName: "invBranch",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "inv:branch:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "WAREHOUSE",
      tableName: "invWarehouse",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "inv:warehouse:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "COLLECTION_CENTER",
      tableName: "collectionCenter",
      isDTO: true,
      isCacheable: true,
      permission: "inv:collection-center:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "BATCH_JOB",
      tableName: "invBatchJob",
      isDTO: true,
      isCacheable: false,
      permission: "inv:batch-job:view",
      isDropDown: false,
    },
    {
      shortCode: "BATCH_JOB_DET",
      tableName: "invBatchJobDetails",
      isDTO: true,
      isCacheable: false,
      permission: "inv:batch-job-details:view",
      isDropDown: false,
    },
    {
      shortCode: "GRN",
      tableName: "invGoodReceive",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:good-receive:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "grnNumber" }),
    },
    {
      shortCode: "STOCK_ADJUSTMENT",
      tableName: "invStockAdjustment",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "pms:stock-adjustment:view",
      isDropDown: false,
      whereClause: JSON.stringify({ status: "active" }),
      selectClause: JSON.stringify({ id: "id", value: "refNo" }),
    },
    {
      shortCode: "GRN_RETURN",
      tableName: "invGoodReceiveReturn",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:good-receive-return:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "grnNumber" }),
    },
    {
      shortCode: "PO",
      tableName: "invPurchaseOrder",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:purchase-order:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "poNumber" }),
      deleteConfig: JSON.stringify(getDeleteConfigByTableName("PO")),
    },
    {
      shortCode: "CONSUMPTION",
      tableName: "consumption",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:consumption:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "consumptionNo" }),
    },
    {
      shortCode: "STOCK",
      tableName: "invItemStock",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:itemStock:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "itemId" }),
    },
    {
      shortCode: "IN_TRANSIT_STOCK",
      tableName: "invInTransitStock",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:inTransitStock:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "batchNo" }),
    },
    {
      shortCode: "ST_REQ",
      tableName: "invStoreRequisition",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:store-requisition:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "srNumber" }),
    },
    {
      shortCode: "STOCK_TRANSFER",
      tableName: "invStockTransfer",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:stock-transfer:view",
      isDropDown: true,
    },
    {
      shortCode: "BRANCH_REQ",
      tableName: "branchRequisition",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:branch-requisition:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "brNumber" }),
    },
    {
      shortCode: "BRANCH_REQ_DETAILS",
      tableName: "branchRequisitionDetails",
      isDTO: true,
      isSingleDto: false,
      isCacheable: false,
      permission: "inv:branch-requisition-details:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "branchRequisitionId" }),
    },
    {
      shortCode: "ST_REQ_RET",
      tableName: "storeRequisitionReturn",
      isDTO: true,
      isSingleDto: true,
      isCacheable: false,
      permission: "inv:store-requisition-return:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "srrNumber" }),
    },
    {
      shortCode: "BRANCH_REQ_RETURN",
      tableName: "branchRequisitionReturn",
      isDTO: true,
      isSingleDto: true,
      isCacheable: false,
      permission: "inv:branch-requisition-return:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "brrNumber" }),
    },
    {
      shortCode: "ITEM_BATCH_STOCK",
      tableName: "invItemStock",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "inv:item-batch-stock:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "batchNo" }),
    },
  ];

  const eventEmails: EventEmailSeeder[] = [
    {
      subject: "Aerial View-6 Pvt. Ltd.",
      emailType: "GENERAL",
      isSignature: false,
      emailBody: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="margin-bottom: 20px; text-align: center;">
          {{companyDetails}}
        </div>
  
        <div style="text-align: left; margin-bottom: 20px;">
          <h2>Dear {{name}},</h2>
        </div>
       
  
        <div style="text-align: left; margin-top: 20px;">
          <p>{{message}}</p>
        </div>
  
        <div style="text-align: left; margin-top: 20px;">
          <p>Thank you</p>
        </div>
  
        <div style="text-align: left; margin-top: 20px;">
          <p>This e-mail address does not accept incoming mail.</p>
        </div>

        <div style="text-align: left; margin-top: 20px;">
          <p>{{signature}}</p>
        </div>
      </div>`,
    },
  ];

  await db.invDynamicShortCode.createMany({
    data: dynamicShortCodes,
  });

  await db.eventEmail.createMany({
    data: eventEmails,
    skipDuplicates: true,
  });

  await updateDynamicShortCodeConfigsByShortCode(map);

  await redis.disconnect();
  await db.$disconnect();
}
