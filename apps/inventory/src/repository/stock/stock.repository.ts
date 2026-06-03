import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { toStockEntity } from "@/mapper/purchase/storeRequisition.mapper.js";
import {
  CreateItemStockInput,
  ItemStockAudit,
  ItemStockResponse,
  RawItemStock,
} from "@/types/stock/stock.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Action, InvItemStock, Prisma } from "@repo/db/generated/prisma/client";
import { ItemStockByBatchInput } from "../../types/stock/stock.js";
import { settingsService } from "@/services/master/settings.service.js";
import { serializeBigInt } from "@repo/shared/utils/bigInt.utils.js";

type Tx = Prisma.TransactionClient;

export const addItemStock = async (
  tx: Tx,
  data: CreateItemStockInput,
  detail: ItemStockAudit
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

export const subItemStock = async (
  tx: Tx,
  data: CreateItemStockInput,
  detail: ItemStockAudit
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
};

export const getStockById = async (
  id: number
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
}: ItemStockByBatchInput) => {
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
  ccId: number
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
    }
  );
};

export const getItemStocksByLocation = async (
  tx: Tx,
  id: number,
  ccId?: number,
  userId?: number,
  canTakeZero = false
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
  canTakeZero = false
): Promise<InvItemStock[]> => {
  logger.info(`entering::getItemStocksByLocation::repository (raw SQL)`);

  const store = requestStorage.getStore();
  const setting = store?.settings;
  const expiry = setting?.expiryInMonth ?? 6;

  const stocks = await tx.$queryRaw<RawItemStock[]>`
    SELECT *
    FROM inv_item_stock
    WHERE (${itemId} IS NULL OR item_id = ${itemId})
      AND (${userId} IS NULL OR user_id = ${userId})
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
  const rows = await db.$queryRaw<RawItemStock[]>`
    SELECT
      im.id                                   AS item_id,
      im.item                                 AS item_name,
      im.item_code,
    im.item_description,
    im.base_price,
    im.is_batch_number,
    im.is_expire_date,
    im.is_returnable,
    im.is_lock,
    im.is_active                            AS item_is_active,

    ic.id                                   AS category_id,
    ic.name                                 AS category_name,

    u.id                                    AS unit_id,
    u.packaging_type_name                   AS unit_name,
    u.packaging_size                        AS unit_size,

    k.cc_id,
    CASE WHEN b.id IS NOT NULL THEN 'BRANCH'
         WHEN w.id IS NOT NULL THEN 'WAREHOUSE'
         ELSE 'UNKNOWN' END                 AS location_type,
    COALESCE(b.name, w.name)                AS location_name,

    k.batch_no,
    COALESCE(sa.expiry_date, grd.grn_expiry_date, cd.cons_expiry_date) AS expiry_date,

    sa.stock_id_list,
    COALESCE(sa.in_hand_qty, 0)             AS in_hand_qty,
    CASE WHEN b.id IS NOT NULL THEN COALESCE(sa.in_hand_qty, 0) ELSE 0 END AS branch_in_hand_qty,
    CASE WHEN w.id IS NOT NULL THEN COALESCE(sa.in_hand_qty, 0) ELSE 0 END AS warehouse_in_hand_qty,

    COALESCE(srd.req_qty,          0)       AS req_qty,
    COALESCE(srd.assigned_qty,     0)       AS assigned_qty,
    COALESCE(srd.acknowledged_qty, 0)       AS acknowledged_qty,
    (COALESCE(srd.req_qty, 0) - COALESCE(srd.assigned_qty, 0))          AS pending_qty,
    (COALESCE(srd.req_qty, 0) - COALESCE(srd.acknowledged_qty, 0))      AS ack_pending_qty,

    COALESCE(grd.ordered_qty,  0)           AS ordered_qty,
    COALESCE(grd.received_qty, 0)           AS received_qty,
    COALESCE(grd.returned_qty, 0)           AS returned_qty,

    COALESCE(cd.consumption_requested_qty, 0) AS consumption_requested_qty,
    COALESCE(cd.consumed_qty, 0)              AS consumed_qty,

    (COALESCE(grd.received_qty, 0) - COALESCE(grd.returned_qty, 0) - COALESCE(cd.consumed_qty, 0)) AS movement_balance,
    (COALESCE(sa.in_hand_qty, 0)
     - (COALESCE(grd.received_qty, 0) - COALESCE(grd.returned_qty, 0) - COALESCE(cd.consumed_qty, 0))) AS variance_vs_stock,

    COALESCE(ism.purchase_price, 0.00)      AS purchase_price

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

export const itemStock = async (ccId: number) => {
  const store = requestStorage.getStore();

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

  const settings = await settingsService.getSettings();
  const warehouseMode = Boolean(settings?.warehouseMode);
  const isWarehouseLocation = warehouseMode ? Boolean(warehouse) : false;
  const isBranchLocation = !isWarehouseLocation && Boolean(branch);
  const locationType = isWarehouseLocation
    ? "WAREHOUSE"
    : isBranchLocation
    ? "BRANCH"
    : "BRANCH";

  const rows = await db.$queryRaw<RawItemStock[]>`
    SELECT
      /* ---------------- Item ---------------- */
      im.id                                   AS item_id,
      im.item                                 AS item_name,
      im.item_code                            AS item_code,
      im.item_description                     AS item_description,
      im.base_price                           AS base_price,
      im.last_purchased_price                 AS last_purchased_price,
      im.re_order_level                       AS re_order_level,
      im.is_batch_number                      AS is_batch_number,
      im.is_expire_date                       AS is_expire_date,
      im.is_returnable                        AS is_returnable,
      im.is_lock                              AS item_is_lock,
      im.is_active                            AS item_is_active,

      /* ---------------- Category ---------------- */
      ic.id                                   AS category_id,
      ic.name                                 AS category_name,

      /* ---------------- Unit ---------------- */
      u.id                                    AS unit_id,
      u.packaging_type_name                   AS unit_name,
      u.packaging_size                        AS unit_size,

      /* ---------------- Location ---------------- */
      k.location_cc_id                        AS cc_id,
      ${locationType}                         AS location_type,
      CASE
        WHEN ${isWarehouseLocation} = true THEN w.name
        ELSE b.name
      END                                     AS location_name,

      /* ---------------- Batch ---------------- */
      COALESCE(stock.batch_no_list, '')       AS batch_no_list,
      COALESCE(stock.expiry_date_list, '')    AS expiry_date_list,
      stock.nearest_expiry_date               AS nearest_expiry_date,

      /* ---------------- Current Stock ---------------- */
      COALESCE(stock.stock_id_list, '')       AS stock_id_list,
      COALESCE(stock.stock_row_count, 0)      AS stock_row_count,
      COALESCE(stock.stock_in_hand_qty, 0)    AS stock_in_hand_qty,
      COALESCE(stock.stock_normal_qty, 0)     AS stock_normal_qty,
      COALESCE(stock.stock_foc_qty, 0)        AS stock_foc_qty,

      /* ---------------- In Transit Stock ---------------- */
      COALESCE(in_transit.in_transit_in_qty, 0) AS in_transit_in_qty,
      COALESCE(in_transit.in_transit_in_normal_qty, 0) AS in_transit_in_normal_qty,
      COALESCE(in_transit.in_transit_in_foc_qty, 0) AS in_transit_in_foc_qty,
      COALESCE(in_transit.in_transit_out_qty, 0) AS in_transit_out_qty,
      COALESCE(in_transit.in_transit_out_normal_qty, 0) AS in_transit_out_normal_qty,
      COALESCE(in_transit.in_transit_out_foc_qty, 0) AS in_transit_out_foc_qty,
      (
        COALESCE(in_transit.in_transit_in_qty, 0)
        - COALESCE(in_transit.in_transit_out_qty, 0)
      ) AS in_transit_net_qty,

      /* ---------------- Purchase Order ---------------- */
      COALESCE(po.po_ordered_qty, 0)          AS po_ordered_qty,
      COALESCE(po.po_received_qty, 0)         AS po_received_qty,
      COALESCE(po.po_pending_qty, 0)          AS po_pending_qty,

      /* ---------------- GRN ---------------- */
      COALESCE(grn.grn_ordered_qty, 0)        AS grn_ordered_qty,
      COALESCE(grn.grn_received_qty, 0)       AS grn_received_qty,
      COALESCE(grn.grn_detail_return_qty, 0)  AS grn_detail_return_qty,

      /* ---------------- GRN Return ---------------- */
      COALESCE(grn_return.grn_return_requested_qty, 0) AS grn_return_requested_qty,
      COALESCE(grn_return.grn_return_pending_qty, 0)   AS grn_return_pending_qty,
      COALESCE(grn_return.grn_return_approved_qty, 0)  AS grn_return_approved_qty,
      COALESCE(grn_return.grn_return_rejected_qty, 0)  AS grn_return_rejected_qty,

      /* ---------------- Store Requisition ---------------- */
      COALESCE(store_req.store_req_qty, 0) AS store_req_qty,
      COALESCE(store_req.store_req_pending_qty, 0) AS store_req_pending_qty,
      COALESCE(store_req.store_req_approved_qty, 0) AS store_req_approved_qty,
      COALESCE(store_req.store_req_rejected_qty, 0) AS store_req_rejected_qty,
      COALESCE(store_req.store_assigned_qty, 0) AS store_assigned_qty,
      COALESCE(store_req.store_acknowledged_qty, 0) AS store_acknowledged_qty,
      COALESCE(store_req.store_returned_qty, 0) AS store_returned_qty,
      (
        COALESCE(store_req.store_req_qty, 0)
        - COALESCE(store_req.store_assigned_qty, 0)
      ) AS store_pending_assign_qty,
      (
        COALESCE(store_req.store_assigned_qty, 0)
        - COALESCE(store_req.store_acknowledged_qty, 0)
      ) AS store_pending_ack_qty,

      /* ---------------- Store Requisition Return ---------------- */
      COALESCE(store_req_return.store_return_requested_qty, 0) AS store_return_requested_qty,
      COALESCE(store_req_return.store_return_pending_qty, 0) AS store_return_pending_qty,
      COALESCE(store_req_return.store_return_approved_qty, 0) AS store_return_approved_qty,
      COALESCE(store_req_return.store_return_rejected_qty, 0) AS store_return_rejected_qty,
      COALESCE(store_req_return.store_return_acknowledged_qty, 0) AS store_return_acknowledged_qty,
      COALESCE(store_req_return.store_return_ack_pending_qty, 0) AS store_return_ack_pending_qty,

      /* ---------------- Branch Requisition ---------------- */
      COALESCE(branch_req.branch_req_qty, 0) AS branch_req_qty,
      COALESCE(branch_req.branch_req_pending_qty, 0) AS branch_req_pending_qty,
      COALESCE(branch_req.branch_req_approved_qty, 0) AS branch_req_approved_qty,
      COALESCE(branch_req.branch_req_rejected_qty, 0) AS branch_req_rejected_qty,
      COALESCE(branch_req.branch_assigned_qty, 0) AS branch_assigned_qty,
      COALESCE(branch_req.branch_acknowledged_qty, 0) AS branch_acknowledged_qty,
      COALESCE(branch_req.branch_returned_qty, 0) AS branch_returned_qty,
      (
        COALESCE(branch_req.branch_req_qty, 0)
        - COALESCE(branch_req.branch_assigned_qty, 0)
      ) AS branch_pending_assign_qty,
      (
        COALESCE(branch_req.branch_assigned_qty, 0)
        - COALESCE(branch_req.branch_acknowledged_qty, 0)
      ) AS branch_pending_ack_qty,

      /* ---------------- Branch Requisition Return ---------------- */
      COALESCE(branch_req_return.branch_return_requested_qty, 0) AS branch_return_requested_qty,
      COALESCE(branch_req_return.branch_return_pending_qty, 0) AS branch_return_pending_qty,
      COALESCE(branch_req_return.branch_return_approved_qty, 0) AS branch_return_approved_qty,
      COALESCE(branch_req_return.branch_return_rejected_qty, 0) AS branch_return_rejected_qty,
      COALESCE(branch_req_return.branch_return_acknowledged_qty, 0) AS branch_return_acknowledged_qty,
      COALESCE(branch_req_return.branch_return_ack_pending_qty, 0) AS branch_return_ack_pending_qty,

      /* ---------------- Consumption ---------------- */
      COALESCE(consumption.consumption_requested_qty, 0) AS consumption_requested_qty,
      COALESCE(consumption.consumption_pending_qty, 0) AS consumption_pending_qty,
      COALESCE(consumption.consumption_approved_qty, 0) AS consumption_approved_qty,
      COALESCE(consumption.consumption_rejected_qty, 0) AS consumption_rejected_qty,
      COALESCE(consumption.consumed_qty, 0) AS consumed_qty,

      /* ---------------- Supplier Price ---------------- */
      COALESCE(item_supplier.purchase_price, 0.00)       AS purchase_price

    FROM
      (
        SELECT DISTINCT
          s.item_id,
          s.cc_id AS location_cc_id
        FROM inv_item_stock s
        WHERE s.is_active = 1
          AND s.deleted_at IS NULL
          AND s.cc_id IS NOT NULL
          AND s.cc_id = ${ccId}

        UNION

        SELECT DISTINCT
          its.item_id,
          its.to_cc_id AS location_cc_id
        FROM inv_in_transit_stock its
        WHERE its.is_active = 1
          AND its.deleted_at IS NULL
          AND its.to_cc_id = ${ccId}

        UNION

        SELECT DISTINCT
          its.item_id,
          its.from_cc_id AS location_cc_id
        FROM inv_in_transit_stock its
        WHERE its.is_active = 1
          AND its.deleted_at IS NULL
          AND its.from_cc_id = ${ccId}

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
        GROUP_CONCAT(s.id ORDER BY s.id) AS stock_id_list
      FROM inv_item_stock s
      WHERE s.is_active = 1
        AND s.deleted_at IS NULL
        AND s.cc_id IS NOT NULL
        AND s.cc_id = ${ccId}
      GROUP BY s.item_id, s.cc_id
    ) stock
      ON stock.item_id = k.item_id
     AND stock.cc_id = k.location_cc_id

    /* ---------------- In Transit ---------------- */
    LEFT JOIN (
      SELECT
        its.item_id,
        CASE
          WHEN its.to_cc_id = ${ccId} THEN its.to_cc_id
          WHEN its.from_cc_id = ${ccId} THEN its.from_cc_id
          ELSE ${ccId}
        END AS location_cc_id,
        MIN(its.expiry_date) AS in_transit_expiry_date,
        SUM(
          CASE
            WHEN its.to_cc_id = ${ccId}
            THEN COALESCE(its.quantity, 0)
            ELSE 0
          END
        ) AS in_transit_in_qty,
        SUM(
          CASE
            WHEN its.from_cc_id = ${ccId}
            THEN COALESCE(its.quantity, 0)
            ELSE 0
          END
        ) AS in_transit_out_qty,
        SUM(
          CASE
            WHEN its.to_cc_id = ${ccId} AND its.is_foc = 0
            THEN COALESCE(its.quantity, 0)
            ELSE 0
          END
        ) AS in_transit_in_normal_qty,
        SUM(
          CASE
            WHEN its.to_cc_id = ${ccId} AND its.is_foc = 1
            THEN COALESCE(its.quantity, 0)
            ELSE 0
          END
        ) AS in_transit_in_foc_qty,
        SUM(
          CASE
            WHEN its.from_cc_id = ${ccId} AND its.is_foc = 0
            THEN COALESCE(its.quantity, 0)
            ELSE 0
          END
        ) AS in_transit_out_normal_qty,
        SUM(
          CASE
            WHEN its.from_cc_id = ${ccId} AND its.is_foc = 1
            THEN COALESCE(its.quantity, 0)
            ELSE 0
          END
        ) AS in_transit_out_foc_qty
      FROM inv_in_transit_stock its
      WHERE its.is_active = 1
        AND its.deleted_at IS NULL
        AND (
          its.to_cc_id = ${ccId}
          OR its.from_cc_id = ${ccId}
        )
      GROUP BY
        its.item_id,
        CASE
          WHEN its.to_cc_id = ${ccId} THEN its.to_cc_id
          WHEN its.from_cc_id = ${ccId} THEN its.from_cc_id
          ELSE ${ccId}
        END
    ) in_transit
      ON in_transit.item_id = k.item_id
     AND in_transit.location_cc_id = k.location_cc_id

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

    ORDER BY
      im.item DESC,
      stock.nearest_expiry_date IS NULL,
      stock.nearest_expiry_date DESC
  `;

  return serializeBigInt(rows);
};

export const getItemStockByItemOnly = async (
  itemId: number,
  ccId: number,
  batchNo?: string | null,
  expiryDate?: Date | null,
  isFoc?: boolean
) => {
  logger.info(`entering::getItemStockByItemOnly::repository`);

  const stock = await db.invItemStock.findFirst({
    where: {
      itemId,
      ccId,
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
  ids: number[]
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
