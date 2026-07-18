import {
  RawStockOpeningClosingRow,
  StockOpeningClosingFilter,
  StockOpeningClosingGroupBy,
  StockOpeningClosingResponse,
  StockOpeningClosingRow,
  StockOpeningClosingTotals,
} from "@/types/stock/stockOpeningClosing.js";
import { db } from "@repo/db/client";
import { Prisma } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

const formatDateOnly = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toNumber = (
  value: Prisma.Decimal | number | string | bigint | null | undefined
): number => {
  if (value === null || value === undefined) return 0;

  return Number(value);
};

const getNumberFilter = (
  column: Prisma.Sql,
  value?: number,
  values?: number[]
) => {
  if (value !== undefined && value !== null) {
    return Prisma.sql`AND ${column} = ${value}`;
  }

  if (values?.length) {
    return Prisma.sql`AND ${column} IN (${Prisma.join(values)})`;
  }

  return Prisma.empty;
};

const getStringFilter = (
  column: Prisma.Sql,
  value?: string,
  values?: string[]
) => {
  if (value !== undefined && value !== null && value !== "") {
    return Prisma.sql`AND ${column} = ${value}`;
  }

  if (values?.length) {
    return Prisma.sql`AND ${column} IN (${Prisma.join(values)})`;
  }

  return Prisma.empty;
};

const getGroupSql = (groupBy: StockOpeningClosingGroupBy) => {
  switch (groupBy) {
    case "ITEM":
      return {
        select: Prisma.sql`
          s.stock_type AS stockType,
          s.item_id AS itemId,
          MAX(im.item) AS itemName,
          MAX(im.item_code) AS itemCode,
          MAX(ic.id) AS categoryId,
          MAX(ic.name) AS categoryName,

          NULL AS ccId,
          NULL AS fromCcId,
          NULL AS toCcId,
          NULL AS userId,

          NULL AS batchNo,
          NULL AS expiryDate,
          FALSE AS isFoc
        `,
        groupBy: Prisma.sql`
          s.stock_type,
          s.item_id
        `,
      };

    case "ITEM_LOCATION":
      return {
        select: Prisma.sql`
          s.stock_type AS stockType,
          s.item_id AS itemId,
          MAX(im.item) AS itemName,
          MAX(im.item_code) AS itemCode,
          MAX(ic.id) AS categoryId,
          MAX(ic.name) AS categoryName,

          s.cc_id AS ccId,
          s.from_cc_id AS fromCcId,
          s.to_cc_id AS toCcId,
          s.user_id AS userId,

          NULL AS batchNo,
          NULL AS expiryDate,
          FALSE AS isFoc
        `,
        groupBy: Prisma.sql`
          s.stock_type,
          s.item_id,
          s.cc_id,
          s.from_cc_id,
          s.to_cc_id,
          s.user_id
        `,
      };

    case "ITEM_BATCH":
      return {
        select: Prisma.sql`
          s.stock_type AS stockType,
          s.item_id AS itemId,
          MAX(im.item) AS itemName,
          MAX(im.item_code) AS itemCode,
          MAX(ic.id) AS categoryId,
          MAX(ic.name) AS categoryName,

          NULL AS ccId,
          NULL AS fromCcId,
          NULL AS toCcId,
          NULL AS userId,

          s.batch_no AS batchNo,
          s.expiry_date AS expiryDate,
          s.is_foc AS isFoc
        `,
        groupBy: Prisma.sql`
          s.stock_type,
          s.item_id,
          s.batch_no,
          s.expiry_date,
          s.is_foc
        `,
      };

    case "ITEM_LOCATION_BATCH":
    case "FULL":
    default:
      return {
        select: Prisma.sql`
          s.stock_type AS stockType,
          s.item_id AS itemId,
          MAX(im.item) AS itemName,
          MAX(im.item_code) AS itemCode,
          MAX(ic.id) AS categoryId,
          MAX(ic.name) AS categoryName,

          s.cc_id AS ccId,
          s.from_cc_id AS fromCcId,
          s.to_cc_id AS toCcId,
          s.user_id AS userId,

          s.batch_no AS batchNo,
          s.expiry_date AS expiryDate,
          s.is_foc AS isFoc
        `,
        groupBy: Prisma.sql`
          s.stock_type,
          s.item_id,
          s.cc_id,
          s.from_cc_id,
          s.to_cc_id,
          s.user_id,
          s.batch_no,
          s.expiry_date,
          s.is_foc
        `,
      };
  }
};

const STOCK_OPENING_CLOSING_ALLOWED_SORT_COLUMNS = {
  itemName: Prisma.sql`itemName`,
  itemCode: Prisma.sql`itemCode`,
  openingQty: Prisma.sql`openingQty`,
  openingAmount: Prisma.sql`openingAmount`,
  inQty: Prisma.sql`inQty`,
  outQty: Prisma.sql`outQty`,
  netQty: Prisma.sql`netQty`,
  inAmount: Prisma.sql`inAmount`,
  outAmount: Prisma.sql`outAmount`,
  netAmount: Prisma.sql`netAmount`,
  closingQty: Prisma.sql`closingQty`,
  closingAmount: Prisma.sql`closingAmount`,
} as const;

