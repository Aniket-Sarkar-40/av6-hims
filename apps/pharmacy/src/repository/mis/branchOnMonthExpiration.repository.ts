import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { PaginatedResponse } from "av6-core-v2";
import {
  BranchOnMonthExpiration,
  BranchOnMonthExpirationAmt,
  HighestDrugSold,
} from "@/types/mis/branchOnMonthExpiration.js";
import { applyRound } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma, RoundFormat } from "@repo/db/generated/prisma/client";
import { settingsService } from "@/services/master/settings.service.js";

export const branchOnMonthExpiration = async (
  page = 1,
  perPage = Number.MAX_SAFE_INTEGER,
  sort?: "ASC" | "DESC",
  searchText?: string,
  categoryId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<PaginatedResponse<BranchOnMonthExpiration>> => {
  logger.info("entering::branchOnMonthExpiration::service");

  const offset = (page - 1) * perPage;
  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";
  const orderSql = sort ? `ORDER BY s.batch_no ${sort}` : "";
  const store = await settingsService.getSettings();
  const precision = store?.itemPrecision ?? store?.defaultPrecision ?? 2;
  let expiryInMonth = store?.expiryInMonth ?? 1;
  if (!Number.isFinite(expiryInMonth) || expiryInMonth < 1) {
    expiryInMonth = 1;
  }

  const categoryCondition = categoryId
    ? `AND i.medicine_category_id = ${categoryId}`
    : "";

  let expiryDateCondition = `
    s.expiry_date BETWEEN CURDATE()
      AND LAST_DAY(DATE_ADD(CURDATE(), INTERVAL ${expiryInMonth} MONTH))
  `;
  if (startDate && endDate) {
    expiryDateCondition = `
      s.expiry_date BETWEEN '${startDate}' AND '${endDate}'
    `;
  }

  const [{ total }] = await db.$queryRawUnsafe<{ total: bigint }[]>(`
    SELECT COUNT(DISTINCT s.id) AS total
    FROM pms_branch     AS b
    JOIN pms_item_stock AS s
      ON s.branch_id = b.id
     AND b.is_active  = 1
    JOIN pms_item       AS i
      ON s.item_id = i.id
     AND i.is_active  = 1
    WHERE s.is_active = 1
      AND ${expiryDateCondition}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR b.name          LIKE '${pattern}'
      )
      ${categoryCondition};
  `);

  const rawData = await db.$queryRawUnsafe<BranchOnMonthExpiration[]>(`
    SELECT
      s.id                         AS "id",
      i.medicine_name              AS "itemName",
      b.name                       AS "branch",
      COALESCE(i.sale_amount, 0.00)                AS "sellingPrice",
      s.quantity                   AS "physicalQty",
      COALESCE((i.sale_amount * s.quantity), 0.00) AS "total",
      s.batch_no                   AS "batch",
      s.expiry_date                AS "expiryDate"
    FROM pms_branch     AS b
    JOIN pms_item_stock AS s
      ON s.branch_id = b.id
     AND b.is_active  = 1
    JOIN pms_item       AS i
      ON s.item_id = i.id
     AND i.is_active  = 1
    WHERE s.is_active = 1
      AND ${expiryDateCondition}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR b.name          LIKE '${pattern}'
      )
      ${categoryCondition}
    ${orderSql}
    LIMIT  ${perPage}
    OFFSET ${offset};
  `);

  const data: BranchOnMonthExpiration[] = rawData.map((row, idx) => ({
    ...row,
    id: offset + idx + 1,
    sellingPrice: applyRound(row.sellingPrice, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));

  logger.info("exiting::branchOnMonthExpiration::service");

  return {
    data,
    totalRecords: Number(total),
    pageSize: perPage,
    currentPageNumber: page,
    lastPageNumber: Math.ceil(Number(total) / perPage),
  };
};

export const branchOnMonthExpirationAmt = async (): Promise<
  BranchOnMonthExpirationAmt[]
> => {
  logger.info("entering::branchOnMonthExpirationAmt::service");

  const store = await settingsService.getSettings();
  const precision = store?.itemPrecision ?? store?.defaultPrecision ?? 2;
  let expiryInMonth = store?.expiryInMonth ?? 1;
  if (!Number.isFinite(expiryInMonth) || expiryInMonth < 1) expiryInMonth = 1;

  const rawData = await db.$queryRaw<BranchOnMonthExpirationAmt[]>(Prisma.sql`
    SELECT
      b.name                           AS "branch",
      COALESCE(SUM(i.sale_amount * s.quantity), 0.00)  AS "amount"
    FROM pms_branch     AS b
    JOIN pms_item_stock AS s ON s.branch_id = b.id AND b.is_active = 1
    JOIN pms_item       AS i ON s.item_id   = i.id AND i.is_active = 1
    WHERE s.is_active = 1
      AND s.expiry_date BETWEEN CURDATE()
                           AND LAST_DAY(
                                 DATE_ADD(
                                   CURDATE(),
                                   INTERVAL ${expiryInMonth} MONTH
                                 )
                               )
    GROUP BY b.name
    ORDER BY b.name
  `);
  const data: BranchOnMonthExpirationAmt[] = rawData.map((row) => ({
    ...row,
    amount: applyRound(row.amount, RoundFormat.TO_FIXED, precision),
  }));
  logger.info("exiting::branchOnMonthExpirationAmt::service");
  return data;
};

export const getHighestSellingDrugByBranch = async (
  page: number,
  perPage: number,
  sort: "ASC" | "DESC",
  searchText: string | undefined,
  id: number,
  categoryId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<PaginatedResponse<HighestDrugSold>> => {
  logger.info("entering::getHighestSellingDrugByBranch::service");
  const store = await settingsService.getSettings();
  const precision = store?.sellPrecision ?? store?.defaultPrecision ?? 2;

  const offset = (page - 1) * perPage;
  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";

  const categoryCondition = categoryId
    ? `AND i.medicine_category_id = ${categoryId}`
    : "";
  const dateCondition =
    startDate && endDate
      ? `AND s.bill_date BETWEEN '${startDate}' AND '${endDate}'`
      : "";

  const [{ total }] = await db.$queryRawUnsafe<{ total: bigint }[]>(`
    SELECT
      COUNT(DISTINCT sd.item_id) AS total
    FROM pms_sell_details AS sd
    JOIN pms_sell   AS s   ON sd.sell_id = s.id
    JOIN pms_item   AS i   ON sd.item_id = i.id
    JOIN pms_med_category AS cat
      ON i.medicine_category_id = cat.id
    WHERE
      sd.is_active = 1
      AND s.is_active = 1
      AND s.cc_id = ${id}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR cat.name        LIKE '${pattern}'
      )
      ${dateCondition}
      ${categoryCondition}


  `);

  const rawData = await db.$queryRawUnsafe<Omit<HighestDrugSold, "id">[]>(`
    SELECT
      i.medicine_name                                            AS "itemName",
      cat.name                                                   AS "category",
      ROUND(SUM(sd.quantity - sd.return_quantity), 2)            AS "quantitySold",
      COALESCE(i.sale_amount, 0.00)                                    AS "mrp",
      COALESCE(
        SUM((sd.quantity - sd.return_quantity) * i.sale_amount),
      0.00)                                                          AS "total"
    FROM pms_sell_details AS sd
    JOIN pms_sell   AS s   ON sd.sell_id = s.id
    JOIN pms_item   AS i   ON sd.item_id = i.id
    JOIN pms_med_category AS cat
      ON i.medicine_category_id = cat.id
    WHERE
      sd.is_active = 1
      AND s.is_active = 1
      AND s.cc_id = ${id}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR cat.name        LIKE '${pattern}'
      )
      ${dateCondition}
      ${categoryCondition}
    GROUP BY
      sd.item_id,
      i.medicine_name,
      cat.name,
      i.sale_amount
    ORDER BY
      SUM(sd.quantity - sd.return_quantity) ${sort}
    LIMIT ${perPage}
    OFFSET ${offset};
  `);

  const data: HighestDrugSold[] = rawData.map((row, idx) => ({
    id: offset + idx + 1,
    ...row,
    quantitySold: applyRound(row.quantitySold, RoundFormat.TO_FIXED, precision),
    mrp: applyRound(row.mrp, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));

  logger.info("exiting::getHighestSellingDrugByBranch::service");
  return {
    data,
    totalRecords: Number(total),
    pageSize: perPage,
    currentPageNumber: page,
    lastPageNumber: Math.ceil(Number(total) / perPage),
  };
};

export const getHighestAmountSellDrugByBranch = async (
  page: number,
  perPage: number,
  sort: "ASC" | "DESC",
  searchText: string | undefined,
  id: number,
  categoryId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<PaginatedResponse<HighestDrugSold>> => {
  logger.info("entering::getHighestAmountSellDrugByBranch::service");
  const store = await settingsService.getSettings();
  const precision = store?.sellPrecision ?? store?.defaultPrecision ?? 2;
  const offset = (page - 1) * perPage;
  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";

  const categoryCondition = categoryId
    ? `AND i.medicine_category_id = ${categoryId}`
    : "";
  const dateCondition =
    startDate && endDate
      ? `AND s.bill_date BETWEEN '${startDate}' AND '${endDate}'`
      : "";

  const [{ total }] = await db.$queryRawUnsafe<{ total: bigint }[]>(`
    SELECT
      COUNT(DISTINCT sd.item_id) AS total
    FROM pms_sell_details AS sd
    JOIN pms_sell           AS s   ON sd.sell_id = s.id
    JOIN pms_item           AS i   ON sd.item_id = i.id
    JOIN pms_med_category   AS cat ON i.medicine_category_id = cat.id
    WHERE
      sd.is_active = 1
      AND s.is_active = 1
      AND s.cc_id    = ${id}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR cat.name        LIKE '${pattern}'
      )
      ${dateCondition}
      ${categoryCondition}
      ;
  `);

  const rawData = await db.$queryRawUnsafe<Omit<HighestDrugSold, "id">[]>(`
    SELECT
      i.medicine_name                                                      AS "itemName",
      cat.name                                                             AS "category",
      ROUND(SUM(sd.quantity - sd.return_quantity), 2)                      AS "quantitySold",
      COALESCE(i.sale_amount, 0.00)                                              AS "mrp",
      COALESCE(
        SUM((sd.quantity - sd.return_quantity) * i.sale_amount),
      0.00)                                                                    AS "total"
    FROM pms_sell_details AS sd
    JOIN pms_sell           AS s   ON sd.sell_id = s.id
    JOIN pms_item           AS i   ON sd.item_id = i.id
    JOIN pms_med_category   AS cat ON i.medicine_category_id = cat.id
    WHERE
      sd.is_active = 1
      AND s.is_active = 1
      AND s.cc_id    = ${id}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR cat.name        LIKE '${pattern}'
      )

      ${dateCondition}
      ${categoryCondition}
    GROUP BY
      sd.item_id,
      i.medicine_name,
      cat.name,
      i.sale_amount
    ORDER BY
      SUM((sd.quantity - sd.return_quantity) * i.sale_amount) ${sort}
    LIMIT ${perPage}
    OFFSET ${offset};
  `);

  const data: HighestDrugSold[] = rawData.map((row, idx) => ({
    id: offset + idx + 1,
    ...row,
    quantitySold: applyRound(row.quantitySold, RoundFormat.TO_FIXED, precision),
    mrp: applyRound(row.mrp, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));

  logger.info("exiting::getHighestAmountSellDrugByBranch::service");
  return {
    data,
    totalRecords: Number(total),
    pageSize: perPage,
    currentPageNumber: page,
    lastPageNumber: Math.ceil(Number(total) / perPage),
  };
};

export async function getHighestSellingDrugByBranchExcel(
  id: number,
  searchText?: string,
  categoryId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<HighestDrugSold[]> {
  logger.info("entering::getHighestSellingDrugByBranchExcel::repository");
  const store = await settingsService.getSettings();
  const precision = store?.sellPrecision ?? store?.defaultPrecision ?? 2;

  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";

  const categoryCondition = categoryId
    ? `AND i.medicine_category_id = ${categoryId}`
    : "";
  const dateCondition =
    startDate && endDate
      ? `AND s.bill_date BETWEEN '${startDate}' AND '${endDate}'`
      : "";
  const rawData = await db.$queryRawUnsafe<Omit<HighestDrugSold, "id">[]>(`
    SELECT
      i.medicine_name AS "itemName",
      cat.name        AS "category",
      ROUND(SUM(sd.quantity - sd.return_quantity), 2) AS "quantitySold",
      COALESCE(i.sale_amount, 0.00)                       AS "mrp",
      COALESCE(SUM((sd.quantity - sd.return_quantity) * i.sale_amount), 0.00) AS "total"
    FROM pms_sell_details sd
    JOIN pms_sell s     ON sd.sell_id = s.id
    JOIN pms_item i     ON sd.item_id = i.id
    JOIN pms_med_category cat
      ON i.medicine_category_id = cat.id
    WHERE
      sd.is_active = 1
      AND s.is_active = 1
      AND s.cc_id = ${id}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR cat.name       LIKE '${pattern}'
      )
      ${dateCondition}
      ${categoryCondition}
    GROUP BY
      sd.item_id, i.medicine_name, cat.name, i.sale_amount
    ORDER BY
      SUM(sd.quantity - sd.return_quantity) DESC
  `);

  logger.info("exiting::getHighestSellingDrugByBranchExcel::repository");
  return rawData.map((row, idx) => ({
    id: idx + 1,
    ...row,
    quantitySold: applyRound(row.quantitySold, RoundFormat.TO_FIXED, precision),
    mrp: applyRound(row.mrp, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));
}

export async function getHighestAmountSellDrugByBranchAll(
  id: number,
  searchText?: string,
  categoryId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<HighestDrugSold[]> {
  logger.info("entering::getHighestAmountSellDrugByBranchAll::repository");
  const store = await settingsService.getSettings();
  const precision = store?.sellPrecision ?? store?.defaultPrecision ?? 2;
  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";

  const categoryCondition = categoryId
    ? `AND i.medicine_category_id = ${categoryId}`
    : "";
  const dateCondition =
    startDate && endDate
      ? `AND s.bill_date BETWEEN '${startDate}' AND '${endDate}'`
      : "";

  const rawData = await db.$queryRawUnsafe<Omit<HighestDrugSold, "id">[]>(`
    SELECT
      i.medicine_name                                                      AS "itemName",
      cat.name                                                             AS "category",
      ROUND(SUM(sd.quantity - sd.return_quantity), 2)                      AS "quantitySold",
      COALESCE(i.sale_amount, 0.00)                                              AS "mrp",
      COALESCE(SUM((sd.quantity - sd.return_quantity) * i.sale_amount), 0.00)     AS "total"
    FROM pms_sell_details AS sd
    JOIN pms_sell           AS s   ON sd.sell_id = s.id
    JOIN pms_item           AS i   ON sd.item_id = i.id
    JOIN pms_med_category   AS cat ON i.medicine_category_id = cat.id
    WHERE
      sd.is_active = 1
      AND s.is_active = 1
      AND s.cc_id    = ${id}
      AND (
        i.medicine_name LIKE '${pattern}'
        OR cat.name       LIKE '${pattern}'
      )
      ${dateCondition}
      ${categoryCondition}
    GROUP BY
      sd.item_id, i.medicine_name, cat.name, i.sale_amount
    ORDER BY
      SUM((sd.quantity - sd.return_quantity) * i.sale_amount) DESC
  `);
  logger.info("exiting::getHighestAmountSellDrugByBranchAll::repository");
  return rawData.map((row, idx) => ({
    id: idx + 1,
    ...row,
    quantitySold: applyRound(row.quantitySold, RoundFormat.TO_FIXED, precision),
    mrp: applyRound(row.mrp, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));
}
