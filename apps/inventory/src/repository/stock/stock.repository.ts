import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { toStockEntity } from "@/mapper/purchase/storeRequisition.mapper.js";
import {
  CreateItemStockInput,
  ExpiredItemsResponse,
  ExpiringItemsResponse,
  InTransitStockByBatchInput,
  ItemBatchStockLookupInput,
  ItemStockAudit,
  ItemStockPaginatedRes,
  ItemStockReportRawRow,
  ItemStockReportRow,
  ItemStockResponse,
  ItemStockSearchFilter,
  ItemStockSummaryRow,
  LowStockResponse,
  RawItemStock,
} from "@/types/stock/stock.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Action, InvItemStock, Prisma } from "@repo/db/generated/prisma/client";
import { ItemStockByBatchInput } from "../../types/stock/stock.js";
import { settingsService } from "@/services/master/settings.service.js";
import { serializeBigInt } from "@repo/shared/utils/bigInt.utils.js";
import { customOmit } from "av6-core-v2";
import { resolveItemStockLocationFlags } from "@/utils/getCollectionCenter.utils.js";
import { getSettingsInDb } from "@/repository/master/settings.repository.js";

type Tx = Prisma.TransactionClient;

export const addItemStock = async (
  tx: Tx,
  data: CreateItemStockInput,
  detail: ItemStockAudit,
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const ccId = data.ccId ?? null;
  const userId = data.userId ?? null;
  const batchNo = data.batchNo ?? null;
  const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  const isStockExists = await tx.invItemStock.findFirst({
    where: {
      itemId: data.itemId,
      ccId,
      userId,
      batchNo,
      expiryDate,
      isFoc: data.isFoc,
      isActive: true,
    },
  });
  let stockId: number = isStockExists ? isStockExists.id : 0;
  if (isStockExists) {
    //update the quantity
    await tx.invItemStock.update({
      where: {
        id: isStockExists.id,
      },
      data: {
        quantity: isStockExists.quantity + data.quantity,
        updatedBy: currentUser,
      },
    });
  } else {
    const created = await tx.invItemStock.create({
      data: {
        ...data,
        ccId,
        userId,
        batchNo,
        expiryDate,
        createdBy: currentUser,
      },
    });
    stockId = created.id;
  }

  await tx.invItemStockAudit.create({
    data: {
      itemStockId: stockId,
      quantity: data.quantity,
      action: Action.ADDITION,
      operation: detail.operation,
      refApprovedAt: detail.refApprovedAt
        ? new Date(detail.refApprovedAt)
        : null,
      refApprovedBy: detail.refApprovedBy ?? null,
      refId: detail.refId ?? null,
      refDetailsId: detail.refDetailsId ?? null,
      refDate: detail.refDate ? new Date(detail.refDate) : null,
      refNo: detail.refNo ?? null,
      createdBy: currentUser,
    },
  });
};

type SubItemStockOptions = {
  consumeFromAll?: boolean;
};

export const subItemStock = async (
  tx: Tx,
  data: CreateItemStockInput,
  detail: ItemStockAudit,
  options: SubItemStockOptions = {},
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const consumeFromAll = options.consumeFromAll ?? false;

  if (!consumeFromAll) {
    const isStockExists = await tx.invItemStock.findFirst({
      where: {
        itemId: data.itemId,
        ccId: data.ccId ?? null,
        batchNo: data.batchNo ?? null,
        userId: data.userId ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isFoc: data.isFoc ?? false,
        isActive: true,
      },
    });

    if (!isStockExists || isStockExists.quantity < data.quantity) {
      throw new ErrorHandler(400, "Insufficient stock to consume");
    }

    await tx.invItemStock.update({
      where: {
        id: isStockExists.id,
      },
      data: {
        quantity: isStockExists.quantity - data.quantity,
        updatedBy: currentUser,
      },
    });

    await tx.invItemStockAudit.create({
      data: {
        itemStockId: isStockExists.id,
        quantity: data.quantity,
        action: Action.SUBTRACTION,
        operation: detail.operation,
        refApprovedAt: detail.refApprovedAt
          ? new Date(detail.refApprovedAt)
          : null,
        refApprovedBy: detail.refApprovedBy ?? null,
        refId: detail.refId ?? null,
        refDetailsId: detail.refDetailsId ?? null,
        refDate: detail.refDate ? new Date(detail.refDate) : null,
        refNo: detail.refNo ?? null,
        createdBy: currentUser,
      },
    });

    return;
  }

  const itemStocks = await tx.invItemStock.findMany({
    where: {
      itemId: data.itemId,
      ccId: data.ccId ?? null,
      batchNo: data.batchNo ?? null,
      userId: data.userId ?? null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isActive: true,
    },
  });

  const totalAvailableQty = itemStocks.reduce((sum, stock) => {
    return sum + stock.quantity;
  }, 0);

  if (totalAvailableQty < data.quantity) {
    throw new ErrorHandler(400, "Insufficient stock to consume");
  }

  let remainingQty = data.quantity;

  for (const stock of itemStocks) {
    if (remainingQty <= 0) break;

    const consumeQty = Math.min(stock.quantity, remainingQty);

    await tx.invItemStock.update({
      where: {
        id: stock.id,
      },
      data: {
        quantity: stock.quantity - consumeQty,
        updatedBy: currentUser,
      },
    });

    await tx.invItemStockAudit.create({
      data: {
        itemStockId: stock.id,
        quantity: consumeQty,
        action: Action.SUBTRACTION,
        operation: detail.operation,
        refApprovedAt: detail.refApprovedAt
          ? new Date(detail.refApprovedAt)
          : null,
        refApprovedBy: detail.refApprovedBy ?? null,
        refId: detail.refId ?? null,
        refDetailsId: detail.refDetailsId ?? null,
        refDate: detail.refDate ? new Date(detail.refDate) : null,
        refNo: detail.refNo ?? null,
        createdBy: currentUser,
      },
    });

    remainingQty -= consumeQty;
  }
};

