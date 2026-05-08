import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { fromTimestampToSqlDatetime, PaginatedResponse } from "av6-core-v2";
import {
  ItemStockSummary,
  SearchRequestMisBranch,
} from "@/types/mis/misBranch.js";
import { applyRound } from "av6-utils";
import { RoundFormat } from "@repo/db/generated/prisma/client";
import { settingsService } from "@/services/master/settings.service.js";

export const fetchItemStockPaginated = async ({
  ccId,
  medCategoryId,
  isExpired,
  pageNo = 1,
  pageSize = 10,
  sortDir = "DESC",
  searchText,
  sortBy = "id",
}: SearchRequestMisBranch): Promise<PaginatedResponse<ItemStockSummary>> => {
  const store = await settingsService.getSettings();
  const precision = store?.itemPrecision ?? store?.defaultPrecision ?? 2;
  const offset = (pageNo - 1) * pageSize;
  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";

  let whereClauses = `pi.is_active = 1`;

  if (ccId) {
    whereClauses += ` AND ( pis.branch_id = ${ccId} OR pis.warehouse_id = ${ccId} )`;
  }

  if (medCategoryId) {
    whereClauses += ` AND pi.medicine_category_id = ${medCategoryId}`;
  }

  if (isExpired !== undefined) {
    const today = fromTimestampToSqlDatetime(new Date().toISOString());
    if (isExpired) {
      whereClauses += ` AND pis.expiry_date IS NOT NULL AND pis.expiry_date < '${today}'`;
    } else {
      whereClauses += ` AND (pis.expiry_date IS NULL OR pis.expiry_date >= '${today}')`;
    }
  }

  // 1) total count of matched stock rows
  const [{ total }] = await db.$queryRawUnsafe<{ total: bigint }[]>(`
    SELECT COUNT(*) AS total
      FROM pms_item_stock AS pis
      INNER JOIN pms_item AS pi
        ON pi.id = pis.item_id
     WHERE ${whereClauses}
       AND (
         pi.medicine_name LIKE '${pattern}'
         OR pi.item_number   LIKE '${pattern}'
       );
  `);

  // 2) page of matching stock rows
  const rawData = await db.$queryRawUnsafe<ItemStockSummary[]>(`
    SELECT
      pis.id                                     AS "id",
      pi.item_number                             AS "code",
      pi.medicine_name                           AS "description",
      COALESCE(pis.quantity, 0)                  AS "physicalQty",
      pis.expiry_date                            AS "expiryDate",
      pis.batch_no                               AS "batchNo",
      pb.name                                  AS "branchName",
      pw.name                                  AS "warehouseName",  
      pmc.name                                  AS "category",  
      COALESCE(pi.purchase_amount, 0.00)                         AS "unitCost",
      COALESCE((pi.purchase_amount * COALESCE(pis.quantity, 0)), 0.00) AS "total"
    FROM pms_item_stock AS pis
    INNER JOIN pms_item AS pi
      ON pi.id = pis.item_id
    INNER JOIN pms_med_category AS pmc
      ON pmc.id = pi.medicine_category_id
    left JOIN pms_branch AS pb
      ON pb.id = pis.branch_id
    left JOIN pms_warehouse AS pw
      ON pw.id = pis.warehouse_id
    WHERE ${whereClauses}
      AND (
        pi.medicine_name LIKE '${pattern}'
        OR pi.item_number   LIKE '${pattern}'
      )
    ORDER BY pis.${sortBy} ${sortDir}
    LIMIT ${pageSize}
    OFFSET ${offset};
  `);

  const data: ItemStockSummary[] = rawData.map((row, idx) => ({
    ...row,
    id: offset + idx + 1,
    unitCost: applyRound(row.unitCost, RoundFormat.TO_FIXED, precision),
    total: applyRound(row.total, RoundFormat.TO_FIXED, precision),
  }));

  return {
    data,
    totalRecords: Number(total),
    pageSize,
    currentPageNumber: pageNo,
    lastPageNumber: Math.ceil(Number(total) / pageSize),
  };
};
