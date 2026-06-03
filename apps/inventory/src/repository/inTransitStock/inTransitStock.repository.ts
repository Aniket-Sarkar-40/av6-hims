import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateInTransitStockInput,
  inTransitStockAudit,
} from "@/types/inTransitStock/inTransitStock.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Action, Prisma } from "@repo/db/generated/prisma/client";

type Tx = Prisma.TransactionClient;
export const addInTransitStock = async (
  tx: Tx,
  data: CreateInTransitStockInput,
  detail: inTransitStockAudit
): Promise<void> => {
  logger.info(`entering::addInTransitStock::repository`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const isStockExists = await tx.invInTransitStock.findFirst({
    where: {
      fromCcId: data.fromCcId ?? null,
      toCcId: data.toCcId ?? null,
      userId: data.userId ?? null,
      itemId: data.itemId,
      batchNo: data.batchNo,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isFoc: data.isFoc,
      isActive: true,
    },
  });
  let inTransitstockId: number = isStockExists ? isStockExists.id : 0;
  if (isStockExists) {
    await tx.invInTransitStock.update({
      where: {
        id: isStockExists.id,
        isActive: true,
      },
      data: {
        quantity: isStockExists.quantity + (data.quantity ?? 0),
        updatedBy: currentUser,
      },
    });
  } else {
    const created = await tx.invInTransitStock.create({
      data: {
        fromCcId: data.fromCcId ?? null,
        toCcId: data.toCcId ?? null,
        userId: data.userId ?? null,
        itemId: data.itemId,
        quantity: data.quantity,
        batchNo: data.batchNo ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isFoc: data.isFoc,
        createdBy: currentUser,
      },
    });

    inTransitstockId = created.id;
  }

  await tx.invInTransitStockAudit.create({
    data: {
      inTransitStockId: inTransitstockId,
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

export const subInTransitStock = async (
  tx: Tx,
  data: CreateInTransitStockInput,
  detail: inTransitStockAudit
): Promise<void> => {
  logger.info(`entering::subInTransitStock::repository`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const isStockExists = await tx.invInTransitStock.findFirst({
    where: {
      fromCcId: data.fromCcId ?? null,
      toCcId: data.toCcId ?? null,
      userId: data.userId ?? null,
      itemId: data.itemId,
      batchNo: data.batchNo ?? null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isFoc: data.isFoc,
      isActive: true,
    },
  });

  if (!isStockExists || isStockExists.quantity < (data.quantity ?? 0)) {
    throw new ErrorHandler(400, "Insufficient stock to consume");
  }

  await tx.invInTransitStock.update({
    where: {
      id: isStockExists.id,
      isActive: true,
    },
    data: {
      quantity: isStockExists.quantity - (data.quantity ?? 0),
      updatedBy: currentUser,
    },
  });

  await tx.invInTransitStockAudit.create({
    data: {
      inTransitStockId: isStockExists.id,
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

export const getInTransitStockById = async (id: number) => {
  logger.info(`entering::getInTransitStockById::repository`);

  return db.invInTransitStock.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getAllInTransitStock = async () => {
  logger.info(`entering::getAllInTransitStock::repository`);

  return db.invInTransitStock.findMany({
    where: {
      isActive: true,
    },
  });
};
