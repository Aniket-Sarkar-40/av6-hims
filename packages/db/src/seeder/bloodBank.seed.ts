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
const DYNAMIC_SC_CACHE_KEY = `${redisPrefix}blood-bank:dynamicShortCode:all`;

async function updateDynamicShortCodeConfigsByShortCode(
  input: Record<string, Prisma.InputJsonObject>
) {
  const mapping = Object.entries(input);

  await db.$transaction(
    mapping.map(([shortCode, config]) =>
      db.bloodBankDynamicShortCode.updateMany({
        where: { shortCode },
        data: { config },
      })
    )
  );
}

export async function runSeed() {
  await redis.connect();

  const rows = await db.bloodBankDynamicShortCode.findMany({
    select: { shortCode: true, config: true },
    where: { config: { not: Prisma.JsonNull } },
  });

  const map: Record<string, any> = {};
  for (const r of rows) map[r.shortCode] = r.config;

  console.log("🧹 Truncating tables...");
  await db.$executeRawUnsafe("TRUNCATE TABLE `bb_dynamic_short_code`;");

  await redis.del(DYNAMIC_SC_CACHE_KEY);

  const dynamicShortCodes: DynamicShortCodeSeeder[] = [
    {
      shortCode: "SETTINGS",
      tableName: "bloodBankSetting",
      isDTO: false,
      isCacheable: false,
      permission: "blood-bank:settings:view",
      isDropDown: true,
    },
    {
      shortCode: "UIN_CONFIG",
      tableName: "bloodBankUINConfig",
      isDTO: true,
      isCacheable: true,
      permission: "blood-bank:uin-config:view",
    },
    {
      shortCode: "COLLECTION_CENTER",
      tableName: "collectionCenter",
      isDTO: true,
      isCacheable: true,
      permission: "blood-bank:collection-center:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "HOSPITAL",
      tableName: "hospital",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "blood-bank:hospital:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "name" }),
    },
    {
      shortCode: "BLOOD_BANK_CENTER",
      tableName: "bloodBankCenter",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "blood-bank:blood-bank-center:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "centerName" }),
    },
    {
      shortCode: "BLOOD_COMPONENT",
      tableName: "bloodComponent",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "blood-bank:blood-component:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "componentName" }),
    },
    {
      shortCode: "BLOOD_CROSS_MATCH_METHOD",
      tableName: "bloodCrossMatchMethod",
      isDTO: true,
      isSingleDto: false,
      isCacheable: true,
      permission: "blood-bank:blood-cross-match-method:view",
      isDropDown: true,
      whereClause: JSON.stringify({ isActive: true }),
      selectClause: JSON.stringify({ id: "id", value: "methodName" }),
    },
  ];

  await db.bloodBankDynamicShortCode.createMany({
    data: dynamicShortCodes,
  });

  await updateDynamicShortCodeConfigsByShortCode(map);

  await redis.disconnect();
  await db.$disconnect();
}
