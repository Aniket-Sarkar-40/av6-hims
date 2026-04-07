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
  isCacheable: boolean;
  permission?: string;
  isDropDown?: boolean;
  whereClause?: string;
  selectClause?: string;
}

interface PdfTemplateSeeder {
  templateName: string;
  templateType: PdfTemplateType;
  module: ServiceCode;
  bodyJson: object;
  isDefault: boolean;
}

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

const redisPrefix = process.env.REDIS_PREFIX || "";
const DYNAMIC_SC_CACHE_KEY = `${redisPrefix}core:dynamicShortCode:all`;
const PDF_TEMPLATE_CACHE_KEY = `${redisPrefix}core:pdfTemplate:all`;

async function updateDynamicShortCodeConfigsByShortCode(
  input: Record<string, Prisma.InputJsonObject>
) {
  const mapping = Object.entries(input);

  await db.$transaction(
    mapping.map(([shortCode, config]) =>
      db.coreDynamicShortCode.updateMany({
        where: { shortCode },
        data: { config },
      })
    )
  );
}

export async function runSeed() {
  await redis.connect();

  const rows = await db.coreDynamicShortCode.findMany({
    select: { shortCode: true, config: true },
    where: { config: { not: Prisma.JsonNull } },
  });

  const map: Record<string, any> = {};
  for (const r of rows) map[r.shortCode] = r.config;

  console.log("🧹 Truncating tables...");
  await db.$executeRawUnsafe("TRUNCATE TABLE `core_dynamic_short_code`;");
  await db.$executeRawUnsafe("TRUNCATE TABLE `core_pdf_template`;");

  await redis.del(DYNAMIC_SC_CACHE_KEY);
  await redis.del(PDF_TEMPLATE_CACHE_KEY);

  const dynamicShortCodes: DynamicShortCodeSeeder[] = [
    {
      shortCode: "UIN_CONFIG",
      tableName: "coreUINConfig",
      isDTO: true,
      isCacheable: true,
      permission: "core:uinConfig:view",
    },

    {
      shortCode: "EMAIL_CONFIG",
      tableName: "emailConfig",
      isDTO: false,
      isCacheable: true,
      permission: "core:emailConfig:view",
    },

    {
      shortCode: "COUNTRY",
      tableName: "country",
      isDTO: true,
      isCacheable: true,
      permission: "core:country:view",
      isDropDown: true,
      whereClause: JSON.stringify({}),
      selectClause: JSON.stringify({ id: "id", value: "enShortName" }),
    },

    {
      shortCode: "STATE",
      tableName: "state",
      isDTO: true,
      isCacheable: true,
      permission: "core:state:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        country: "countryId",
      }),
    },

    {
      shortCode: "SERVICE_EVENT",
      tableName: "serviceEvent",
      isDTO: true,
      isCacheable: true,
      permission: "core:service-event:view",
      isDropDown: true,
      selectClause: JSON.stringify({
        id: "id",
        value: "service",
      }),
    },

    {
      shortCode: "CORE_APPROVAL",
      tableName: "coreApprovalService",
      isDTO: false,
      isCacheable: false,
      permission: "core:core-approval:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
      }),
    },

    {
      shortCode: "EVENT_CONFIG",
      tableName: "eventConfig",
      isDTO: true,
      isCacheable: true,
      permission: "core:event-config:view",
      isDropDown: true,
      selectClause: JSON.stringify({
        id: "id",
        value: "eventName",
        serviceEvent: "serviceEventId",
      }),
    },

    {
      shortCode: "TEMPLATE",
      tableName: "template",
      isDTO: false,
      isCacheable: false,
      permission: "core:template:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "templateName",
        code: "templateCode",
        type: "templateType",
      }),
    },

    {
      shortCode: "CITY",
      tableName: "city",
      isDTO: true,
      isCacheable: true,
      permission: "core:city:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
        state: "stateId",
      }),
    },

    {
      shortCode: "SETTINGS",
      tableName: "settings",
      isDTO: false,
      isCacheable: true,
      permission: "core:settings:view",
    },

    {
      shortCode: "COUNTRY_CODE",
      tableName: "countryCode",
      isDTO: true,
      isCacheable: true,
      permission: "core:countryCode:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "countryCode" }),
    },

    {
      shortCode: "COLLECTION_CENTER",
      tableName: "collectionCenter",
      isDTO: false,
      isCacheable: true,
      permission: "core:collectionCenter:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "true" }),
      selectClause: JSON.stringify({ id: "id", value: "colName" }),
    },

    {
      shortCode: "STAFF",
      tableName: "staff",
      isDTO: false,
      isCacheable: true,
      permission: "core:staff:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: 1 }),
      selectClause: JSON.stringify({
        id: "id",
        value: "name",
      }),
    },

    {
      shortCode: "DESIGNATION",
      tableName: "staffDesignation",
      isDTO: false,
      isCacheable: true,
      permission: "core:staffDesignation:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "designation" }),
    },

    {
      shortCode: "DEPARTMENT",
      tableName: "department",
      isDTO: true,
      isCacheable: true,
      permission: "core:department:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "departmentName" }),
    },

    {
      shortCode: "CURRENCY",
      tableName: "currency",
      isDTO: true,
      isCacheable: false,
      permission: "core:currency:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },

    {
      shortCode: "PDF_TEMPLATE",
      tableName: "pdfTemplate",
      isDTO: true,
      isCacheable: true,
      permission: "core:pdf-template:view",
      isDropDown: false,
      whereClause: JSON.stringify({ isActive: true }),
    },
    {
      shortCode: "INCOME_HEAD",
      tableName: "incomeHead",
      isDTO: false,
      isCacheable: true,
      permission: "core:incomeHead:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "incomeCategory" }),
    },
    {
      shortCode: "EXPENSE_HEAD",
      tableName: "expenseHead",
      isDTO: false,
      isCacheable: true,
      permission: "core:expenseHead:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "expenseCategory" }),
    },
    {
      shortCode: "EXPENSE",
      tableName: "expense",
      isDTO: true,
      isCacheable: false,
      permission: "core:expense:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "INCOME",
      tableName: "income",
      isDTO: true,
      isCacheable: false,
      permission: "core:income:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: "yes" }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
  ];
  const pdfTemplates: PdfTemplateSeeder[] = [
    {
      templateName: "Opd Bill Sample",
      module: "OPD",
      templateType: "BILL",
      bodyJson: {
        pageSize: "A4",
        margins: { top: 125, right: 30, bottom: 45, left: 30 },

        watermark: {
          text: "{{WATER_MARK}}",
          opacity: 0.4,
          fontSize: 60,
          color: "#d0d0d0",
          angle: 55,
          mode: "all",
        },

        header: {
          marginTop: 25,
          marginLeft: 30,
          marginRight: 30,
          blocks: [
            {
              type: "columns",
              mode: "spaceBetween",
              widths: [120, "*"],
              columns: [
                [
                  {
                    type: "image",
                    src: "https://8vn1kchm8s.ufs.sh/f/0baXwn5fA0JkongyeOxJu8rm46a9EQU5sZhHbMiVvFIlf0Xk",
                    width: 120,
                    align: "left",
                  },
                ],
                [
                  {
                    type: "text",
                    text: "{{COMPANY_NAME}}",
                    lineGap: 2,
                    align: "right",
                    bold: true,
                    fontSize: 16,
                    color: "#003366",
                  },
                  {
                    type: "text",
                    text: "{{CC_ADDRESS_LINE_1}},{{CC_ADDRESS_LINE_2}}",
                    fontSize: 9,
                    color: "#555555",
                    lineGap: 2,
                    align: "right",
                  },
                  {
                    type: "text",
                    text: "Phone: {{CC_PHONE_1}} / {{CC_PHONE_2}}",
                    fontSize: 9,
                    color: "#555555",
                    lineGap: 2,
                    align: "right",
                  },
                  {
                    type: "text",
                    text: "Email: {{CC_EMAIL}}",
                    fontSize: 9,
                    color: "#555555",
                    lineGap: 2,
                    align: "right",
                  },
                ],
              ],
            },
            {
              type: "line",
              lineWidth: 1,
              color: "#000000",
              marginTop: 25,
            },
          ],
        },

        content: [
          {
            type: "text",
            text: "{{TITLE}}",
            bold: true,
            fontSize: 16,
            color: "#003366",
            align: "center",
          },
          {
            type: "keyValueGrid",
            keyWidth: "*",
            columnWidths: [280, "*"],
            rowGap: 6,
            keyTextStyle: {
              bold: true,
            },
            marginBottom: 20,
            marginTop: 30,
            separator: ":",
            keyAlign: "left",
            valueAlign: "left",
            columns: [
              [
                { key: "Name", value: "{{NAME}}" },
                { key: "Age/Sex", value: "{{AGE}}/ {{SEX}}" },
                { key: "Appointment ID", value: "{{REF_NO}}" },
                { key: "Contact No.", value: "{{CONTACT_NO}}" },
                { key: "Email Id", value: "{{EMAIL}}" },
                { key: "Patient Address", value: "{{ADDRESS}}" },
                { key: "Patient History", value: "{{PATIENT_HISTORY}}" },
              ],
              [
                { key: "Patient ID", value: "{{PATIENT_ID}}" },
                { key: "Visit No.", value: "{{REF_NO}}" },
                { key: "Bill No.", value: "{{VISIT_NO}}" },
                { key: "Reg Date Time", value: "{{DATE}},{{TIME}}" },
                { key: "Patient Type", value: "{{VISIT_TYPE}}" },
                { key: "Delivery Mode", value: "{{DELIVERY_MODE}}" },
              ],
            ],
          },
          {
            type: "table",
            headerRows: 1,
            widths: [25, 100, 100, "*", "*", "*", "*", "*"],
            body: [
              [
                {
                  text: "Sl No",
                },
                {
                  text: "Doctor Name",
                },
                {
                  text: "Date Time",
                },
                {
                  text: "Amount",
                },
                {
                  text: "VIP",
                },
                {
                  text: "Co-Pay",
                },
                {
                  text: "Discount",
                },
                {
                  text: "Net Amount",
                },
              ],
              [
                { text: "{{SL_NO}}" },
                { text: "{{TABLE_DOCTOR}}" },
                { text: "{{DATE_TIME}}" },
                { text: "{{BASE_RATE}}" },
                { text: "{{VIP}}" },
                { text: "{{CO_PAY}}" },
                { text: "{{DISCOUNT}}" },
                { text: "{{NET_AMOUNT}}" },
              ],
            ],
            layout: {},
          },
          {
            type: "columns",
            mode: "spaceBetween",
            marginTop: 20,
            widths: [350, "*"],
            columns: [
              [
                {
                  type: "text",
                  text: "Billed By: {{BILLED_BY}}",
                  fontSize: 9,
                  lineGap: 2,
                },
                {
                  type: "text",
                  text: "Mode of Payments:",
                  bold: true,
                  fontSize: 10,
                  lineGap: 2,
                },
                {
                  type: "table",
                  widths: ["*"],
                  body: [
                    [
                      {
                        text: "{{TRANSACTION}}",

                        align: "left",
                      },
                    ],
                    [
                      {
                        text: "{{TRANSACTION}}",

                        align: "left",
                      },
                    ],
                  ],
                  layout: {
                    border: "none",
                  },
                },
                {
                  type: "text",
                  text: "To view Patient Report log on to https://localhost/alma_lims/site/userlogin",
                  bold: true,
                  fontSize: 9,
                  color: "#003366",
                  lineGap: 4,
                },
              ],
              [
                {
                  type: "keyValueGrid",
                  keyWidth: 100,
                  columnWidths: ["*"],
                  rowGap: 6,
                  separator: ":",
                  keyAlign: "left",
                  valueAlign: "right",
                  marginBottom: 10,
                  columns: [
                    [
                      { key: "Gross Amount", value: "{{TOTAL_GROSS}}" },
                      { key: "Discount", value: "{{TOTAL_DISCOUNT}}" },
                      { key: "Net Payable", value: "{{TOTAL_NET}}" },
                      { key: "Collected Amount", value: "{{TOTAL_PAID}}" },
                      { key: "Due", value: "{{DUE}}" },
                      { key: "Refund Amount", value: "{{REFUND}}" },
                    ],
                  ],
                },
                {
                  type: "text",
                  text: "User Login: {{USER_LOGIN}}",
                  bold: true,
                  fontSize: 9,
                  lineGap: 1,
                },
                {
                  type: "text",
                  text: "Password: {{USER_PASSWORD}}",
                  bold: true,
                  fontSize: 9,
                },
              ],
            ],
          },
        ],

        footer: {
          marginLeft: 30,
          marginRight: 30,
          blocks: [
            {
              type: "line",
              lineWidth: 1,
              color: "#000000",
              marginBottom: 10,
            },
            {
              type: "text",
              text: "{{FOOTER_MESSAGE}}",
              fontSize: 9,
              align: "center",
              lineGap: 2,
            },
            {
              type: "text",
              text: "{{FOOTER_EMAIL}}",
              fontSize: 9,
              align: "center",
              bold: true,
              lineGap: 2,
            },
          ],
        },
      },
      isDefault: true,
    },
  ];

  await db.coreDynamicShortCode.createMany({
    data: dynamicShortCodes,
  });

  await db.pdfTemplate.createMany({
    data: pdfTemplates,
  });

  await updateDynamicShortCodeConfigsByShortCode(map);

  await redis.disconnect();
  await db.$disconnect();
}
