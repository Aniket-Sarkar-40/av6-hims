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
  const settings = await settingsService.getSettings();
  const warehouseMode = Boolean(settings?.warehouseMode);
  const locationType = warehouseMode ? "WAREHOUSE" : "BRANCH";

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
        WHEN ${warehouseMode} = true THEN w.name
        ELSE b.name
      END                                     AS location_name,

      /* ---------------- Batch ---------------- */
      k.batch_no                              AS batch_no,
      COALESCE(
        stock.stock_expiry_date,
        grn.grn_expiry_date,
        grn_return.grn_return_expiry_date,
        consumption.consumption_expiry_date,
        in_transit.in_transit_expiry_date
      )                                       AS expiry_date,

      /* ---------------- Current Stock ---------------- */
      COALESCE(stock.stock_id_list, '')       AS stock_id_list,
      COALESCE(stock.stock_in_hand_qty, 0)    AS stock_in_hand_qty,

      CASE
        WHEN ${warehouseMode} = true THEN COALESCE(stock.stock_in_hand_qty, 0)
        ELSE 0
      END                                     AS warehouse_stock_in_hand_qty,

      CASE
        WHEN ${warehouseMode} = false THEN COALESCE(stock.stock_in_hand_qty, 0)
        ELSE 0
      END                                     AS branch_stock_in_hand_qty,

      /* ---------------- In Transit Stock ---------------- */
      COALESCE(in_transit.in_transit_in_qty, 0)       AS in_transit_in_qty,
      COALESCE(in_transit.in_transit_out_qty, 0)      AS in_transit_out_qty,
      (
        COALESCE(in_transit.in_transit_in_qty, 0)
        - COALESCE(in_transit.in_transit_out_qty, 0)
      )                                               AS in_transit_net_qty,

      /* ---------------- Purchase Order ---------------- */
      COALESCE(po.po_ordered_qty, 0)          AS po_ordered_qty,
      COALESCE(po.po_received_qty, 0)         AS po_received_qty,
      COALESCE(po.po_pending_qty, 0)          AS po_pending_qty,

      /* ---------------- GRN ---------------- */
      COALESCE(grn.grn_ordered_qty, 0)        AS grn_ordered_qty,
      COALESCE(grn.grn_received_qty, 0)       AS grn_received_qty,
      COALESCE(grn.grn_detail_return_qty, 0)  AS grn_detail_return_qty,

      /* ---------------- GRN Return ---------------- */
      COALESCE(grn_return.grn_return_qty, 0)  AS grn_return_qty,

      /* ---------------- Store Requisition ---------------- */
      COALESCE(store_req.store_req_qty, 0)             AS store_req_qty,
      COALESCE(store_req.store_assigned_qty, 0)        AS store_assigned_qty,
      COALESCE(store_req.store_acknowledged_qty, 0)    AS store_acknowledged_qty,
      COALESCE(store_req.store_returned_qty, 0)        AS store_returned_qty,
      (
        COALESCE(store_req.store_req_qty, 0)
        - COALESCE(store_req.store_assigned_qty, 0)
      )                                               AS store_pending_assign_qty,
      (
        COALESCE(store_req.store_assigned_qty, 0)
        - COALESCE(store_req.store_acknowledged_qty, 0)
      )                                               AS store_pending_ack_qty,

      /* ---------------- Store Requisition Return ---------------- */
      COALESCE(store_req_return.store_return_requested_qty, 0)      AS store_return_requested_qty,
      COALESCE(store_req_return.store_return_acknowledged_qty, 0)   AS store_return_acknowledged_qty,
      (
        COALESCE(store_req_return.store_return_requested_qty, 0)
        - COALESCE(store_req_return.store_return_acknowledged_qty, 0)
      )                                                           AS store_return_pending_ack_qty,

      /* ---------------- Branch Requisition ---------------- */
      COALESCE(branch_req.branch_req_qty, 0)             AS branch_req_qty,
      COALESCE(branch_req.branch_assigned_qty, 0)        AS branch_assigned_qty,
      COALESCE(branch_req.branch_acknowledged_qty, 0)    AS branch_acknowledged_qty,
      COALESCE(branch_req.branch_returned_qty, 0)        AS branch_returned_qty,
      (
        COALESCE(branch_req.branch_req_qty, 0)
        - COALESCE(branch_req.branch_assigned_qty, 0)
      )                                                 AS branch_pending_assign_qty,
      (
        COALESCE(branch_req.branch_assigned_qty, 0)
        - COALESCE(branch_req.branch_acknowledged_qty, 0)
      )                                                 AS branch_pending_ack_qty,

      /* ---------------- Branch Requisition Return ---------------- */
      COALESCE(branch_req_return.branch_return_requested_qty, 0)    AS branch_return_requested_qty,
      COALESCE(branch_req_return.branch_return_acknowledged_qty, 0) AS branch_return_acknowledged_qty,
      (
        COALESCE(branch_req_return.branch_return_requested_qty, 0)
        - COALESCE(branch_req_return.branch_return_acknowledged_qty, 0)
      )                                                           AS branch_return_pending_ack_qty,

      /* ---------------- Consumption ---------------- */
      COALESCE(consumption.consumption_requested_qty, 0) AS consumption_requested_qty,
      COALESCE(consumption.consumed_qty, 0)              AS consumed_qty,

      /* ---------------- Supplier Price ---------------- */
      COALESCE(item_supplier.purchase_price, 0.00)       AS purchase_price,

      /* ---------------- Final Calculated Qty ---------------- */
      (
        COALESCE(stock.stock_in_hand_qty, 0)
        + COALESCE(in_transit.in_transit_in_qty, 0)
        + COALESCE(po.po_pending_qty, 0)
        - COALESCE(consumption.consumed_qty, 0)
      ) AS available_with_po_in_transit_qty,

      (
        COALESCE(grn.grn_received_qty, 0)
        - COALESCE(grn_return.grn_return_qty, 0)
        - COALESCE(consumption.consumed_qty, 0)
      ) AS movement_balance_qty,

      (
        COALESCE(stock.stock_in_hand_qty, 0)
        - (
          COALESCE(grn.grn_received_qty, 0)
          - COALESCE(grn_return.grn_return_qty, 0)
          - COALESCE(consumption.consumed_qty, 0)
        )
      ) AS stock_variance_qty

    FROM
      (
        /* Stock */
        SELECT
          s.item_id,
          s.batch_no,
          s.cc_id AS location_cc_id
        FROM inv_item_stock s
        WHERE s.is_active = 1
          AND s.deleted_at IS NULL
          AND s.cc_id = ${ccId}

        UNION

        /* In transit incoming */
        SELECT
          its.item_id,
          its.batch_no,
          its.to_cc_id AS location_cc_id
        FROM inv_in_transit_stock its
        WHERE its.is_active = 1
          AND its.deleted_at IS NULL
          AND its.to_cc_id = ${ccId}

        UNION

        /* In transit outgoing */
        SELECT
          its.item_id,
          its.batch_no,
          its.from_cc_id AS location_cc_id
        FROM inv_in_transit_stock its
        WHERE its.is_active = 1
          AND its.deleted_at IS NULL
          AND its.from_cc_id = ${ccId}

        UNION

        /* Purchase order */
        SELECT
          pod.item_id,
          NULL AS batch_no,
          po.cc_id AS location_cc_id
        FROM inv_purchase_order_details pod
        JOIN inv_purchase_order po
          ON po.id = pod.purchase_id
         AND po.is_active = 1
         AND po.deleted_at IS NULL
        WHERE pod.is_active = 1
          AND pod.deleted_at IS NULL
          AND po.cc_id = ${ccId}

        UNION

        /* GRN */
        SELECT
          grd.item_id,
          grd.batch_no,
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

        /* GRN return */
        SELECT
          grrd.item_id,
          grrd.batch_no,
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

        /* Consumption */
        SELECT
          cd.item_id,
          cd.batch_no,
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

        /* Store requisition issued from warehouse to branch */
        SELECT
          rid.item_id,
          rid.batch_no,
          CASE
            WHEN ${warehouseMode} = true THEN rid.cc_id
            ELSE rid.ack_cc_id
          END AS location_cc_id
        FROM inv_requisition_item_details rid
        WHERE rid.is_active = 1
          AND rid.deleted_at IS NULL
          AND (
            (${warehouseMode} = true AND rid.cc_id = ${ccId})
            OR
            (${warehouseMode} = false AND rid.ack_cc_id = ${ccId})
          )

        UNION

        /* Store requisition return */
        SELECT
          rrid.item_id,
          rrid.batch_no,
          CASE
            WHEN ${warehouseMode} = true THEN rid.cc_id
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
            (${warehouseMode} = true AND rid.cc_id = ${ccId})
            OR
            (${warehouseMode} = false AND rrid.cc_id = ${ccId})
          )

        UNION

        /* Branch requisition issued from warehouse to branch */
        SELECT
          bid.item_id,
          bid.batch_no,
          CASE
            WHEN ${warehouseMode} = true THEN bid.cc_id
            ELSE bid.ack_cc_id
          END AS location_cc_id
        FROM inv_branch_item_details bid
        WHERE bid.is_active = 1
          AND bid.deleted_at IS NULL
          AND (
            (${warehouseMode} = true AND bid.cc_id = ${ccId})
            OR
            (${warehouseMode} = false AND bid.ack_cc_id = ${ccId})
          )

        UNION

        /* Branch requisition return */
        SELECT
          brid.item_id,
          brid.batch_no,
          CASE
            WHEN ${warehouseMode} = true THEN brid.cc_id
            ELSE brid.branch_id
          END AS location_cc_id
        FROM inv_branch_return_item_details brid
        WHERE brid.is_active = 1
          AND brid.deleted_at IS NULL
          AND (
            (${warehouseMode} = true AND brid.cc_id = ${ccId})
            OR
            (${warehouseMode} = false AND brid.branch_id = ${ccId})
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
        s.batch_no,
        MIN(s.expiry_date)               AS stock_expiry_date,
        SUM(s.quantity)                  AS stock_in_hand_qty,
        GROUP_CONCAT(s.id ORDER BY s.id) AS stock_id_list
      FROM inv_item_stock s
      WHERE s.is_active = 1
        AND s.deleted_at IS NULL
        AND s.cc_id = ${ccId}
      GROUP BY s.item_id, s.cc_id, s.batch_no
    ) stock
      ON stock.item_id = k.item_id
     AND stock.cc_id = k.location_cc_id
     AND (
       stock.batch_no = k.batch_no
       OR (stock.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- In Transit ---------------- */
    LEFT JOIN (
      SELECT
        its.item_id,
        CASE
          WHEN its.to_cc_id = ${ccId} THEN its.to_cc_id
          ELSE its.from_cc_id
        END AS location_cc_id,
        its.batch_no,
        MIN(its.expiry_date) AS in_transit_expiry_date,
        SUM(CASE WHEN its.to_cc_id = ${ccId} THEN its.quantity ELSE 0 END)   AS in_transit_in_qty,
        SUM(CASE WHEN its.from_cc_id = ${ccId} THEN its.quantity ELSE 0 END) AS in_transit_out_qty
      FROM inv_in_transit_stock its
      WHERE its.is_active = 1
        AND its.deleted_at IS NULL
        AND (its.to_cc_id = ${ccId} OR its.from_cc_id = ${ccId})
      GROUP BY
        its.item_id,
        CASE
          WHEN its.to_cc_id = ${ccId} THEN its.to_cc_id
          ELSE its.from_cc_id
        END,
        its.batch_no
    ) in_transit
      ON in_transit.item_id = k.item_id
     AND in_transit.location_cc_id = k.location_cc_id
     AND (
       in_transit.batch_no = k.batch_no
       OR (in_transit.batch_no IS NULL AND k.batch_no IS NULL)
     )

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
        grd.batch_no,
        grn.cc_id,
        MIN(grd.expiry_date) AS grn_expiry_date,
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
      GROUP BY grd.item_id, grd.batch_no, grn.cc_id
    ) grn
      ON grn.item_id = k.item_id
     AND grn.cc_id = k.location_cc_id
     AND (
       grn.batch_no = k.batch_no
       OR (grn.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- GRN Return ---------------- */
    LEFT JOIN (
      SELECT
        grrd.item_id,
        grrd.batch_no,
        grr.cc_id,
        MIN(grrd.expiry_date) AS grn_return_expiry_date,
        SUM(grrd.quantity) AS grn_return_qty
      FROM inv_good_receive_return_details grrd
      JOIN inv_good_receive_return grr
        ON grr.id = grrd.good_receive_return_id
       AND grr.is_active = 1
       AND grr.deleted_at IS NULL
      WHERE grrd.is_active = 1
        AND grrd.deleted_at IS NULL
        AND grr.cc_id = ${ccId}
      GROUP BY grrd.item_id, grrd.batch_no, grr.cc_id
    ) grn_return
      ON grn_return.item_id = k.item_id
     AND grn_return.cc_id = k.location_cc_id
     AND (
       grn_return.batch_no = k.batch_no
       OR (grn_return.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- Store Requisition ---------------- */
    LEFT JOIN (
      SELECT
        rid.item_id,
        rid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN rid.cc_id
          ELSE rid.ack_cc_id
        END AS location_cc_id,
        SUM(srd.req_quantity) AS store_req_qty,
        SUM(rid.assign_qty) AS store_assigned_qty,
        SUM(rid.acknowledged_qty) AS store_acknowledged_qty,
        SUM(rid.returned_qty) AS store_returned_qty
      FROM inv_requisition_item_details rid
      JOIN inv_store_requisition_details srd
        ON srd.id = rid.store_requisition_details_id
       AND srd.is_active = 1
       AND srd.deleted_at IS NULL
      JOIN inv_store_requisition sr
        ON sr.id = rid.store_requisition_id
       AND sr.is_active = 1
       AND sr.deleted_at IS NULL
      WHERE rid.is_active = 1
        AND rid.deleted_at IS NULL
        AND (
          (${warehouseMode} = true AND rid.cc_id = ${ccId})
          OR
          (${warehouseMode} = false AND rid.ack_cc_id = ${ccId})
        )
      GROUP BY
        rid.item_id,
        rid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN rid.cc_id
          ELSE rid.ack_cc_id
        END
    ) store_req
      ON store_req.item_id = k.item_id
     AND store_req.location_cc_id = k.location_cc_id
     AND (
       store_req.batch_no = k.batch_no
       OR (store_req.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- Store Requisition Return ---------------- */
    LEFT JOIN (
      SELECT
        rrid.item_id,
        rrid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN rid.cc_id
          ELSE rrid.cc_id
        END AS location_cc_id,
        SUM(rrid.return_qty) AS store_return_requested_qty,
        SUM(rrid.acknowledged_qty) AS store_return_acknowledged_qty
      FROM inv_requisition_return_item_details rrid
      JOIN inv_requisition_item_details rid
        ON rid.id = rrid.requisition_item_details_id
       AND rid.is_active = 1
       AND rid.deleted_at IS NULL
      WHERE rrid.is_active = 1
        AND rrid.deleted_at IS NULL
        AND (
          (${warehouseMode} = true AND rid.cc_id = ${ccId})
          OR
          (${warehouseMode} = false AND rrid.cc_id = ${ccId})
        )
      GROUP BY
        rrid.item_id,
        rrid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN rid.cc_id
          ELSE rrid.cc_id
        END
    ) store_req_return
      ON store_req_return.item_id = k.item_id
     AND store_req_return.location_cc_id = k.location_cc_id
     AND (
       store_req_return.batch_no = k.batch_no
       OR (store_req_return.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- Branch Requisition ---------------- */
    LEFT JOIN (
      SELECT
        bid.item_id,
        bid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN bid.cc_id
          ELSE bid.ack_cc_id
        END AS location_cc_id,
        SUM(brd.req_quantity) AS branch_req_qty,
        SUM(bid.assign_qty) AS branch_assigned_qty,
        SUM(bid.acknowledged_qty) AS branch_acknowledged_qty,
        SUM(bid.returned_qty) AS branch_returned_qty
      FROM inv_branch_item_details bid
      JOIN inv_branch_requisition_details brd
        ON brd.id = bid.branch_requisition_details_id
       AND brd.is_active = 1
       AND brd.deleted_at IS NULL
      JOIN inv_branch_requisition br
        ON br.id = bid.branch_requisition_id
       AND br.is_active = 1
       AND br.deleted_at IS NULL
      WHERE bid.is_active = 1
        AND bid.deleted_at IS NULL
        AND (
          (${warehouseMode} = true AND bid.cc_id = ${ccId})
          OR
          (${warehouseMode} = false AND bid.ack_cc_id = ${ccId})
        )
      GROUP BY
        bid.item_id,
        bid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN bid.cc_id
          ELSE bid.ack_cc_id
        END
    ) branch_req
      ON branch_req.item_id = k.item_id
     AND branch_req.location_cc_id = k.location_cc_id
     AND (
       branch_req.batch_no = k.batch_no
       OR (branch_req.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- Branch Requisition Return ---------------- */
    LEFT JOIN (
      SELECT
        brid.item_id,
        brid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN brid.cc_id
          ELSE brid.branch_id
        END AS location_cc_id,
        SUM(brid.return_qty) AS branch_return_requested_qty,
        SUM(brid.acknowledged_qty) AS branch_return_acknowledged_qty
      FROM inv_branch_return_item_details brid
      WHERE brid.is_active = 1
        AND brid.deleted_at IS NULL
        AND (
          (${warehouseMode} = true AND brid.cc_id = ${ccId})
          OR
          (${warehouseMode} = false AND brid.branch_id = ${ccId})
        )
      GROUP BY
        brid.item_id,
        brid.batch_no,
        CASE
          WHEN ${warehouseMode} = true THEN brid.cc_id
          ELSE brid.branch_id
        END
    ) branch_req_return
      ON branch_req_return.item_id = k.item_id
     AND branch_req_return.location_cc_id = k.location_cc_id
     AND (
       branch_req_return.batch_no = k.batch_no
       OR (branch_req_return.batch_no IS NULL AND k.batch_no IS NULL)
     )

    /* ---------------- Consumption ---------------- */
    LEFT JOIN (
      SELECT
        cd.item_id,
        cd.batch_no,
        c.cc_id,
        MIN(DATE(cd.expiry_date)) AS consumption_expiry_date,
        SUM(cd.requested_qty) AS consumption_requested_qty,
        SUM(COALESCE(cd.consumed_qty, 0)) AS consumed_qty
      FROM inv_consumption_details cd
      JOIN inv_consumption c
        ON c.id = cd.consumption_id
       AND c.is_active = 1
       AND c.deleted_at IS NULL
      WHERE cd.is_active = 1
        AND cd.deleted_at IS NULL
        AND c.cc_id = ${ccId}
      GROUP BY cd.item_id, cd.batch_no, c.cc_id
    ) consumption
      ON consumption.item_id = k.item_id
     AND consumption.cc_id = k.location_cc_id
     AND (
       consumption.batch_no = k.batch_no
       OR (consumption.batch_no IS NULL AND k.batch_no IS NULL)
     )

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
      k.batch_no DESC,
      expiry_date IS NULL,
      expiry_date DESC
  `;

  return rows;
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
