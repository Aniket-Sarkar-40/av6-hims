import { settingsService } from "@/services/master/settings.service.js";
import { PaginatedResponse } from "av6-core-v2";
import { IStoreRequisitionByItemSummary } from "@/types/mis/misStoreRequisition.js";
import { applyRound, RoundFormat } from "av6-utils";
import { db } from "@repo/db";
import { Prisma } from "@repo/db/generated/prisma/client";

export const fetchStoreRequisitionByItemPaginated = async (
  page: number,
  perPage: number,
  branchId: number,
  sort: "ASC" | "DESC" = "DESC"
): Promise<PaginatedResponse<IStoreRequisitionByItemSummary>> => {
  const setting = await settingsService.getSettings();
  const precision = setting?.grnPrecision ?? setting?.defaultPrecision ?? 2;

  if (branchId === undefined || branchId === null) {
    throw new Error("branchId is required");
  }
  const unlimited =
    !Number.isFinite(perPage) ||
    perPage <= 0 ||
    perPage >= Number.MAX_SAFE_INTEGER;

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (unlimited) perPage = Number.MAX_SAFE_INTEGER;

  const offset = (page - 1) * perPage;

  const [{ total }] = await db.$queryRaw<{ total: bigint }[]>(Prisma.sql`
    SELECT COUNT(DISTINCT rd.item_id) AS total
    FROM pms_store_requisition         AS r
    JOIN pms_store_requisition_details AS rd
      ON rd.store_requisition_id = r.id
    WHERE r.branch_id = ${branchId}
      AND r.date     >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
      AND r.is_active = 1
      AND rd.is_active = 1
  `);

  const limitOffset = unlimited
    ? Prisma.sql``
    : Prisma.sql`LIMIT ${perPage} OFFSET ${offset}`;

  const rawData = await db.$queryRaw<
    IStoreRequisitionByItemSummary[]
  >(Prisma.sql`
    WITH demand AS (
      SELECT rd.item_id,
             SUM(rd.req_quantity) AS total_yearly_req_qty
      FROM pms_store_requisition         AS r
      JOIN pms_store_requisition_details AS rd
        ON rd.store_requisition_id = r.id
      WHERE r.branch_id = ${branchId}
        AND r.date     >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
        AND r.is_active = 1
        AND rd.is_active = 1
      GROUP BY rd.item_id
    ),
    stock AS (
      SELECT item_id,
             SUM(quantity) AS branch_stock
      FROM pms_item_stock
      WHERE is_active = 1
        AND branch_id = ${branchId}
      GROUP BY item_id
    )
    SELECT
      d.item_id                                  AS id,
      i.medicine_name                            AS description,
      ROUND(d.total_yearly_req_qty / 12)         AS monthlyDemand,
      ROUND(d.total_yearly_req_qty / 4)          AS quarterlyDemand,
      d.total_yearly_req_qty                     AS requestedQty,
      COALESCE(st.branch_stock, 0)               AS qtyInStore,
      COALESCE(i.purchase_amount, 0.00)                          AS unitCost,
      COALESCE(i.purchase_amount * d.total_yearly_req_qty, 0.00) AS total
    FROM demand d
    JOIN pms_item i ON i.id = d.item_id AND i.is_active = 1
    LEFT JOIN stock st ON st.item_id = d.item_id
    ORDER BY d.item_id ${Prisma.raw(sort)}
    ${limitOffset}
  `);

  const totalRows = Number(total);
  const pageSize = unlimited ? totalRows : perPage;
  const lastPage = unlimited ? 1 : Math.ceil(totalRows / perPage);
  const currentPage = unlimited ? 1 : page;

  const data: IStoreRequisitionByItemSummary[] = rawData.map((row) => ({
    ...row,
    unitCost: applyRound(row.unitCost, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));

  return {
    data,
    totalRecords: totalRows,
    pageSize,
    currentPageNumber: currentPage,
    lastPageNumber: lastPage,
  };
};