export const getStockById = async (
  id: number,
): Promise<ItemStockResponse | null> => {
  logger.info(`entering::getStockById::repository`);

  return db.invItemStock.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const getItemStockQtyByBatchWise = async ({
  itemId,
  batchNo,
  ccId,
  userId,
  expiryDate,
  isFoc,
}: ItemStockByBatchInput): Promise<number> => {
  logger.info(`entering::getItemStockByLocation::repository`);

  const sumResult = await db.invItemStock.aggregate({
    where: {
      itemId,
      ccId: ccId ?? null,
      userId: userId ?? null,
      batchNo: batchNo ?? null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isFoc,
      isActive: true,
    },
    _sum: {
      quantity: true,
    },
  });

  const totalQuantity = sumResult._sum.quantity ?? 0;

  return totalQuantity;
};

export const getItemStockByBatchWise = async ({
  itemId,
  batchNo,
  ccId,
  userId,
  expiryDate,
}: ItemStockByBatchInput) => {
  logger.info(`entering::getItemStockByBatchWise::repository`);

  const stock = await db.invItemStock.findFirst({
    where: {
      itemId,
      ccId,
      userId,
      batchNo,
      expiryDate: expiryDate
        ? expiryDate
        : {
            gte: new Date(),
          },
    },
  });

  return stock?.id ? stock : null;
};

export const getItemStockQtyByLocation = async (
  itemId: number,
  ccId: number,
) => {
  logger.info(`entering::getItemStockQtyByLocation::repository`);

  const sumResult = await db.invItemStock.aggregate({
    where: {
      itemId,
      ccId,
      isActive: true,
    },
    _sum: {
      quantity: true,
    },
  });

  return sumResult._sum.quantity ?? 0;
};

export const getItemStockQtyByUser = async (itemId: number, userId: number) => {
  logger.info(`entering::getItemStockQtyByUser::repository`);

  const sumResult = await db.invItemStock.aggregate({
    where: {
      itemId,
      userId,
      isActive: true,
    },
    _sum: {
      quantity: true,
    },
  });

  return sumResult._sum.quantity ?? 0;
};

export const getItemStockQtyByCc = async (itemId: number, ccId: number) => {
  logger.info(`entering::getItemStockByLocation::repository`);

  return await db.$transaction(
    async (tx) => {
      const stocks = await getItemStocksByLocation(tx, itemId, ccId);
      const totalQty = stocks.reduce((acc, curr) => (acc += curr.quantity), 0);

      return { totalQty, stocks };
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getItemStocksByLocation = async (
  tx: Tx,
  id: number,
  ccId?: number,
  userId?: number,
  canTakeZero = false,
): Promise<InvItemStock[]> => {
  logger.info(`entering::getItemStocksByLocation::repository (raw SQL)`);
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const expiry = setting?.expiryInMonth ?? 6;
  const stocks = await tx.$queryRaw<RawItemStock[]>`
  SELECT *
  FROM inv_item_stock
  WHERE (${id}      IS NULL OR item_id      = ${id})
    AND (${ccId} IS NULL OR cc_id = ${ccId})
    AND (${userId}    IS NULL OR user_id    = ${userId})
    AND is_active = 1
    AND (${canTakeZero} OR quantity > 0)
    -- exclude expired items:
    AND (
      expiry_date IS NULL      -- no expiry, keep it
      OR expiry_date >= CURDATE()  -- not yet expired
    )
  ORDER BY
    CASE
      -- 0: expiring within 6 months (any FOC status)
      WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL ${expiry} MONTH) THEN 0
      -- 1: out-of-six-months but FOC
      WHEN is_foc = TRUE THEN 1
      -- 2: everything else
      ELSE 2
    END,
    expiry_date ASC
`;

  return stocks.map((stock) => toStockEntity(stock));
};

export const getItemStocksByLocationUserId = async (
  tx: Tx,
  itemId?: number,
  userId?: number,
  canTakeZero = false,
  ccId?: number,
): Promise<InvItemStock[]> => {
  logger.info(`entering::getItemStocksByLocationUserId::repository (raw SQL)`);

  const store = requestStorage.getStore();
  const setting = store?.settings;
  const expiry = setting?.expiryInMonth ?? 6;

  const itemIdParam = itemId ?? null;
  const userIdParam = userId ?? null;
  const ccIdParam = ccId ?? null;
  const stocks = await tx.$queryRaw<RawItemStock[]>`
    SELECT
      inv_item_stock.*,

      SUM(CASE WHEN is_foc = 0 THEN quantity ELSE 0 END)
        OVER (PARTITION BY item_id, user_id) AS normal_qty,

      SUM(CASE WHEN is_foc = 1 THEN quantity ELSE 0 END)
        OVER (PARTITION BY item_id, user_id) AS foc_qty,

      SUM(quantity)
        OVER (PARTITION BY item_id, user_id) AS total_qty

    FROM inv_item_stock
    WHERE (${itemIdParam} IS NULL OR item_id = ${itemIdParam})
      AND (${userIdParam} IS NULL OR user_id = ${userIdParam})
      AND (${ccIdParam} IS NULL OR cc_id = ${ccIdParam})
      AND is_active = 1
      AND (${canTakeZero} OR quantity > 0)
      AND (
        expiry_date IS NULL
        OR expiry_date >= CURDATE()
      )
    ORDER BY
      CASE
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL ${expiry} MONTH) THEN 0
        WHEN is_foc = TRUE THEN 1
        ELSE 2
      END,
      expiry_date ASC,
      batch_no ASC
  `;

  return stocks.map((stock) => toStockEntity(stock));
};

export const itemStockSummary = async (ccId: number) => {
  const rows = await db.$queryRaw<ItemStockSummaryRow[]>`
    SELECT
      im.id AS itemId,
      im.item AS itemName,
      im.item_code AS itemCode,
      im.item_description AS itemDescription,
      im.base_price AS basePrice,
      im.is_batch_number AS isBatchNumber,
      im.is_expire_date AS isExpireDate,
      im.is_user_returnable AS isUserReturnable,
      im.is_vendor_returnable AS isVendorReturnable,
      im.is_lock AS itemIsLock,
      im.is_active AS itemIsActive,

      ic.id AS categoryId,
      ic.name AS categoryName,

      u.id AS unitId,
      u.packaging_type_name AS unitName,
      u.packaging_size AS unitSize,

      k.cc_id AS ccId,
      CASE WHEN b.id IS NOT NULL THEN 'BRANCH'
         WHEN w.id IS NOT NULL THEN 'WAREHOUSE'
         ELSE 'UNKNOWN' END AS locationType,
      COALESCE(b.name, w.name) AS locationName,

      k.batch_no AS batchNo,
      COALESCE(sa.expiry_date, grd.grn_expiry_date, cd.cons_expiry_date) AS expiryDate,

      sa.stock_id_list AS stockIdList,
      COALESCE(sa.in_hand_qty, 0) AS inHandQty,
      CASE WHEN b.id IS NOT NULL THEN COALESCE(sa.in_hand_qty, 0) ELSE 0 END AS branchInHandQty,
      CASE WHEN w.id IS NOT NULL THEN COALESCE(sa.in_hand_qty, 0) ELSE 0 END AS warehouseInHandQty,

      COALESCE(srd.req_qty, 0) AS reqQty,
      COALESCE(srd.assigned_qty, 0) AS assignedQty,
      COALESCE(srd.acknowledged_qty, 0) AS acknowledgedQty,
      (COALESCE(srd.req_qty, 0) - COALESCE(srd.assigned_qty, 0)) AS pendingQty,
      (COALESCE(srd.req_qty, 0) - COALESCE(srd.acknowledged_qty, 0)) AS ackPendingQty,

      COALESCE(grd.ordered_qty, 0) AS orderedQty,
      COALESCE(grd.received_qty, 0) AS receivedQty,
      COALESCE(grd.returned_qty, 0) AS returnedQty,

      COALESCE(cd.consumption_requested_qty, 0) AS consumptionRequestedQty,
      COALESCE(cd.consumed_qty, 0) AS consumedQty,

      (COALESCE(grd.received_qty, 0) - COALESCE(grd.returned_qty, 0) - COALESCE(cd.consumed_qty, 0)) AS movementBalance,
      (COALESCE(sa.in_hand_qty, 0)
       - (COALESCE(grd.received_qty, 0) - COALESCE(grd.returned_qty, 0) - COALESCE(cd.consumed_qty, 0))) AS varianceVsStock,

      COALESCE(ism.purchase_price, 0.00) AS purchasePrice

  FROM
    (
      SELECT s.item_id, s.cc_id, s.batch_no
      FROM inv_item_stock s
      WHERE s.is_active = 1 AND s.deleted_at IS NULL

      UNION
      SELECT g.item_id, gr.cc_id, g.batch_no
      FROM inv_good_receive_details g
      JOIN inv_good_receive gr
        ON gr.id = g.good_receive_id
       AND gr.is_active = 1 AND gr.deleted_at IS NULL
      WHERE g.is_active = 1 AND g.deleted_at IS NULL

      UNION
      SELECT c.item_id, cons.cc_id, c.batch_no
      FROM inv_consumption_details c
      JOIN inv_consumption cons
        ON cons.id = c.consumption_id
       AND cons.is_active = 1 AND cons.deleted_at IS NULL
      WHERE c.is_active = 1 AND c.deleted_at IS NULL
    ) k

  JOIN inv_item_master im
    ON im.id = k.item_id
   AND im.is_active = 1
   AND im.deleted_at IS NULL

  LEFT JOIN inv_item_category ic
    ON ic.id = im.item_category_id
   AND ic.is_active = 1
   AND ic.deleted_at IS NULL

  LEFT JOIN inv_unit_master u
    ON u.id = im.unit_id
   AND u.is_active = 1
   AND u.deleted_at IS NULL

  LEFT JOIN (
    SELECT
      s.item_id,
      s.cc_id,
      s.batch_no,
      MIN(s.expiry_date)               AS expiry_date,
      SUM(s.quantity)                  AS in_hand_qty,
      GROUP_CONCAT(s.id ORDER BY s.id) AS stock_id_list
    FROM inv_item_stock s
    WHERE s.is_active = 1
      AND s.deleted_at IS NULL
    GROUP BY s.item_id, s.cc_id, s.batch_no
  ) sa
    ON sa.item_id = k.item_id
   AND sa.cc_id   = k.cc_id
   AND sa.batch_no= k.batch_no

  LEFT JOIN (
    SELECT
      d.item_id,
      sr.cc_id,
      SUM(d.req_quantity)          AS req_qty,
      SUM(d.assigned_quantity)     AS assigned_qty,
      SUM(d.acknowledged_quantity) AS acknowledged_qty
    FROM inv_store_requisition_details d
    JOIN inv_store_requisition sr
      ON sr.id = d.store_requisition_id
     AND sr.is_active = 1
     AND sr.deleted_at IS NULL
    WHERE d.is_active = 1
      AND d.deleted_at IS NULL
    GROUP BY d.item_id, sr.cc_id
  ) srd
    ON srd.item_id = k.item_id
   AND srd.cc_id   = k.cc_id

  LEFT JOIN (
    SELECT
      g.item_id,
      g.batch_no,
      gr.cc_id,
      SUM(g.order_quantity)  AS ordered_qty,
      SUM(g.quantity)        AS received_qty,
      SUM(g.return_quantity) AS returned_qty,
      MIN(g.expiry_date)     AS grn_expiry_date
    FROM inv_good_receive_details g
    JOIN inv_good_receive gr
      ON gr.id = g.good_receive_id
     AND gr.is_active = 1
     AND gr.deleted_at IS NULL
    WHERE g.is_active = 1
      AND g.deleted_at IS NULL
    GROUP BY g.item_id, g.batch_no, gr.cc_id
  ) grd
    ON grd.item_id = k.item_id
   AND grd.batch_no= k.batch_no
   AND grd.cc_id   = k.cc_id

  LEFT JOIN (
    SELECT
      c.item_id,
      c.batch_no,
      cons.cc_id,
      SUM(c.requested_qty)        AS consumption_requested_qty,
      SUM(c.consumed_qty)         AS consumed_qty,
      MIN(DATE(c.expiry_date))    AS cons_expiry_date
    FROM inv_consumption_details c
    JOIN inv_consumption cons
      ON cons.id = c.consumption_id
     AND cons.is_active = 1
     AND cons.deleted_at IS NULL
    WHERE c.is_active = 1
      AND c.deleted_at IS NULL
    GROUP BY c.item_id, c.batch_no, cons.cc_id
  ) cd
    ON cd.item_id = k.item_id
   AND cd.batch_no= k.batch_no
   AND cd.cc_id   = k.cc_id

  LEFT JOIN (
    SELECT m.item_id, m.cc_id, m.purchase_price
    FROM inv_item_supplier_mapping m
    JOIN (
      SELECT item_id, cc_id, MAX(entry_on) AS max_entry_on
      FROM inv_item_supplier_mapping
      WHERE is_active = 1
        AND deleted_at IS NULL
        AND (valid_upto IS NULL OR valid_upto >= NOW(3))
      GROUP BY item_id, cc_id
    ) latest
      ON latest.item_id = m.item_id
     AND latest.cc_id   = m.cc_id
     AND latest.max_entry_on = m.entry_on
    WHERE m.is_active = 1
      AND m.deleted_at IS NULL
      AND (m.valid_upto IS NULL OR m.valid_upto >= NOW(3))
  ) ism
    ON ism.item_id = k.item_id
   AND ism.cc_id   = k.cc_id

  LEFT JOIN inv_branch b
    ON b.id = k.cc_id
   AND b.is_active = 1
   AND b.deleted_at IS NULL
  LEFT JOIN inv_warehouse w
    ON w.id = k.cc_id
   AND w.is_active = 1
   AND w.deleted_at IS NULL

  WHERE
    k.cc_id = ${ccId}

  ORDER BY
    im.item ASC,
    k.batch_no ASC,
    expiry_date IS NULL, expiry_date ASC
  `;
  return rows;
};

const ITEM_STOCK_ALLOWED_SORT_COLUMNS = {
  itemName: Prisma.sql`itemName`,
  itemCode: Prisma.sql`itemCode`,
  categoryName: Prisma.sql`categoryName`,
  unitName: Prisma.sql`unitName`,
  stockInHandQty: Prisma.sql`stockInHandQty`,
  poPendingQty: Prisma.sql`poPendingQty`,
  grnReceivedQty: Prisma.sql`grnReceivedQty`,
  branchReqQty: Prisma.sql`branchReqQty`,
  storeReqQty: Prisma.sql`storeReqQty`,
  consumedQty: Prisma.sql`consumedQty`,
  purchasePrice: Prisma.sql`purchasePrice`,
} as const;

export const itemStock = async (
  filters: ItemStockSearchFilter,
): Promise<ItemStockPaginatedRes> => {
  logger.info("entering::itemStock::repository");
  const store = requestStorage.getStore();
  const settings = await settingsService.getSettings();

  const pageNo = filters.pageNo ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const offset = (pageNo - 1) * pageSize;
  const searchText = filters.searchText?.trim() ?? "";
  const searchPattern = `%${searchText}%`;
  const { ccId, userId, itemId, categoryId } = filters;

  const sortKey =
    filters.sortBy && filters.sortBy in ITEM_STOCK_ALLOWED_SORT_COLUMNS
      ? (filters.sortBy as keyof typeof ITEM_STOCK_ALLOWED_SORT_COLUMNS)
      : "itemName";
  const orderByColumn = ITEM_STOCK_ALLOWED_SORT_COLUMNS[sortKey];
  const orderDirection =
    filters.sortDir === "DESC" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  const userIdStockFilter =
    userId != null ? Prisma.sql`AND s.user_id = ${userId}` : Prisma.empty;
  const userIdConsumptionFilter =
    userId != null ? Prisma.sql`AND c.requested_by = ${userId}` : Prisma.empty;
  const userIdStoreReqFilter =
    userId != null ? Prisma.sql`AND sr.req_from = ${userId}` : Prisma.empty;
  const userIdStoreReqReturnFilter =
    userId != null ? Prisma.sql`AND srr.req_from = ${userId}` : Prisma.empty;
  const searchFilter =
    searchText.length > 0
      ? Prisma.sql`AND (
          im.item LIKE ${searchPattern}
          OR im.item_code LIKE ${searchPattern}
          OR im.item_description LIKE ${searchPattern}
          OR ic.name LIKE ${searchPattern}
          OR u.packaging_type_name LIKE ${searchPattern}
          OR COALESCE(stock.batch_no_list, '') LIKE ${searchPattern}
          OR COALESCE(stock.expiry_date_list, '') LIKE ${searchPattern}
        )`
      : Prisma.empty;
  const itemIdFilter =
    itemId != null ? Prisma.sql`AND im.id = ${itemId}` : Prisma.empty;
  const categoryIdFilter =
    categoryId != null ? Prisma.sql`AND ic.id = ${categoryId}` : Prisma.empty;

  const warehouse = await db.invWarehouse.findFirst({
    where: {
      id: ccId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const branch = await db.invBranch.findFirst({
    where: {
      id: ccId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const warehouseMode = Boolean(settings?.warehouseMode);
  const { isWarehouseLocation, isBranchLocation, locationType } =
    resolveItemStockLocationFlags(warehouseMode, branch, warehouse);

  const rawRows = await db.$queryRaw<ItemStockReportRawRow[]>`
    SELECT
      /* ---------------- Item ---------------- */
      im.id AS itemId,
      im.item AS itemName,
      im.item_code AS itemCode,
      im.item_description AS itemDescription,
      im.base_price AS basePrice,
      im.last_purchased_price AS lastPurchasedPrice,
      im.re_order_level AS reOrderLevel,
      im.is_batch_number AS isBatchNumber,
      im.is_expire_date AS isExpireDate,
      im.is_user_returnable AS isReturnable,
      im.is_lock AS itemIsLock,
      im.is_active AS itemIsActive,

      /* ---------------- Category ---------------- */
      ic.id AS categoryId,
      ic.name AS categoryName,

      /* ---------------- Unit ---------------- */
      u.id AS unitId,
      u.packaging_type_name AS unitName,
      u.packaging_size AS unitSize,

      /* ---------------- Location ---------------- */
      k.location_cc_id AS ccId,
      ${userId} AS userId,
      ${locationType} AS locationType,
      CASE
        WHEN ${isBranchLocation} = true THEN b.name
        WHEN ${isWarehouseLocation} = true THEN w.name
        ELSE NULL
      END AS locationName,

      /* ---------------- Batch ---------------- */
      COALESCE(stock.batch_no_list, '') AS batchNoList,
      COALESCE(stock.expiry_date_list, '') AS expiryDateList,
      stock.nearest_expiry_date AS nearestExpiryDate,
      stock.batch_details_json AS batchDetailsJson,

      /* ---------------- Current Stock ---------------- */
      COALESCE(stock.stock_id_list, '') AS stockIdList,
      COALESCE(stock.stock_row_count, 0) AS stockRowCount,
      COALESCE(stock.stock_in_hand_qty, 0) AS stockInHandQty,
      COALESCE(stock.stock_normal_qty, 0) AS stockNormalQty,
      COALESCE(stock.stock_foc_qty, 0) AS stockFocQty,

      /* ---------------- Purchase Order ---------------- */
      COALESCE(po.po_ordered_qty, 0) AS poOrderedQty,
      COALESCE(po.po_received_qty, 0) AS poReceivedQty,
      COALESCE(po.po_pending_qty, 0) AS poPendingQty,

      /* ---------------- GRN ---------------- */
      COALESCE(grn.grn_ordered_qty, 0) AS grnOrderedQty,
      COALESCE(grn.grn_received_qty, 0) AS grnReceivedQty,
      COALESCE(grn.grn_detail_return_qty, 0) AS grnDetailReturnQty,

      /* ---------------- GRN Return ---------------- */
      COALESCE(grn_return.grn_return_requested_qty, 0) AS grnReturnRequestedQty,
      COALESCE(grn_return.grn_return_pending_qty, 0) AS grnReturnPendingQty,
      COALESCE(grn_return.grn_return_approved_qty, 0) AS grnReturnApprovedQty,
      COALESCE(grn_return.grn_return_rejected_qty, 0) AS grnReturnRejectedQty,

      /* ---------------- Store Requisition ---------------- */
      COALESCE(store_req.store_req_qty, 0) AS storeReqQty,
      COALESCE(store_req.store_req_pending_qty, 0) AS storeReqPendingQty,
      COALESCE(store_req.store_req_approved_qty, 0) AS storeReqApprovedQty,
      COALESCE(store_req.store_req_rejected_qty, 0) AS storeReqRejectedQty,
      COALESCE(store_req.store_assigned_qty, 0) AS storeAssignedQty,
      COALESCE(store_req.store_acknowledged_qty, 0) AS storeAcknowledgedQty,
      COALESCE(store_req.store_returned_qty, 0) AS storeReturnedQty,
      (
        COALESCE(store_req.store_req_qty, 0)
        - COALESCE(store_req.store_assigned_qty, 0)
      ) AS storePendingAssignQty,
      (
        COALESCE(store_req.store_assigned_qty, 0)
        - COALESCE(store_req.store_acknowledged_qty, 0)
      ) AS storePendingAckQty,

      /* ---------------- Store Requisition Return ---------------- */
      COALESCE(store_req_return.store_return_requested_qty, 0) AS storeReturnRequestedQty,
      COALESCE(store_req_return.store_return_pending_qty, 0) AS storeReturnPendingQty,
      COALESCE(store_req_return.store_return_approved_qty, 0) AS storeReturnApprovedQty,
      COALESCE(store_req_return.store_return_rejected_qty, 0) AS storeReturnRejectedQty,
      COALESCE(store_req_return.store_return_acknowledged_qty, 0) AS storeReturnAcknowledgedQty,
      COALESCE(store_req_return.store_return_ack_pending_qty, 0) AS storeReturnAckPendingQty,

      /* ---------------- Branch Requisition ---------------- */
      COALESCE(branch_req.branch_req_qty, 0) AS branchReqQty,
      COALESCE(branch_req.branch_req_pending_qty, 0) AS branchReqPendingQty,
      COALESCE(branch_req.branch_req_approved_qty, 0) AS branchReqApprovedQty,
      COALESCE(branch_req.branch_req_rejected_qty, 0) AS branchReqRejectedQty,
      COALESCE(branch_req.branch_assigned_qty, 0) AS branchAssignedQty,
      COALESCE(branch_req.branch_acknowledged_qty, 0) AS branchAcknowledgedQty,
      COALESCE(branch_req.branch_returned_qty, 0) AS branchReturnedQty,
      (
        COALESCE(branch_req.branch_req_qty, 0)
        - COALESCE(branch_req.branch_assigned_qty, 0)
      ) AS branchPendingAssignQty,
      (
        COALESCE(branch_req.branch_assigned_qty, 0)
        - COALESCE(branch_req.branch_acknowledged_qty, 0)
      ) AS branchPendingAckQty,

      /* ---------------- Branch Requisition Return ---------------- */
      COALESCE(branch_req_return.branch_return_requested_qty, 0) AS branchReturnRequestedQty,
      COALESCE(branch_req_return.branch_return_pending_qty, 0) AS branchReturnPendingQty,
      COALESCE(branch_req_return.branch_return_approved_qty, 0) AS branchReturnApprovedQty,
      COALESCE(branch_req_return.branch_return_rejected_qty, 0) AS branchReturnRejectedQty,
      COALESCE(branch_req_return.branch_return_acknowledged_qty, 0) AS branchReturnAcknowledgedQty,
      COALESCE(branch_req_return.branch_return_ack_pending_qty, 0) AS branchReturnAckPendingQty,

      /* ---------------- Consumption ---------------- */
      COALESCE(consumption.consumption_requested_qty, 0) AS consumptionRequestedQty,
      COALESCE(consumption.consumption_pending_qty, 0) AS consumptionPendingQty,
      COALESCE(consumption.consumption_approved_qty, 0) AS consumptionApprovedQty,
      COALESCE(consumption.consumption_rejected_qty, 0) AS consumptionRejectedQty,
      COALESCE(consumption.consumed_qty, 0) AS consumedQty,

      /* ---------------- Supplier Price ---------------- */
      COALESCE(item_supplier.purchase_price, 0.00) AS purchasePrice,

      COUNT(*) OVER() AS totalRecords

    FROM
      (
        SELECT DISTINCT
          item_keys.item_id,
          item_keys.location_cc_id
        FROM (
        SELECT DISTINCT
          s.item_id,
          s.cc_id AS location_cc_id
        FROM inv_item_stock s
        WHERE s.is_active = 1
          AND s.deleted_at IS NULL
          AND s.cc_id IS NOT NULL
          AND s.cc_id = ${ccId}
          ${userIdStockFilter}

        UNION

        SELECT DISTINCT
          grd.item_id,
          grn.cc_id AS location_cc_id
        FROM inv_good_receive_details grd
        JOIN inv_good_receive grn
          ON grn.id = grd.good_receive_id
         AND grn.is_active = 1
         AND grn.deleted_at IS NULL
        WHERE grd.is_active = 1
          AND grd.deleted_at IS NULL
          AND grn.cc_id = ${ccId}

        UNION

        SELECT DISTINCT
          grrd.item_id,
          grr.cc_id AS location_cc_id
        FROM inv_good_receive_return_details grrd
        JOIN inv_good_receive_return grr
          ON grr.id = grrd.good_receive_return_id
         AND grr.is_active = 1
         AND grr.deleted_at IS NULL
        WHERE grrd.is_active = 1
          AND grrd.deleted_at IS NULL
          AND grr.cc_id = ${ccId}

        UNION

        SELECT DISTINCT
          cd.item_id,
          c.cc_id AS location_cc_id
        FROM inv_consumption_details cd
        JOIN inv_consumption c
          ON c.id = cd.consumption_id
         AND c.is_active = 1
         AND c.deleted_at IS NULL
        WHERE cd.is_active = 1
          AND cd.deleted_at IS NULL
          AND c.cc_id = ${ccId}
          ${userIdConsumptionFilter}

        UNION

        SELECT DISTINCT
          srd.item_id,
          sr.cc_id AS location_cc_id
        FROM inv_store_requisition_details srd
        JOIN inv_store_requisition sr
          ON sr.id = srd.store_requisition_id
         AND sr.is_active = 1
         AND sr.deleted_at IS NULL
        WHERE srd.is_active = 1
          AND srd.deleted_at IS NULL
          AND sr.cc_id = ${ccId}
          ${userIdStoreReqFilter}

        UNION

        SELECT DISTINCT
          srrd.item_id,
          srr.cc_id AS location_cc_id
        FROM inv_store_requisition_return_details srrd
        JOIN inv_store_requisition_return srr
          ON srr.id = srrd.store_requisition_return_id
         AND srr.is_active = 1
         AND srr.deleted_at IS NULL
        WHERE srrd.is_active = 1
          AND srrd.deleted_at IS NULL
          AND srr.cc_id = ${ccId}
          ${userIdStoreReqReturnFilter}

        UNION

        SELECT DISTINCT
          rid.item_id,
          CASE
            WHEN ${isWarehouseLocation} = true THEN rid.cc_id
            ELSE rid.ack_cc_id
          END AS location_cc_id
        FROM inv_requisition_item_details rid
        WHERE rid.is_active = 1
          AND rid.deleted_at IS NULL
          AND (
            (${isWarehouseLocation} = true AND rid.cc_id = ${ccId})
            OR
            (${isWarehouseLocation} = false AND rid.ack_cc_id = ${ccId})
          )

        UNION

        SELECT DISTINCT
          rrid.item_id,
          CASE
            WHEN ${isWarehouseLocation} = true THEN rid.cc_id
            ELSE rrid.cc_id
          END AS location_cc_id
        FROM inv_requisition_return_item_details rrid
        JOIN inv_requisition_item_details rid
          ON rid.id = rrid.requisition_item_details_id
         AND rid.is_active = 1
         AND rid.deleted_at IS NULL
        WHERE rrid.is_active = 1
          AND rrid.deleted_at IS NULL
          AND (
            (${isWarehouseLocation} = true AND rid.cc_id = ${ccId})
            OR
            (${isWarehouseLocation} = false AND rrid.cc_id = ${ccId})
          )

        UNION

        SELECT DISTINCT
          brd.item_id,
          CASE
            WHEN ${isWarehouseLocation} = true THEN br.cc_id
            ELSE br.branch_id
          END AS location_cc_id
        FROM inv_branch_requisition_details brd
        JOIN inv_branch_requisition br
          ON br.id = brd.branch_requisition_id
         AND br.is_active = 1
         AND br.deleted_at IS NULL
        WHERE brd.is_active = 1
          AND brd.deleted_at IS NULL
          AND (
            (${isWarehouseLocation} = true AND br.cc_id = ${ccId})
            OR
            (${isWarehouseLocation} = false AND br.branch_id = ${ccId})
          )

        UNION

        SELECT DISTINCT
          bid.item_id,
          CASE
            WHEN ${isWarehouseLocation} = true THEN bid.cc_id
            ELSE bid.ack_cc_id
          END AS location_cc_id
        FROM inv_branch_item_details bid
        WHERE bid.is_active = 1
          AND bid.deleted_at IS NULL
          AND (
            (${isWarehouseLocation} = true AND bid.cc_id = ${ccId})
            OR
            (${isWarehouseLocation} = false AND bid.ack_cc_id = ${ccId})
          )

        UNION

        SELECT DISTINCT
          brrd.item_id,
          CASE
            WHEN ${isWarehouseLocation} = true THEN brr.cc_id
            ELSE brr.branch_id
          END AS location_cc_id
        FROM inv_branch_requisition_return_details brrd
        JOIN inv_branch_requisition_return brr
          ON brr.id = brrd.branch_requisition_return_id
         AND brr.is_active = 1
         AND brr.deleted_at IS NULL
        WHERE brrd.is_active = 1
          AND brrd.deleted_at IS NULL
          AND (
            (${isWarehouseLocation} = true AND brr.cc_id = ${ccId})
            OR
            (${isWarehouseLocation} = false AND brr.branch_id = ${ccId})
          )

        UNION

        SELECT DISTINCT
          brid.item_id,
          CASE
            WHEN ${isWarehouseLocation} = true THEN brid.cc_id
            ELSE brid.branch_id
          END AS location_cc_id
        FROM inv_branch_return_item_details brid
        WHERE brid.is_active = 1
          AND brid.deleted_at IS NULL
          AND (
            (${isWarehouseLocation} = true AND brid.cc_id = ${ccId})
            OR
            (${isWarehouseLocation} = false AND brid.branch_id = ${ccId})
          )
        ) item_keys
      ) k

    JOIN inv_item_master im
      ON im.id = k.item_id
     AND im.is_active = 1
     AND im.deleted_at IS NULL

    LEFT JOIN inv_item_category ic
      ON ic.id = im.item_category_id
     AND ic.is_active = 1
     AND ic.deleted_at IS NULL

    LEFT JOIN inv_unit_master u
      ON u.id = im.unit_id
     AND u.is_active = 1
     AND u.deleted_at IS NULL

    LEFT JOIN inv_branch b
      ON b.id = k.location_cc_id
     AND b.is_active = 1
     AND b.deleted_at IS NULL

    LEFT JOIN inv_warehouse w
      ON w.id = k.location_cc_id
     AND w.is_active = 1
     AND w.deleted_at IS NULL

    /* ---------------- Current Stock ---------------- */
    LEFT JOIN (
      SELECT
        s.item_id,
        s.cc_id,
        MIN(s.expiry_date) AS nearest_expiry_date,
        GROUP_CONCAT(DISTINCT s.batch_no ORDER BY s.batch_no SEPARATOR ', ') AS batch_no_list,
        GROUP_CONCAT(DISTINCT DATE_FORMAT(s.expiry_date, '%Y-%m-%d') ORDER BY s.expiry_date SEPARATOR ', ') AS expiry_date_list,
        SUM(COALESCE(s.quantity, 0)) AS stock_in_hand_qty,
        SUM(CASE WHEN s.is_foc = 0 THEN COALESCE(s.quantity, 0) ELSE 0 END) AS stock_normal_qty,
        SUM(CASE WHEN s.is_foc = 1 THEN COALESCE(s.quantity, 0) ELSE 0 END) AS stock_foc_qty,
        CAST(COUNT(s.id) AS SIGNED) AS stock_row_count,
        GROUP_CONCAT(s.id ORDER BY s.id) AS stock_id_list,
        CONCAT(
          '[',
          IFNULL(
            GROUP_CONCAT(
              JSON_OBJECT(
                'stockId', s.id,
                'batchNo', s.batch_no,
                'expiryDate', DATE_FORMAT(s.expiry_date, '%Y-%m-%d'),
                'isFoc', IF(s.is_foc, 1, 0),
                'quantity', COALESCE(s.quantity, 0)
              )
              ORDER BY s.id
              SEPARATOR ','
            ),
            ''
          ),
          ']'
        ) AS batch_details_json
      FROM inv_item_stock s
      WHERE s.is_active = 1
        AND s.deleted_at IS NULL
        AND s.cc_id IS NOT NULL
        AND s.cc_id = ${ccId}
        ${userIdStockFilter}
      GROUP BY s.item_id, s.cc_id
    ) stock
      ON stock.item_id = k.item_id
     AND stock.cc_id = k.location_cc_id

    /* ---------------- Purchase Order ---------------- */
    LEFT JOIN (
      SELECT
        pod.item_id,
        po.cc_id,
        SUM(pod.quantity) AS po_ordered_qty,
        SUM(pod.received_qty) AS po_received_qty,
        SUM(GREATEST(pod.quantity - pod.received_qty, 0)) AS po_pending_qty
      FROM inv_purchase_order_details pod
      JOIN inv_purchase_order po
        ON po.id = pod.purchase_id
       AND po.is_active = 1
       AND po.deleted_at IS NULL
      WHERE pod.is_active = 1
        AND pod.deleted_at IS NULL
        AND po.cc_id = ${ccId}
      GROUP BY pod.item_id, po.cc_id
    ) po
      ON po.item_id = k.item_id
     AND po.cc_id = k.location_cc_id

    /* ---------------- GRN ---------------- */
    LEFT JOIN (
      SELECT
        grd.item_id,
        grn.cc_id,
        SUM(grd.order_quantity) AS grn_ordered_qty,
        SUM(grd.quantity) AS grn_received_qty,
        SUM(grd.return_quantity) AS grn_detail_return_qty
      FROM inv_good_receive_details grd
      JOIN inv_good_receive grn
        ON grn.id = grd.good_receive_id
       AND grn.is_active = 1
       AND grn.deleted_at IS NULL
      WHERE grd.is_active = 1
        AND grd.deleted_at IS NULL
        AND grn.cc_id = ${ccId}
      GROUP BY grd.item_id, grn.cc_id
    ) grn
      ON grn.item_id = k.item_id
     AND grn.cc_id = k.location_cc_id

    /* ---------------- GRN Return ---------------- */
    LEFT JOIN (
      SELECT
        grrd.item_id,
        grr.cc_id,
        MIN(grrd.expiry_date) AS grn_return_expiry_date,
        SUM(COALESCE(grrd.quantity, 0)) AS grn_return_requested_qty,
        SUM(
          CASE
            WHEN grr.status = 'PENDING'
            THEN COALESCE(grrd.quantity, 0)
            ELSE 0
          END
        ) AS grn_return_pending_qty,
        SUM(
          CASE
            WHEN grr.status IN ('APPROVED', 'PARTIALLY_APPROVED')
            THEN COALESCE(grrd.quantity, 0)
            ELSE 0
          END
        ) AS grn_return_approved_qty,
        SUM(
          CASE
            WHEN grr.status = 'REJECTED'
            THEN COALESCE(grrd.quantity, 0)
            ELSE 0
          END
        ) AS grn_return_rejected_qty
      FROM inv_good_receive_return_details grrd
      JOIN inv_good_receive_return grr
        ON grr.id = grrd.good_receive_return_id
       AND grr.is_active = 1
       AND grr.deleted_at IS NULL
      WHERE grrd.is_active = 1
        AND grrd.deleted_at IS NULL
        AND grr.cc_id = ${ccId}
      GROUP BY grrd.item_id, grr.cc_id
    ) grn_return
      ON grn_return.item_id = k.item_id
     AND grn_return.cc_id = k.location_cc_id

    /* ---------------- Store Requisition ---------------- */
    LEFT JOIN (
      SELECT
        srd.item_id,
        sr.cc_id AS location_cc_id,
        SUM(COALESCE(srd.req_quantity, 0)) AS store_req_qty,
        SUM(
          CASE
            WHEN sr.store_req_status = 'Pending'
            THEN COALESCE(srd.req_quantity, 0)
            ELSE 0
          END
        ) AS store_req_pending_qty,
        SUM(
          CASE
            WHEN sr.store_req_status IN ('Approved', 'APPROVED', 'Partially_Approved', 'Completed', 'COMPLETED')
            THEN COALESCE(srd.req_quantity, 0)
            ELSE 0
          END
        ) AS store_req_approved_qty,
        SUM(
          CASE
            WHEN sr.store_req_status IN ('Reject', 'Rejected', 'REJECTED')
            THEN COALESCE(srd.req_quantity, 0)
            ELSE 0
          END
        ) AS store_req_rejected_qty,
        SUM(COALESCE(srd.assigned_quantity, 0)) AS store_assigned_qty,
        SUM(COALESCE(srd.acknowledged_quantity, 0)) AS store_acknowledged_qty,
        SUM(COALESCE(srd.returned_quantity, 0)) AS store_returned_qty
      FROM inv_store_requisition_details srd
      JOIN inv_store_requisition sr
        ON sr.id = srd.store_requisition_id
       AND sr.is_active = 1
       AND sr.deleted_at IS NULL
      WHERE srd.is_active = 1
        AND srd.deleted_at IS NULL
        AND sr.cc_id = ${ccId}
        ${userIdStoreReqFilter}
      GROUP BY
        srd.item_id,
        sr.cc_id
    ) store_req
      ON store_req.item_id = k.item_id
     AND store_req.location_cc_id = k.location_cc_id

    /* ---------------- Store Requisition Return ---------------- */
    LEFT JOIN (
      SELECT
        srrd.item_id,
        srr.cc_id AS location_cc_id,
        SUM(COALESCE(srrd.requested_return_qty, 0)) AS store_return_requested_qty,
        SUM(
          CASE
            WHEN srr.return_status = 'Pending'
            THEN COALESCE(srrd.requested_return_qty, 0)
            ELSE 0
          END
        ) AS store_return_pending_qty,
        SUM(
          CASE
            WHEN srr.return_status IN ('Approved', 'APPROVED', 'Partially_Approved', 'Completed', 'COMPLETED')
            THEN COALESCE(srrd.requested_return_qty, 0)
            ELSE 0
          END
        ) AS store_return_approved_qty,
        SUM(
          CASE
            WHEN srr.return_status IN ('Reject', 'Rejected', 'REJECTED')
            THEN COALESCE(srrd.requested_return_qty, 0)
            ELSE 0
          END
        ) AS store_return_rejected_qty,
        SUM(COALESCE(srrd.acknowledged_return_qty, 0)) AS store_return_acknowledged_qty,
        SUM(
          CASE
            WHEN srr.ack_status = 'ACK_PENDING'
            THEN COALESCE(srrd.requested_return_qty, 0) - COALESCE(srrd.acknowledged_return_qty, 0)
            ELSE 0
          END
        ) AS store_return_ack_pending_qty
      FROM inv_store_requisition_return_details srrd
      JOIN inv_store_requisition_return srr
        ON srr.id = srrd.store_requisition_return_id
       AND srr.is_active = 1
       AND srr.deleted_at IS NULL
      WHERE srrd.is_active = 1
        AND srrd.deleted_at IS NULL
        AND srr.cc_id = ${ccId}
        ${userIdStoreReqReturnFilter}
      GROUP BY
        srrd.item_id,
        srr.cc_id
    ) store_req_return
      ON store_req_return.item_id = k.item_id
     AND store_req_return.location_cc_id = k.location_cc_id

    /* ---------------- Branch Requisition ---------------- */
    LEFT JOIN (
      SELECT
        brd.item_id,
        CASE
          WHEN ${isWarehouseLocation} = true THEN br.cc_id
          ELSE br.branch_id
        END AS location_cc_id,
        SUM(COALESCE(brd.req_quantity, 0)) AS branch_req_qty,
        SUM(
          CASE
            WHEN br.branch_req_status = 'Pending'
            THEN COALESCE(brd.req_quantity, 0)
            ELSE 0
          END
        ) AS branch_req_pending_qty,
        SUM(
          CASE
            WHEN br.branch_req_status IN ('Approved', 'APPROVED', 'Completed', 'COMPLETED')
            THEN COALESCE(brd.req_quantity, 0)
            ELSE 0
          END
        ) AS branch_req_approved_qty,
        SUM(
          CASE
            WHEN br.branch_req_status IN ('Rejected', 'REJECTED')
            THEN COALESCE(brd.req_quantity, 0)
            ELSE 0
          END
        ) AS branch_req_rejected_qty,
        SUM(COALESCE(brd.assigned_quantity, 0)) AS branch_assigned_qty,
        SUM(COALESCE(brd.acknowledged_quantity, 0)) AS branch_acknowledged_qty,
        SUM(COALESCE(brd.returned_quantity, 0)) AS branch_returned_qty
      FROM inv_branch_requisition_details brd
      JOIN inv_branch_requisition br
        ON br.id = brd.branch_requisition_id
       AND br.is_active = 1
       AND br.deleted_at IS NULL
      WHERE brd.is_active = 1
        AND brd.deleted_at IS NULL
        AND (
          (${isWarehouseLocation} = true AND br.cc_id = ${ccId})
          OR
          (${isWarehouseLocation} = false AND br.branch_id = ${ccId})
        )
      GROUP BY
        brd.item_id,
        CASE
          WHEN ${isWarehouseLocation} = true THEN br.cc_id
          ELSE br.branch_id
        END
    ) branch_req
      ON branch_req.item_id = k.item_id
     AND branch_req.location_cc_id = k.location_cc_id

    /* ---------------- Branch Requisition Return ---------------- */
    LEFT JOIN (
      SELECT
        brrd.item_id,
        CASE
          WHEN ${isWarehouseLocation} = true THEN brr.cc_id
          ELSE brr.branch_id
        END AS location_cc_id,
        SUM(COALESCE(brrd.requested_return_qty, 0)) AS branch_return_requested_qty,
        SUM(
          CASE
            WHEN brr.return_status = 'Pending'
            THEN COALESCE(brrd.requested_return_qty, 0)
            ELSE 0
          END
        ) AS branch_return_pending_qty,
        SUM(
          CASE
            WHEN brr.return_status IN ('Approved', 'APPROVED', 'Partially_Approved', 'Completed', 'COMPLETED')
            THEN COALESCE(brrd.requested_return_qty, 0)
            ELSE 0
          END
        ) AS branch_return_approved_qty,
        SUM(
          CASE
            WHEN brr.return_status IN ('Reject', 'Rejected', 'REJECTED')
            THEN COALESCE(brrd.requested_return_qty, 0)
            ELSE 0
          END
        ) AS branch_return_rejected_qty,
        SUM(COALESCE(brrd.acknowledged_return_qty, 0)) AS branch_return_acknowledged_qty,
        SUM(
          CASE
            WHEN brr.ack_status = 'ACK_PENDING'
            THEN COALESCE(brrd.requested_return_qty, 0) - COALESCE(brrd.acknowledged_return_qty, 0)
            ELSE 0
          END
        ) AS branch_return_ack_pending_qty
      FROM inv_branch_requisition_return_details brrd
      JOIN inv_branch_requisition_return brr
        ON brr.id = brrd.branch_requisition_return_id
       AND brr.is_active = 1
       AND brr.deleted_at IS NULL
      WHERE brrd.is_active = 1
        AND brrd.deleted_at IS NULL
        AND (
          (${isWarehouseLocation} = true AND brr.cc_id = ${ccId})
          OR
          (${isWarehouseLocation} = false AND brr.branch_id = ${ccId})
        )
      GROUP BY
        brrd.item_id,
        CASE
          WHEN ${isWarehouseLocation} = true THEN brr.cc_id
          ELSE brr.branch_id
        END
    ) branch_req_return
      ON branch_req_return.item_id = k.item_id
     AND branch_req_return.location_cc_id = k.location_cc_id

    /* ---------------- Consumption ---------------- */
    LEFT JOIN (
      SELECT
        cd.item_id,
        c.cc_id,
        MIN(DATE(cd.expiry_date)) AS consumption_expiry_date,
        SUM(COALESCE(cd.requested_qty, 0)) AS consumption_requested_qty,
        SUM(
          CASE
            WHEN c.status IN ('SENT_FOR_APPROVAL', 'Pending', 'PENDING')
            THEN COALESCE(cd.requested_qty, 0)
            ELSE 0
          END
        ) AS consumption_pending_qty,
        SUM(
          CASE
            WHEN c.status IN ('APPROVED', 'Approved', 'COMPLETED', 'Completed')
            THEN COALESCE(cd.requested_qty, 0)
            ELSE 0
          END
        ) AS consumption_approved_qty,
        SUM(
          CASE
            WHEN c.status IN ('REJECTED', 'Rejected')
            THEN COALESCE(cd.requested_qty, 0)
            ELSE 0
          END
        ) AS consumption_rejected_qty,
        SUM(
          CASE
            WHEN c.status IN ('APPROVED', 'Approved', 'COMPLETED', 'Completed')
            THEN COALESCE(cd.consumed_qty, 0)
            ELSE 0
          END
        ) AS consumed_qty
      FROM inv_consumption_details cd
      JOIN inv_consumption c
        ON c.id = cd.consumption_id
       AND c.is_active = 1
       AND c.deleted_at IS NULL
      WHERE cd.is_active = 1
        AND cd.deleted_at IS NULL
        AND c.cc_id = ${ccId}
        ${userIdConsumptionFilter}
      GROUP BY
        cd.item_id,
        c.cc_id
    ) consumption
      ON consumption.item_id = k.item_id
     AND consumption.cc_id = k.location_cc_id

    /* ---------------- Supplier Mapping ---------------- */
    LEFT JOIN (
      SELECT
        m.item_id,
        m.cc_id,
        m.purchase_price
      FROM inv_item_supplier_mapping m
      JOIN (
        SELECT
          item_id,
          cc_id,
          MAX(entry_on) AS max_entry_on
        FROM inv_item_supplier_mapping
        WHERE is_active = 1
          AND deleted_at IS NULL
          AND (valid_upto IS NULL OR valid_upto >= NOW(3))
        GROUP BY item_id, cc_id
      ) latest
        ON latest.item_id = m.item_id
       AND latest.cc_id = m.cc_id
       AND latest.max_entry_on = m.entry_on
      WHERE m.is_active = 1
        AND m.deleted_at IS NULL
        AND (m.valid_upto IS NULL OR m.valid_upto >= NOW(3))
        AND m.cc_id = ${ccId}
    ) item_supplier
      ON item_supplier.item_id = k.item_id
     AND item_supplier.cc_id = k.location_cc_id

    WHERE k.location_cc_id = ${ccId}
      ${searchFilter}
      ${itemIdFilter}
      ${categoryIdFilter}

    ORDER BY ${orderByColumn} ${orderDirection}
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;

  const totalRecords = rawRows.length > 0 ? Number(rawRows[0].totalRecords) : 0;
  const rows = rawRows.map((row) => customOmit(row, ["totalRecords"]).rest);

  logger.info("exiting::itemStock::repository");

  return {
    rows: serializeBigInt(rows) as ItemStockReportRawRow[],
    totalRecords,
    currentPageNumber: pageNo,
    lastPageNumber: Math.max(1, Math.ceil(totalRecords / pageSize)),
    pageSize,
  };
};

export const getItemStockByItemOnly = async (
  itemId: number,
  ccId: number,
  batchNo?: string | null,
  expiryDate?: Date | null,
  isFoc?: boolean,
  id?: number,
) => {
  logger.info(`entering::getItemStockByItemOnly::repository`);

  const stock = await db.invItemStock.findFirst({
    where: {
      itemId,
      ccId,
      ...(id !== undefined ? { id } : {}),
      isActive: true,
      ...(batchNo !== undefined ? { batchNo } : {}),
      ...(isFoc !== undefined ? { isFoc } : {}),
      ...(expiryDate !== undefined
        ? { expiryDate }
        : {
            OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }],
          }),
    },
  });

  return stock?.id ? stock : null;
};

export const getStocksByIds = async (
  ids: number[],
): Promise<InvItemStock[]> => {
  logger.info(`entering::getStocksByIds::repository`);
  return await db.invItemStock.findMany({
    where: {
      id: {
        in: ids,
      },
      isActive: true,
    },
  });
};

export const getStockInfo = async (input: {
  itemId: number;
  batchNo?: string;
  expiryDate?: Date;
  isFoc?: boolean;
  ccId?: number;
  notInIds?: number[];
}) => {
  logger.info(`entering::getStockInfo::repository`);
  return await db.invItemStock.findFirst({
    where: {
      itemId: input.itemId,
      batchNo: input.batchNo,
      expiryDate: input.expiryDate,
      isFoc: input.isFoc,
      ccId: input.ccId,
      id: input.notInIds
        ? {
            notIn: input.notInIds,
          }
        : undefined,
      isActive: true,
    },
  });
};

export const getItemBatchStockByBatchFromDb = async (
  input: ItemBatchStockLookupInput,
) => {
  logger.info("entering::getItemBatchStockByBatchFromDb::repository");
  return await db.invItemStock.findMany({
    where: {
      isActive: true,
      batchNo: {
        not: null,
        contains: input.batchNo,
      },
      itemId: {
        not: input.itemId,
      },
    },
  });
};

export const getInTransitStockQtyByBatchWise = async ({
  itemId,
  batchNo,
  fromCcId,
  toCcId,
  userId,
  expiryDate,
  isFoc,
}: InTransitStockByBatchInput): Promise<number> => {
  logger.info(`entering::getInTransitStockQtyByBatchWise::repository`);

  const sumResult = await db.invInTransitStock.aggregate({
    where: {
      itemId,
      fromCcId: fromCcId ?? null,
      toCcId: toCcId ?? null,
      userId: userId ?? null,
      batchNo: batchNo ?? null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isFoc,
      isActive: true,
    },
    _sum: {
      quantity: true,
    },
  });

  const totalQuantity = sumResult._sum.quantity ?? 0;

  logger.info(`exiting::getInTransitStockQtyByBatchWise::repository`);

  return totalQuantity;
};

export const getItemStockByItemId = async (itemId: number) => {
  logger.info(`entering::getItemStockByItemId::repository`);
  return await db.invItemStock.findFirst({
    where: {
      itemId,
      isActive: true,
    },
  });
};

export const fetchReOrderItems = async (
  date: Date,
): Promise<LowStockResponse[]> => {
  logger.info(`entering::fetchReOrderItems::repository`);
  const lowStockItems = await db.$queryRaw<LowStockResponse[]>`
    SELECT 
        i.id AS itemId,
        i.item AS itemName,
        COALESCE(b.name, w.name) AS collectionCenterName,
        COALESCE(b.id, w.id) AS ccId,
        SUM(s.quantity) AS availableQty,
        i.re_order_level AS minStockQty
    FROM inv_item_stock s
    LEFT JOIN inv_item_master i ON i.id = s.item_id
    LEFT JOIN inv_branch b ON b.id = s.cc_id
    LEFT JOIN inv_warehouse w ON w.id = s.cc_id
    WHERE s.is_active = TRUE
    AND (
      expiry_date IS NULL     
      OR expiry_date >= ${date}
    )
    GROUP BY 
        i.id,
        COALESCE(b.id, w.id)
    HAVING 
        SUM(s.quantity) < i.re_order_level
`;

  logger.info(`exiting::fetchReOrderItems::repository`);
  return lowStockItems;
};

export const fetchExpiredItems = async (
  date: Date,
): Promise<ExpiredItemsResponse[]> => {
  logger.info(`entering::fetchExpiredItems::repository`);

  const expiredItems = await db.$queryRaw<ExpiredItemsResponse[]>`
    SELECT 
        s.item_id AS itemId,
        i.item AS itemName,
        COALESCE(b.name, w.name) AS collectionCenterName,
        COALESCE(b.id, w.id) AS ccId,
        s.quantity AS quantity,
        s.batch_no AS batchNo,
        s.expiry_date AS expiryDate,
        CASE WHEN s.is_foc = 1 THEN 'YES' ELSE 'NO' END AS isFoc
    FROM inv_item_stock s
    LEFT JOIN inv_item_master i ON i.id = s.item_id
    LEFT JOIN inv_branch b ON b.id = s.cc_id
    LEFT JOIN inv_warehouse w ON w.id = s.cc_id
    WHERE s.is_active = TRUE
    AND (
      expiry_date IS NOT NULL     
      AND expiry_date < ${date}  
    ) 
`;
  logger.info(`exiting::fetchExpiredItems::repository`);
  return expiredItems;
};

export const fetchExpiringItems = async (
  date: Date,
): Promise<ExpiringItemsResponse> => {
  logger.info(`entering::fetchExpiringItems::repository`);

  const store = requestStorage.getStore();
  const settings = store?.settings;
  let expiry: number = 0;
  if (settings) {
    expiry = settings.expiryInMonth ?? 1;
  } else {
    const settings = await getSettingsInDb();
    if (settings) expiry = settings.expiryInMonth;
  }

  if (!expiry) {
    expiry = 1;
  }

  const expiredItems = await db.$queryRaw<ExpiredItemsResponse[]>`
    SELECT 
        s.item_id AS itemId,
        i.item AS itemName,
        COALESCE(b.name, w.name) AS collectionCenterName,
        COALESCE(b.id, w.id) AS ccId,
        s.quantity AS quantity,
        s.batch_no AS batchNo,
        s.expiry_date AS expiryDate,
        CASE WHEN s.is_foc = 1 THEN 'YES' ELSE 'NO' END AS isFoc
    FROM inv_item_stock s
    LEFT JOIN inv_item_master i ON i.id = s.item_id
    LEFT JOIN inv_branch b ON b.id = s.cc_id
    LEFT JOIN inv_warehouse w ON w.id = s.cc_id
    WHERE s.is_active = TRUE
    AND (
      s.expiry_date IS NOT NULL
      AND s.expiry_date >= ${date}
      AND s.expiry_date <= DATE_ADD(${date}, INTERVAL ${expiry} MONTH)
    )
  `;

  logger.info(`exiting::fetchExpiringItems::repository`);
  return { data: expiredItems, expiryInMonth: expiry };
};
