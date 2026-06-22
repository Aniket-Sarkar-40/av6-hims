import { db } from "@repo/db";
import { EMAIL_TYPE, Prisma } from "@repo/db/generated/prisma/client";

import { createClient } from "redis";

interface DynamicShortCodeSeeder {
  shortCode: string;
  tableName: string;
  isDTO: boolean;
  isCacheable: boolean;
  permission?: string;
  isDropDown?: boolean;
  whereClause?: string;
  selectClause?: string;
  isSingleDto?: boolean;
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
const DYNAMIC_SC_CACHE_KEY = `${redisPrefix}pms:dynamicShortCode:all`;

async function updateDynamicShortCodeConfigsByShortCode(
  input: Record<string, Prisma.InputJsonObject>
) {
  const mapping = Object.entries(input);

  await db.$transaction(
    mapping.map(([shortCode, config]) =>
      db.pmsDynamicShortCode.updateMany({
        where: { shortCode },
        data: { config },
      })
    )
  );
}

export async function runSeed() {
  await redis.connect();

  const rows = await db.pmsDynamicShortCode.findMany({
    select: { shortCode: true, config: true },
    where: { config: { not: Prisma.JsonNull } },
  });

  const map: Record<string, any> = {};
  for (const r of rows) map[r.shortCode] = r.config;

  console.log("🧹 Truncating tables...");
  await db.$executeRawUnsafe("TRUNCATE TABLE `pms_dynamic_short_code`;");

  await redis.del(DYNAMIC_SC_CACHE_KEY);

  const dynamicShortCodes: DynamicShortCodeSeeder[] = [
    {
      shortCode: "MED_UNIT",
      tableName: "medicineUnit",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medUnit:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "MED_CAT",
      tableName: "medCategory",
      isDTO: true,
      isCacheable: true,
      permission: "pms:medCategory:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        b2cMargin: "minMarginB2CPercentage",
        b2bMargin: "minMarginB2BPercentage",
      }),
    },
    {
      shortCode: "MED_TYPE",
      tableName: "medType",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medType:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "MED_COMPO",
      tableName: "medicineCompo",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medCompo:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "BOX_SIZE",
      tableName: "boxSize",
      isDTO: false,
      isCacheable: true,
      permission: "pms:box-size:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "MED_DIST_MAP",
      tableName: "medicineDistributorMap",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medicineDistMap:view",
    },
    {
      shortCode: "MED_PACKAGE",
      tableName: "medPackage",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medPackage:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "MED_DRUG",
      tableName: "medDrug",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medDrug:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "DISTRIBUTOR",
      tableName: "distributor",
      isDTO: true,
      isCacheable: true,
      permission: "pms:distributor:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "proInName" }),
    },
    {
      shortCode: "CUSTOMER",
      tableName: "pmsCustomer",
      isDTO: false,
      isCacheable: true,
      permission: "pms:customer:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "MANUFACTURE",
      tableName: "manufacture",
      isDTO: false,
      isCacheable: true,
      permission: "pms:manufacture:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "DOSAGE",
      tableName: "medicineDosage",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medDosage:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "INST",
      tableName: "medicineInstruction",
      isDTO: false,
      isCacheable: true,
      permission: "pms:medInstruction:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "instructionName" }),
    },
    {
      shortCode: "MED_DOS_MAP",
      tableName: "itemMedicineDosageMap",
      isDTO: true,
      isCacheable: false,
      permission: "pms:item-dosage-map:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({
        id: "id",
        itemId: "itemId",
        dosageId: "dosageId",
      }),
    },
    {
      shortCode: "MED_INST_MAP",
      tableName: "itemInstructionMap",
      isDTO: true,
      isCacheable: false,
      permission: "pms:item-instruction-map:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({
        id: "id",
        instructionId: "instructionId",
        itemId: "itemId",
      }),
    },
    {
      shortCode: "BRANCH",
      tableName: "pmsBranch",
      isDTO: true,
      isCacheable: true,
      permission: "pms:branch:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "COLLECTION_CENTER",
      tableName: "collectionCenter",
      isDTO: false,
      isCacheable: true,
      permission: "pms:collectionCenter:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "true" }),
      selectClause: JSON.stringify({ id: "id", value: "colName" }),
    },
    {
      shortCode: "WAREHOUSE",
      tableName: "pmsWarehouse",
      isDTO: true,
      isCacheable: true,
      permission: "pms:warehouse:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "STOR",
      tableName: "store",
      isDTO: true,
      isCacheable: true,
      permission: "pms:store:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "ITEM",
      tableName: "pmsItem",
      isDTO: true,
      isCacheable: true,
      permission: "pms:item:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "medicineName" }),
    },
    {
      shortCode: "UIN_CONFIG",
      tableName: "pmsUINConfig",
      isDTO: true,
      isCacheable: true,
      permission: "pms:uinConfig:view",
    },
    {
      shortCode: "DEPT",
      tableName: "department",
      isDTO: true,
      isCacheable: true,
      permission: "pms:department:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },

    {
      shortCode: "GATE_PASS",
      tableName: "pmsGatePass",
      isDTO: true,
      isCacheable: false,
      permission: "pms:gatePass:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "gatePassNumber" }),
    },
    {
      shortCode: "DESIGNATION",
      tableName: "staffDesignation",
      isDTO: false,
      isCacheable: true,
      permission: "pms:staffDesignation:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "designation" }),
    },
    {
      shortCode: "PO",
      tableName: "pmsPurchaseOrder",
      isDTO: true,
      isCacheable: false,
      permission: "pms:purchase:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "poNumber" }),
    },
    {
      shortCode: "PO_DETAILS",
      tableName: "pmsPurchaseOrderDetails",
      isDTO: true,
      isCacheable: false,
      permission: "pms:purchase:view",
      isSingleDto: false,
    },
    {
      shortCode: "GRN",
      tableName: "pmsGoodReceive",
      isDTO: true,
      isCacheable: false,
      permission: "pms:grn:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "grnNumber" }),
    },
    {
      shortCode: "GRN_DETAILS",
      tableName: "pmsGoodReceiveDetails",
      isDTO: true,
      isCacheable: false,
      permission: "pms:grn:view",
      isSingleDto: false,
    },
    {
      shortCode: "GRN_RETURN",
      tableName: "pmsGoodReceiveReturn",
      isDTO: true,
      isCacheable: false,
      permission: "pms:grnReturn:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "grnNumber" }),
    },
    {
      shortCode: "GRN_RETURN_DETAILS",
      tableName: "pmsGoodReceiveReturnDetails",
      isDTO: true,
      isCacheable: false,
      permission: "pms:grnReturn:view",
      isSingleDto: false,
    },
    {
      shortCode: "ST_REQ",
      tableName: "pmsStoreRequisition",
      isDTO: true,
      isCacheable: false,
      permission: "pms:storeRequisition:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "srNumber" }),
    },
    {
      shortCode: "ST_REQ_DETAILS",
      tableName: "pmsStoreRequisitionDetails",
      isDTO: true,
      isCacheable: false,
      permission: "pms:storeRequisition:view",
      isSingleDto: false,
    },
    {
      shortCode: "ST_REQ_ITEM",
      tableName: "pmsRequisitionItemDetails",
      isDTO: true,
      isCacheable: false,
      permission: "pms:storeRequisition:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "batchNo" }),
    },
    {
      shortCode: "STOCK_TRANS",
      tableName: "pmsStockTransfer",
      isDTO: true,
      isCacheable: false,
      permission: "pms:stock-transfer:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id" }),
    },
    {
      shortCode: "DOCTOR",
      tableName: "staff",
      isDTO: true,
      isCacheable: false,
      permission: "pms:doctor:view",
      isDropDown: true,
      whereClause: JSON.stringify({
        isActive: 1,
        designation: process.env.DOC_DESG_ID,
      }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        employeeId: "employeeId",
      }),
    },
    {
      shortCode: "STAFF",
      tableName: "staff",
      isDTO: false,
      isCacheable: true,
      permission: "pms:staff:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: 1 }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        employeeId: "employeeId",
      }),
    },
    {
      shortCode: "EMAIL_CONFIG",
      tableName: "emailConfig",
      isDTO: false,
      isCacheable: true,
      permission: "pms:emailConfig:view",
    },
    {
      shortCode: "EVENT_EMAIL",
      tableName: "eventEmail",
      isDTO: false,
      isCacheable: true,
      permission: "pms:event-email:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "emailType",
      }),
    },
    {
      shortCode: "SETTINGS",
      tableName: "pmsSettings",
      isDTO: false,
      isCacheable: true,
      permission: "pms:settings:view",
    },
    {
      shortCode: "PRINT_SET",
      tableName: "printerSettings",
      isDTO: false,
      isCacheable: false,
      permission: "pms:printerSettings:view",
    },
    {
      shortCode: "SELL",
      tableName: "pmsSell",
      isDTO: true,
      isCacheable: false,
      permission: "pms:sell:view",
    },
    {
      shortCode: "SELL_DETAILS",
      tableName: "pmsSellDetails",
      isDTO: true,
      isCacheable: false,
      permission: "pms:sell-details:view",
      isSingleDto: false,
    },
    {
      shortCode: "SELL_RETURN",
      tableName: "pmsSellReturn",
      isDTO: true,
      isCacheable: false,
      permission: "pms:sellReturn:view",
    },
    {
      shortCode: "STOCK",
      tableName: "pmsItemStock",
      isDTO: true,
      isCacheable: false,
      permission: "pms:itemStock:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "batchNo" }),
    },
    {
      shortCode: "STOCK_BATCH_WISE",
      tableName: "pmsItemStock",
      isDTO: true,
      isCacheable: false,
      isSingleDto: false,
      permission: "pms:stock-batch-wise:view",
      isDropDown: false,
    },
    {
      shortCode: "ITM_BRN_PR",
      tableName: "branchItemMap",
      isDTO: true,
      isCacheable: false,
      permission: "pms:item-branch-price:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "saleAmount" }),
    },
    {
      shortCode: "PATIENTS",
      tableName: "patient",
      isDTO: true,
      isCacheable: false,
      permission: "pms:patients:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({
        id: "id",
        patientUniqueId: "patientUniqueId",
        value: "patientName",
      }),
    },
    {
      shortCode: "INSURANCE",
      tableName: "insuranceMaster",
      isDTO: true,
      isCacheable: false,
      permission: "pms:insurance:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "customerName" }),
    },
    {
      shortCode: "CURRENCY",
      tableName: "currency",
      isDTO: true,
      isCacheable: false,
      permission: "pms:currency:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "STOCK_INT",
      tableName: "pmsInTransitStock",
      isDTO: true,
      isCacheable: false,
      permission: "pms:inTransitStock:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "batchNo" }),
    },
    {
      shortCode: "STORAGE",
      tableName: "pmsStorage",
      isDTO: false,
      isCacheable: true,
      permission: "pms:storage:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "PATIENTS_INSURANCE",
      tableName: "patientInsurance",
      isDTO: true,
      isCacheable: false,
      permission: "pms:patientsInsurance:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "policyNumber" }),
    },
    {
      shortCode: "BATCH_JOB",
      tableName: "pmsBatchJob",
      isDTO: false,
      isCacheable: false,
      permission: "pms:batchJob:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "batchJobNo" }),
    },
    {
      shortCode: "BATCH_JOB_DET",
      tableName: "pmsBatchJobDetails",
      isDTO: false,
      isCacheable: false,
      permission: "pms:batchJobDetails:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "rowTitle" }),
    },
    {
      shortCode: "APPROVAL_FLOW",
      tableName: "approvalFlow",
      isDTO: false,
      isCacheable: true,
      permission: "pms:approvalFlow:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "subjectType" }),
    },
    {
      shortCode: "CORPORATE_CLIENT",
      tableName: "clientMaster",
      isDTO: false,
      isCacheable: false,
      permission: "pms:client-master:view",
      isDropDown: true,
      whereClause: JSON.stringify({ status: "active" }),
      selectClause: JSON.stringify({ id: "id", value: "customerName" }),
    },
    {
      shortCode: "STOCK_ADJUSTMENT",
      tableName: "stockAdjustment",
      isDTO: true,
      isCacheable: false,
      permission: "pms:stock-adjustment:view",
      isDropDown: false,
      whereClause: JSON.stringify({ status: "active" }),
      selectClause: JSON.stringify({ id: "id", value: "refNo" }),
    },
    {
      shortCode: "STOCK_AUDIT",
      tableName: "pmsItemStockAudit",
      isDTO: true,
      isCacheable: false,
      permission: "pms:stock-audit:view",
      isDropDown: false,
    },
    {
      shortCode: "FEATURE_FLAG",
      tableName: "pmsFeatureFlag",
      isDTO: false,
      isCacheable: true,
      permission: "pms:feature-flag:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "flagName" }),
    },
    {
      shortCode: "BANK_HEAD",
      tableName: "cashNBankHead",
      isDTO: true,
      isCacheable: false,
      permission: "pms:cash-n-bank-head:view",
      isDropDown: true,
      whereClause: JSON.stringify({ status: 1 }),
    },
    {
      shortCode: "MOBILE_MONEY",
      tableName: "mobileMoneyMethod",
      isDTO: true,
      isCacheable: false,
      permission: "pms:mobile-money-method:view",
      isDropDown: true,
    },
    {
      shortCode: "ST_REQ_RET",
      tableName: "pmsStoreRequisitionReturn",
      isDTO: true,
      isCacheable: false,
      permission: "pms:store-requisition-return:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "srrNumber" }),
    },
    {
      shortCode: "AUTO_ALERT_EMAIL",
      tableName: "pmsAutoAlertEmail",
      isDTO: false,
      isCacheable: true,
      permission: "pms:auto-alert:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "AUTO_ALERT_AUDIT",
      tableName: "pmsAutoAlertAudit",
      isDTO: true,
      isCacheable: false,
      permission: "pms:auto-alert:view",
      isDropDown: false,
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
    {
      subject: "Aerial View-6 Pvt. Ltd. — ERROR ALERT",
      emailType: "ERROR_ALERT",
      isSignature: false,
      emailBody: `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    
    <div style="margin-bottom: 20px; text-align: center;">
      {{companyDetails}}
    </div>

    <div style="text-align: left; margin-bottom: 20px;">
      <h2>Dear {{name}},</h2>
    </div>

    <div style="text-align: left; margin-top: 20px;">
      <p>An application error occurred in <strong>{{serviceName}}</strong>. Please review the details below.</p>
    </div>

    <hr />

    <!-- SECTION: ERROR OVERVIEW -->
    <div style="text-align: left; margin-top: 20px;">
      <h3>🚨 Error Summary</h3>
      <p><strong>Status Code:</strong> {{statusCode}} ({{errorCode}})</p>
      <p><strong>Message:</strong> {{message}}</p>
      <p><strong>Error Type:</strong> {{errorType}}</p>
    </div>

    <!-- SECTION: REQUEST DETAILS -->
    <div style="text-align: left; margin-top: 20px;">
      <h3>📡 Request Info</h3>
      <p><strong>Method:</strong> {{method}}</p>
      <p><strong>URL:</strong> {{url}}</p>
      <p><strong>Query:</strong></p>
      <pre style="background:#efefef;padding:10px;border-radius:4px;">{{query}}</pre>
      <p><strong>Body:</strong></p>
      <pre style="background:#efefef;padding:10px;border-radius:4px;">{{body}}</pre>
    </div>

    <!-- SECTION: PRISMA DETAILS -->
    {{#if prisma}}
    <div style="text-align: left; margin-top: 20px;">
      <h3>🔧 Prisma Error Details</h3>
      <p><strong>Type:</strong> {{prisma.type}}</p>
      <p><strong>Code:</strong> {{prisma.code}}</p>
      <p><strong>Client Version:</strong> {{prisma.clientVersion}}</p>
      <p><strong>Meta:</strong></p>
      <pre style="background:#efefef;padding:10px;border-radius:4px;">{{prismaMeta}}</pre>
    </div>
    {{/if}}

    <!-- SECTION: STACK TRACE -->
    <div style="text-align: left; margin-top: 20px;">
      <h3>🧯 Stack Trace</h3>
      <pre style="background:#f8d7da;color:#721c24;padding:10px;border-radius:4px;">{{stack}}</pre>
    </div>

    <hr />

    <div style="text-align: left; margin-top: 20px;">
      <p>Thank you.</p>
    </div>

    <div style="text-align: left; margin-top: 20px;">
      <p>This e-mail address does not accept incoming mail.</p>
    </div>

    <div style="text-align: left; margin-top: 20px;">
      <p>{{signature}}</p>
    </div>

  </div>
  `,
    },
  ];

  await db.pmsDynamicShortCode.createMany({
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
