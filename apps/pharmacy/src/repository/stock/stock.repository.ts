import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateItemStockInput,
  ExpiredItemsResponse,
  ExpiringItemsResponse,
  ItemStockAudit,
  LowStockResponse,
  RawItemStock,
  StockTransferReq,
  TransferableStockInp,
  updateBatchExpiryInput,
} from "@/types/stock/stock.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { getSettingsInDb } from "../master/settings.repository.js";
import {
  Action,
  PmsItemStock,
  PmsOperation,
  Prisma,
} from "@repo/db/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export const addInitialStock = async (
  data: CreateItemStockInput,
  detail: ItemStockAudit,
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  if (!data.batchNo) data.batchNo = "n@n";
  if (!data.expiryDate) data.expiryDate = new Date("2999-12-31");
  const isStockExists = await db.pmsItemStock.findFirst({
    where: {
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      branchId: data.branchId,
      batchNo: data.batchNo,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isFoc: data.isFoc,
      isActive: true,
    },
  });
  if (!isStockExists) {
    const created = await db.pmsItemStock.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        branchId: data.branchId ?? null,
        quantity: data.quantity,
        batchNo: data.batchNo,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isActive: true,
        isFoc: data.isFoc,
        createdBy: currentUser,
      },
    });
    await db.pmsItemStockAudit.create({
      data: {
        itemStockId: created.id,
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
  }
};

export const addItemStock = async (
  tx: Tx,
  data: CreateItemStockInput,
  detail: ItemStockAudit,
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const isStockExists = await tx.pmsItemStock.findFirst({
    where: {
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      branchId: data.branchId,
      batchNo: data.batchNo,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isFoc: data.isFoc,
      isActive: true,
    },
  });
  let stockId: number = isStockExists ? isStockExists.id : 0;
  if (isStockExists) {
    //update the quantity
    await tx.pmsItemStock.update({
      where: {
        id: isStockExists.id,
      },
      data: {
        quantity: isStockExists.quantity + data.quantity,
        updatedBy: currentUser,
      },
    });
  } else {
    const created = await tx.pmsItemStock.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        branchId: data.branchId ?? null,
        quantity: data.quantity,
        batchNo: data.batchNo,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isActive: true,
        isFoc: data.isFoc,
        createdBy: currentUser,
      },
    });
    stockId = created.id;
  }

  await tx.pmsItemStockAudit.create({
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
  detail: ItemStockAudit,
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id || detail.createdBy;
  const isStockExists = await tx.pmsItemStock.findFirst({
    where: {
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      branchId: data.branchId,
      batchNo: data.batchNo,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isFoc: data.isFoc,
      isActive: true,
    },
  });

  if (!isStockExists || isStockExists.quantity < data.quantity) {
    throw new ErrorHandler(400, "Insufficient stock to consume");
  }

  await tx.pmsItemStock.update({
    where: {
      id: isStockExists.id,
    },
    data: {
      quantity: isStockExists.quantity - data.quantity,
      updatedBy: currentUser,
    },
  });

  await tx.pmsItemStockAudit.create({
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

export const stockTransfer = async (
  tx: Tx,
  data: StockTransferReq,
  item: CreateItemStockInput,
  detail: ItemStockAudit,
): Promise<void> => {
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const fromStock = await tx.pmsItemStock.findFirst({
    where: {
      itemId: item.itemId,
      warehouseId: data.from.type === "warehouse" ? data.from.id : undefined,
      branchId: data.from.type === "branch" ? data.from.id : undefined,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      isFoc: item.isFoc,
    },
  });

  if (!fromStock || fromStock.quantity < item.quantity) {
    throw new Error(`Insufficient stock to transfer Item id:${item.itemId}`);
  }

  // Deduct from source stock
  await tx.pmsItemStock.update({
    where: { id: fromStock.id },
    data: {
      quantity: fromStock.quantity - item.quantity,
      updatedBy: currentUser,
    },
  });

  // Add to destination stock
  const toStock = await tx.pmsItemStock.findFirst({
    where: {
      itemId: item.itemId,
      warehouseId: data.to.type === "warehouse" ? data.to.id : undefined,
      branchId: data.to.type === "branch" ? data.to.id : undefined,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      isFoc: item.isFoc,
    },
  });

  let toStockId = toStock ? toStock.id : 0;
  if (toStock) {
    // Update the quantity
    await tx.pmsItemStock.update({
      where: { id: toStock.id },
      data: {
        quantity: toStock.quantity + item.quantity,
        updatedBy: currentUser,
      },
    });
  } else {
    // Create new stock entry
    const created = await tx.pmsItemStock.create({
      data: {
        itemId: item.itemId,
        warehouseId: data.to.type === "warehouse" ? data.to.id : undefined,
        branchId: data.to.type === "branch" ? data.to.id : undefined,
        quantity: item.quantity,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        isActive: true,
        createdBy: currentUser,
        isFoc: item.isFoc,
      },
    });
    toStockId = created.id;
  }

  // Log the transfer in audit
  await tx.pmsItemStockAudit.create({
    data: {
      itemStockId: fromStock.id, // Log the source stock
      quantity: item.quantity,
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
  // Log the addition in destination stock audit
  await tx.pmsItemStockAudit.create({
    data: {
      itemStockId: toStockId, // Log the destination stock
      quantity: item.quantity,
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

export const stockTransferValidationOperation = async (
  data: StockTransferReq,
  item: CreateItemStockInput,
) => {
  const fromStock = await db.pmsItemStock.findFirst({
    where: {
      itemId: item.itemId,
      // warehouseId: data.from.id ?? undefined,
      branchId: data.from.id ?? undefined,
      batchNo: item.batchNo ?? undefined,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      isActive: true,
      isFoc: item.isFoc,
    },
  });

  return fromStock;
};

export const getStockById = async (id: number) => {
  logger.info(`entering::getStockById::repository`);

  return db.pmsItemStock.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getItemStocksByLocation = async (
  tx: Tx,
  itemId?: number,
  warehouseId?: number,
  branchId?: number,
  canTakeZero = false,
): Promise<PmsItemStock[]> => {
  logger.info(`entering::getItemStocksByLocation::repository (raw SQL)`);
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const expiry = setting?.expiryInMonth ?? 6;
  const stocks = await tx.$queryRaw<RawItemStock[]>`
  SELECT *
  FROM pms_item_stock
  WHERE (${itemId}      IS NULL OR item_id      = ${itemId})
    AND (${warehouseId} IS NULL OR warehouse_id = ${warehouseId})
    AND (${branchId}    IS NULL OR branch_id    = ${branchId})
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

export const getItemStockQtyByLocation = async (
  itemId: number,
  location: { warehouseId?: number; branchId?: number },
) => {
  logger.info(`entering::getItemStockByLocation::repository`);

  return await db.$transaction(
    async (tx) => {
      const stocks = await getItemStocksByLocation(
        tx,
        itemId,
        location.warehouseId,
        location.branchId,
      );
      const totalQty = stocks.reduce((acc, curr) => (acc += curr.quantity), 0);

      return totalQty;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getItemStockQtyByBatchWise = async (
  itemId: number,
  location: { warehouseId?: number; branchId?: number },
  batchNo: string,
  expiryDate?: Date | null,
  isFoc?: boolean,
) => {
  logger.info(`entering::getItemStockByLocation::repository`);

  const sumResult = await db.pmsItemStock.aggregate({
    where: {
      itemId,
      warehouseId: location.warehouseId,
      branchId: location.branchId,
      batchNo,
      expiryDate: expiryDate
        ? expiryDate
        : {
            gte: new Date(),
          },
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

export const getItemStockByBatchWise = async (
  itemId: number,
  location: { warehouseId?: number; branchId?: number },
  batchNo: string,
  expiryDate?: Date | null,
) => {
  logger.info(`entering::getItemStockByBatchWise::repository`);

  const stock = await db.pmsItemStock.findFirst({
    where: {
      itemId,
      warehouseId: location.warehouseId,
      branchId: location.branchId,
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
export const getItemStockByItemOnly = async (
  itemId: number,
  location: { warehouseId?: number; branchId?: number },
  batchNo?: string | null,
  expiryDate?: Date | null,
  isFoc?: boolean,
) => {
  logger.info(`entering::getItemStockByItemOnly::repository`);

  const stock = await db.pmsItemStock.findFirst({
    where: {
      itemId,
      warehouseId: location.warehouseId,
      branchId: location.branchId,
      batchNo,
      isFoc,
      isActive: true,
      expiryDate: expiryDate
        ? expiryDate
        : {
            gte: new Date(),
          },
    },
  });

  return stock?.id ? stock : null;
};

export const fetchLowStockItems = async (
  date: Date,
): Promise<LowStockResponse[]> => {
  logger.info(`entering::fetchLowStockItems::repository`);
  const lowStockItems = await db.$queryRaw<LowStockResponse[]>`
    SELECT 
        i.id AS itemId,
        i.medicine_name AS itemName,
        COALESCE(b.name, w.name) AS collectionCenterName,
        COALESCE(b.id, w.id) AS ccId,
        SUM(s.quantity) AS availableQty,
        i.min_stock AS minStockQty
    FROM pms_item_stock s
    LEFT JOIN pms_item i ON i.id = s.item_id
    LEFT JOIN pms_branch b ON b.id = s.branch_id
    LEFT JOIN pms_warehouse w ON w.id = s.warehouse_id
    WHERE s.is_active = TRUE
    AND (
      expiry_date IS NULL     
      OR expiry_date >= ${date}
    )
    GROUP BY 
        i.id,
        COALESCE(b.id, w.id)
    HAVING 
        SUM(s.quantity) < i.min_stock
`;

  logger.info(`exiting::fetchLowStockItems::repository`);
  return lowStockItems;
};

export const fetchExpiredItems = async (
  date: Date,
): Promise<ExpiredItemsResponse[]> => {
  logger.info(`entering::fetchExpiredItems::repository`);

  const expiredItems = await db.$queryRaw<ExpiredItemsResponse[]>`
    SELECT 
        s.item_id AS itemId,
        i.medicine_name AS itemName,
        COALESCE(b.name, w.name) AS collectionCenterName,
        COALESCE(b.id, w.id) AS ccId,
        s.quantity AS quantity,
        s.batch_no AS batchNo,
        s.expiry_date AS expiryDate,
        CASE WHEN s.is_foc = 1 THEN 'YES' ELSE 'NO' END AS isFoc
    FROM pms_item_stock s
    LEFT JOIN pms_item i ON i.id = s.item_id
    LEFT JOIN pms_branch b ON b.id = s.branch_id
    LEFT JOIN pms_warehouse w ON w.id = s.warehouse_id
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
        i.medicine_name AS itemName,
        COALESCE(b.name, w.name) AS collectionCenterName,
        COALESCE(b.id, w.id) AS ccId,
        s.quantity AS quantity,
        s.batch_no AS batchNo,
        s.expiry_date AS expiryDate,
        CASE WHEN s.is_foc = 1 THEN 'YES' ELSE 'NO' END AS isFoc
    FROM pms_item_stock s
    LEFT JOIN pms_item i ON i.id = s.item_id
    LEFT JOIN pms_branch b ON b.id = s.branch_id
    LEFT JOIN pms_warehouse w ON w.id = s.warehouse_id
    WHERE s.is_active = TRUE
    AND (
      expiry_date IS NOT NULL     
      AND expiry_date <= DATE_ADD(${date}, INTERVAL ${expiry} MONTH)
    ) 
`;

  logger.info(`exiting::fetchExpiringItems::repository`);
  return { data: expiredItems, expiryInMonth: expiry };
};

export const updateBatchExpiry = async (input: updateBatchExpiryInput) => {
  logger.info(`entering::updateBatchExpiry::repository`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(async (tx) => {
    // update those non overlapping expiry
    await tx.pmsItemStock.updateMany({
      where: {
        id: {
          in: input.updateExpIds,
        },
      },
      data: {
        expiryDate: input.newExp,
        updatedBy: currentUser,
      },
    });
    // Audit for those non overlapping expiryDate
    await tx.pmsItemStockAudit.createMany({
      data: input.updateExpIds.map((id) => ({
        action: Action.UPDATE,
        itemStockId: id,
        operation: PmsOperation.EXPIRY_UPDATE,
        createdBy: currentUser,
        quantity: 0,
      })),
    });

    // Transfer For overlapping stock
    for (const transfer of input.transferableStock) {
      await transferStock(tx, transfer);
    }
  });

  logger.info(`exiting::updateBatchExpiry::repository`);
};

const transferStock = async (
  tx: Prisma.TransactionClient,
  input: TransferableStockInp,
) => {
  logger.info(`entering::transferStock::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await subItemStock(
    tx,
    {
      itemId: input.fromStock.itemId,
      quantity: input.fromStock.quantity,
      batchNo: input.fromStock.batchNo,
      branchId: input.fromStock.branchId ?? undefined,
      expiryDate: input.fromStock.expiryDate,
      isFoc: input.fromStock.isFoc,
      warehouseId: input.fromStock.warehouseId ?? undefined,
    },
    {
      operation: "EXPIRY_UPDATE",
      createdBy: currentUser,
      refDate: new Date(),
    },
  );

  await addItemStock(
    tx,
    {
      itemId: input.toStock.itemId,
      quantity: input.fromStock.quantity,
      batchNo: input.toStock.batchNo,
      branchId: input.toStock.branchId ?? undefined,
      expiryDate: input.toStock.expiryDate,
      isFoc: input.toStock.isFoc,
      warehouseId: input.toStock.warehouseId ?? undefined,
    },
    {
      operation: "EXPIRY_UPDATE",
      createdBy: currentUser,
      refDate: new Date(),
    },
  );

  await tx.pmsItemStock.update({
    where: {
      id: input.fromStock.id,
    },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
    },
  });

  logger.info(`exiting::transferStock::repository`);
};

export const getStocksByIds = async (
  ids: number[],
): Promise<PmsItemStock[]> => {
  logger.info(`entering::getStocksByIds::repository`);
  return await db.pmsItemStock.findMany({
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
  warehouseId?: number;
  branchId?: number;
  notInIds?: number[];
}) => {
  logger.info(`entering::getStockInfo::repository`);
  return await db.pmsItemStock.findFirst({
    where: {
      itemId: input.itemId,
      batchNo: input.batchNo,
      expiryDate: input.expiryDate,
      isFoc: input.isFoc,
      warehouseId: input.warehouseId,
      branchId: input.branchId,
      id: input.notInIds
        ? {
            notIn: input.notInIds,
          }
        : undefined,
      isActive: true,
    },
  });
};