export const getOpeningClosingStock = async (
  filters: StockOpeningClosingFilter
): Promise<StockOpeningClosingResponse> => {
  logger.info("entering::getOpeningClosingStock::repository");

  // const pageNo = filters.pageNo ?? 1;
  // const pageSize = filters.pageSize ?? 20;
  // const offset = (pageNo - 1) * pageSize;

  const fromDate = formatDateOnly(filters.fromDate);
  const toDate = formatDateOnly(filters.toDate);

  const groupBy = filters.groupBy ?? "FULL";
  const groupSql = getGroupSql(groupBy);

  const searchText = filters.searchText?.trim() ?? "";
  const searchPattern = `%${searchText}%`;

  const sortKey =
    filters.sortBy &&
    filters.sortBy in STOCK_OPENING_CLOSING_ALLOWED_SORT_COLUMNS
      ? filters.sortBy
      : "itemName";

  const orderByColumn = STOCK_OPENING_CLOSING_ALLOWED_SORT_COLUMNS[sortKey];
  const orderDirection =
    filters.sortDir === "DESC" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  const stockTypeFilter = filters.stockType
    ? Prisma.sql`AND s.stock_type = ${filters.stockType}`
    : Prisma.empty;

  const itemFilter = getNumberFilter(
    Prisma.sql`s.item_id`,
    filters.itemId,
    filters.itemIds
  );

  const categoryFilter = getNumberFilter(
    Prisma.sql`im.item_category_id`,
    filters.categoryId,
    filters.categoryIds
  );

  const ccFilter = getNumberFilter(
    Prisma.sql`s.cc_id`,
    filters.ccId,
    filters.ccIds
  );

  const fromCcFilter = getNumberFilter(
    Prisma.sql`s.from_cc_id`,
    filters.fromCcId,
    filters.fromCcIds
  );

  const toCcFilter = getNumberFilter(
    Prisma.sql`s.to_cc_id`,
    filters.toCcId,
    filters.toCcIds
  );

  const userFilter = getNumberFilter(
    Prisma.sql`s.user_id`,
    filters.userId,
    filters.userIds
  );

  const batchFilter = getStringFilter(
    Prisma.sql`s.batch_no`,
    filters.batchNo,
    filters.batchNos
  );

  const expiryFilter = filters.expiryDate
    ? Prisma.sql`AND s.expiry_date = ${formatDateOnly(filters.expiryDate)}`
    : Prisma.empty;

  const focFilter =
    filters.isFoc !== undefined && filters.isFoc !== null
      ? Prisma.sql`AND s.is_foc = ${filters.isFoc}`
      : Prisma.empty;

  const searchFilter =
    searchText.length > 0
      ? Prisma.sql`
        AND (
          im.item LIKE ${searchPattern}
          OR im.item_code LIKE ${searchPattern}
          OR ic.name LIKE ${searchPattern}
          OR COALESCE(s.batch_no, '') LIKE ${searchPattern}
        )
      `
      : Prisma.empty;

  const zeroFilter = filters.includeZero
    ? Prisma.sql`1 = 1`
    : Prisma.sql`
      (
        openingQty <> 0
        OR openingAmount <> 0
        OR inQty <> 0
        OR outQty <> 0
        OR netQty <> 0
        OR inAmount <> 0
        OR outAmount <> 0
        OR netAmount <> 0
        OR closingQty <> 0
        OR closingAmount <> 0
      )
    `;

  const rawRows = await db.$queryRaw<RawStockOpeningClosingRow[]>`
    WITH grouped AS (
      SELECT
        ${groupSql.select},

        COALESCE(SUM(CASE
          WHEN s.stock_date < ${fromDate}
          THEN s.net_qty
          ELSE 0
        END), 0) AS openingQty,

        COALESCE(SUM(CASE
          WHEN s.stock_date < ${fromDate}
          THEN s.net_amount
          ELSE 0
        END), 0) AS openingAmount,

        COALESCE(SUM(CASE
          WHEN s.stock_date >= ${fromDate} AND s.stock_date <= ${toDate}
          THEN s.in_qty
          ELSE 0
        END), 0) AS inQty,

        COALESCE(SUM(CASE
          WHEN s.stock_date >= ${fromDate} AND s.stock_date <= ${toDate}
          THEN s.out_qty
          ELSE 0
        END), 0) AS outQty,

        COALESCE(SUM(CASE
          WHEN s.stock_date >= ${fromDate} AND s.stock_date <= ${toDate}
          THEN s.net_qty
          ELSE 0
        END), 0) AS netQty,

        COALESCE(SUM(CASE
          WHEN s.stock_date >= ${fromDate} AND s.stock_date <= ${toDate}
          THEN s.in_amount
          ELSE 0
        END), 0) AS inAmount,

        COALESCE(SUM(CASE
          WHEN s.stock_date >= ${fromDate} AND s.stock_date <= ${toDate}
          THEN s.out_amount
          ELSE 0
        END), 0) AS outAmount,

        COALESCE(SUM(CASE
          WHEN s.stock_date >= ${fromDate} AND s.stock_date <= ${toDate}
          THEN s.net_amount
          ELSE 0
        END), 0) AS netAmount,

        COALESCE(SUM(CASE
          WHEN s.stock_date <= ${toDate}
          THEN s.net_qty
          ELSE 0
        END), 0) AS closingQty,

        COALESCE(SUM(CASE
          WHEN s.stock_date <= ${toDate}
          THEN s.net_amount
          ELSE 0
        END), 0) AS closingAmount

      FROM inv_stock_daily_summary s

      LEFT JOIN inv_item_master im
        ON im.id = s.item_id
       AND im.is_active = 1
       AND im.deleted_at IS NULL

      LEFT JOIN inv_item_category ic
        ON ic.id = im.item_category_id
       AND ic.is_active = 1
       AND ic.deleted_at IS NULL

      WHERE s.financial_year_id = ${filters.financialYearId}
        AND s.stock_date <= ${toDate}

        ${stockTypeFilter}
        ${itemFilter}
        ${categoryFilter}
        ${ccFilter}
        ${fromCcFilter}
        ${toCcFilter}
        ${userFilter}
        ${batchFilter}
        ${expiryFilter}
        ${focFilter}
        ${searchFilter}

      GROUP BY ${groupSql.groupBy}
    ),

    filtered AS (
      SELECT *
      FROM grouped
      WHERE ${zeroFilter}
    )

    SELECT
      filtered.*,

      COUNT(*) OVER() AS totalRecords,

      COALESCE(SUM(openingQty) OVER(), 0) AS totalOpeningQty,
      COALESCE(SUM(openingAmount) OVER(), 0) AS totalOpeningAmount,

      COALESCE(SUM(inQty) OVER(), 0) AS totalInQty,
      COALESCE(SUM(outQty) OVER(), 0) AS totalOutQty,
      COALESCE(SUM(netQty) OVER(), 0) AS totalNetQty,

      COALESCE(SUM(inAmount) OVER(), 0) AS totalInAmount,
      COALESCE(SUM(outAmount) OVER(), 0) AS totalOutAmount,
      COALESCE(SUM(netAmount) OVER(), 0) AS totalNetAmount,

      COALESCE(SUM(closingQty) OVER(), 0) AS totalClosingQty,
      COALESCE(SUM(closingAmount) OVER(), 0) AS totalClosingAmount

    FROM filtered

    ORDER BY ${orderByColumn} ${orderDirection}
  `;

  // -- LIMIT ${pageSize}
  // -- OFFSET ${offset}

  const totalRecords = rawRows.length > 0 ? Number(rawRows[0].totalRecords) : 0;

  const totals: StockOpeningClosingTotals =
    rawRows.length > 0
      ? {
          openingQty: toNumber(rawRows[0].totalOpeningQty),
          openingAmount: toNumber(rawRows[0].totalOpeningAmount),

          inQty: toNumber(rawRows[0].totalInQty),
          outQty: toNumber(rawRows[0].totalOutQty),
          netQty: toNumber(rawRows[0].totalNetQty),

          inAmount: toNumber(rawRows[0].totalInAmount),
          outAmount: toNumber(rawRows[0].totalOutAmount),
          netAmount: toNumber(rawRows[0].totalNetAmount),

          closingQty: toNumber(rawRows[0].totalClosingQty),
          closingAmount: toNumber(rawRows[0].totalClosingAmount),
        }
      : {
          openingQty: 0,
          openingAmount: 0,

          inQty: 0,
          outQty: 0,
          netQty: 0,

          inAmount: 0,
          outAmount: 0,
          netAmount: 0,

          closingQty: 0,
          closingAmount: 0,
        };

  const rows: StockOpeningClosingRow[] = rawRows.map((row) => ({
    stockType: row.stockType,

    itemId: Number(row.itemId),
    itemName: row.itemName,
    itemCode: row.itemCode,
    categoryId: row.categoryId ? Number(row.categoryId) : null,
    categoryName: row.categoryName,

    ccId: row.ccId ? Number(row.ccId) : null,
    fromCcId: row.fromCcId ? Number(row.fromCcId) : null,
    toCcId: row.toCcId ? Number(row.toCcId) : null,
    userId: row.userId ? Number(row.userId) : null,

    batchNo: row.batchNo,
    expiryDate: row.expiryDate,
    isFoc: Boolean(row.isFoc),

    openingQty: toNumber(row.openingQty),
    openingAmount: toNumber(row.openingAmount),

    inQty: toNumber(row.inQty),
    outQty: toNumber(row.outQty),
    netQty: toNumber(row.netQty),

    inAmount: toNumber(row.inAmount),
    outAmount: toNumber(row.outAmount),
    netAmount: toNumber(row.netAmount),

    closingQty: toNumber(row.closingQty),
    closingAmount: toNumber(row.closingAmount),
  }));

  logger.info("exiting::getOpeningClosingStock::repository");

  return {
    rows,
    totals,
    totalRecords,
    // currentPageNumber: pageNo,
    // lastPageNumber: Math.max(1, Math.ceil(totalRecords / pageSize)),
    // pageSize,
  };
};
