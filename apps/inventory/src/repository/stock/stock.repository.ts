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

type Tx = Prisma.TransactionClient;

export const addItemStock = async (
  tx: Tx,
  data: CreateItemStockInput,
  detail: ItemStockAudit
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const isStockExists = await tx.invItemStock.findFirst({
    where: {
      itemId: data.itemId,
      ccId: data.ccId,
      userId: data.userId,
      batchNo: data.batchNo,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
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
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
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
  const isStockExists = await tx.invItemStock.findFirst({
    where: {
      itemId: data.itemId,
      ccId: data.ccId,
      batchNo: data.batchNo ?? null,
      userId: data.userId,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
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
      ccId,
      userId,
      batchNo,
      expiryDate: expiryDate ? expiryDate : null,
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
  const rows = await db.$queryRaw<RawItemStock[]>`
    SELECT
      /* Item master */
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

      /* Category */
      ic.id                                   AS category_id,
      ic.name                                 AS category_name,

      /* Unit */
      u.id                                    AS unit_id,
      u.packaging_type_name                   AS unit_name,
      u.packaging_size                        AS unit_size,

      /* Location & keyset */
      k.cc_id,
      CASE WHEN b.id IS NOT NULL THEN 'BRANCH'
           WHEN w.id IS NOT NULL THEN 'WAREHOUSE'
           ELSE 'UNKNOWN' END                 AS location_type,
      COALESCE(b.name, w.name)                AS location_name,

      k.batch_no,
      COALESCE(sa.expiry_date, grd.grn_expiry_date, cd.cons_expiry_date) AS expiry_date,

      /* Stock (deduped) */
      sa.stock_id_list,
      COALESCE(sa.in_hand_qty, 0)             AS in_hand_qty,
      CASE WHEN b.id IS NOT NULL THEN COALESCE(sa.in_hand_qty, 0) ELSE 0 END AS branch_in_hand_qty,
      CASE WHEN w.id IS NOT NULL THEN COALESCE(sa.in_hand_qty, 0) ELSE 0 END AS warehouse_in_hand_qty,

      /* Requisition (item+cc) */
      COALESCE(srd.req_qty,          0)       AS sr_req_qty,
      COALESCE(srd.assigned_qty,     0)       AS sr_assigned_qty,
      COALESCE(srd.acknowledged_qty, 0)       AS sr_acknowledged_qty,
      (COALESCE(srd.req_qty, 0) - COALESCE(srd.assigned_qty, 0))          AS sr_pending_qty_srr_sra,
      (COALESCE(srd.req_qty, 0) - COALESCE(sdi.consumed_qty_total, 0))    AS location_stock_rq_cq, 
      (COALESCE(srd.req_qty, 0) - COALESCE(srd.acknowledged_qty, 0))      AS ack_pending_qty_rq_aq,

      /* GRN (item+batch+cc) */
      COALESCE(grd.ordered_qty,  0)           AS grn_ordered_qty,
      COALESCE(grd.received_qty, 0)           AS grn_received_qty,
      COALESCE(grd.returned_qty, 0)           AS grn_returned_qty,

      /* Consumption (batch-level) */
      CAST(COALESCE(cd.consumption_requested_qty, 0) AS DOUBLE) AS consumption_requested_qty,
      CAST(COALESCE(cd.consumed_qty,              0) AS DOUBLE) AS consumed_qty,

      /* Purchase Orders (item+cc) */
      COALESCE(po.po_ordered_qty,  0)         AS po_ordered_qty,        
      COALESCE(po.po_received_qty, 0)         AS po_received_qty,       
      COALESCE(po.po_pending_qty,  0)         AS po_pending_qty_poq_prq,        -- open PO qty (ordered - received)
      /* Total stock as requested */
      (COALESCE(po.po_pending_qty, 0) + COALESCE(sa.in_hand_qty, 0)
       + (COALESCE(srd.req_qty, 0) - COALESCE(sdi.consumed_qty_total, 0))) AS total_stock_ppq_sq_srrq_cq,

      /* Movement math */
      (COALESCE(grd.received_qty, 0) - COALESCE(grd.returned_qty, 0) - COALESCE(cd.consumed_qty, 0)) AS grn_recQT_retrQty_consQTY_stock,
      (COALESCE(sa.in_hand_qty, 0)
       - (COALESCE(grd.received_qty, 0) - COALESCE(grd.returned_qty, 0) - COALESCE(cd.consumed_qty, 0))) AS variance_vs_stock,

      /* Supplier mapping */
      COALESCE(ism.purchase_price, 0.00)      AS purchase_price

    FROM
      /* Keyset across STOCK ∪ GRN ∪ CONSUMPTION to ensure presence */
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

    /* Stock deduped by (item, batch, cc) */
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

    /* Requisitions by (item, cc) */
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

    /* GRN by (item, batch, cc) + expiry hint */
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

    /* Consumption by (item, batch, cc) */
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

    /* Consumption TOTALS by (item, cc) for location_stock */
    LEFT JOIN (
      SELECT
        c.item_id,
        cons.cc_id,
        SUM(c.consumed_qty) AS consumed_qty_total
      FROM inv_consumption_details c
      JOIN inv_consumption cons
        ON cons.id = c.consumption_id
       AND cons.is_active = 1
       AND cons.deleted_at IS NULL
      WHERE c.is_active = 1
        AND c.deleted_at IS NULL
      GROUP BY c.item_id, cons.cc_id
    ) sdi
      ON sdi.item_id = k.item_id
     AND sdi.cc_id   = k.cc_id

    /* PO totals by (item, cc) */
    LEFT JOIN (
      SELECT
        pod.item_id,
        po.cc_id,
        SUM(pod.quantity)                          AS po_ordered_qty,
        SUM(pod.received_qty)                      AS po_received_qty,
        SUM(GREATEST(pod.quantity - pod.received_qty, 0)) AS po_pending_qty
      FROM inv_purchase_order_details pod
      JOIN inv_purchase_order po
        ON po.id = pod.purchase_id
       AND po.is_active = 1
       AND po.deleted_at IS NULL
      WHERE pod.is_active = 1
        AND pod.deleted_at IS NULL
      GROUP BY pod.item_id, po.cc_id
    ) po
      ON po.item_id = k.item_id
     AND po.cc_id   = k.cc_id

    /* Supplier mapping: latest valid (by entry_on) per item+cc */
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

    /* Resolve cc_id to Branch/Warehouse */
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
