import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateStockAjustmentInput,
  StockAdjustmentResponse,
  UpdateStockAjustmentInput,
} from "@/types/stock/stockAdjustment.js";
import { logger } from "@repo/platform/logging/logger.js";
import { addItemStock, subItemStock } from "./stock.repository.js";
import { customOmit } from "av6-core-v2";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  Action,
  PmsOperation,
  PmsUinShortCode,
  STOCK_ADJUSTMENT_STATUS,
} from "@repo/db/generated/prisma/enums.js";

export const createStockAdjustmentInDb = async (
  input: CreateStockAjustmentInput,
): Promise<boolean> => {
  logger.info("entering::createStockAdjustmentInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedInput = customOmit<
    CreateStockAjustmentInput,
    "stockAdjustmentDetails" | "isAvailQtyCheck"
  >(input, ["stockAdjustmentDetails", "isAvailQtyCheck"]);
  const { stockAdjustmentDetails } = input;
  const refNo = await uinServiceFactory.generateUIN(PmsUinShortCode.STAJ);
  await db.$transaction(async (tx) => {
    const createdStockAdjustment = await tx.stockAdjustment.create({
      data: {
        ...omittedInput.rest,
        refNo,
        createdBy: currentUser,
        stockAdjustmentDetails: {
          create: stockAdjustmentDetails.map((d) => ({
            ...d,
            expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
            createdBy: currentUser,
          })),
        },
      },
      include: {
        stockAdjustmentDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    /*---------------------Stock Adjustment ------------------------*/
    if (input.status === STOCK_ADJUSTMENT_STATUS.COMPLETED) {
      for (const detail of createdStockAdjustment.stockAdjustmentDetails) {
        if (detail.adjustType === Action.ADDITION) {
          await addItemStock(
            tx,
            {
              itemId: detail.itemId,
              warehouseId: input.warehouseId ?? undefined,
              branchId: input.branchId ?? undefined,
              quantity: detail.quantity,
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate
                ? new Date(detail.expiryDate)
                : undefined,
              isFoc: detail.isFoc ?? undefined,
            },
            {
              operation: PmsOperation.STOCK_ADJUSTMENT,
              refId: createdStockAdjustment.id,
              refDetailsId: detail.id,
              refNo: createdStockAdjustment.refNo,
              refDate: createdStockAdjustment.date,
            },
          );
        } else {
          await subItemStock(
            tx,
            {
              itemId: detail.itemId,
              warehouseId: input.warehouseId ?? undefined,
              branchId: input.branchId ?? undefined,
              quantity: detail.quantity,
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate
                ? new Date(detail.expiryDate)
                : undefined,
              isFoc: detail.isFoc ?? undefined,
            },
            {
              operation: PmsOperation.STOCK_ADJUSTMENT,
              refId: createdStockAdjustment.id,
              refDetailsId: detail.id,
              refNo: createdStockAdjustment.refNo,
              refDate: createdStockAdjustment.date,
            },
          );
        }
      }
    }
    /*---------------------------------------------------------------------*/
  });
  logger.info("exiting::createStockAdjustmentInDb::repository");
  return true;
};

export const updateStockAdjustmentInDb = async (
  input: UpdateStockAjustmentInput,
): Promise<boolean> => {
  logger.info("entering::updateStockAdjustmentInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedInput = customOmit<
    UpdateStockAjustmentInput,
    "stockAdjustmentDetails" | "isAvailQtyCheck" | "id" | "existing"
  >(input, ["stockAdjustmentDetails", "isAvailQtyCheck", "id", "existing"]);

  const { stockAdjustmentDetails } = input;

  const toCreate = stockAdjustmentDetails.filter(
    (d) => typeof d.id !== "number",
  );
  const toUpdate = stockAdjustmentDetails.filter(
    (d) => typeof d.id === "number",
  );
  const toDelete = input.existing.stockAdjustmentDetails
    .filter((d) => !stockAdjustmentDetails.some((item) => item.id === d.id))
    .map((d) => d.id);

  await db.$transaction(async (tx) => {
    const updatedStockAdjustment = await tx.stockAdjustment.update({
      where: { id: input.id },
      data: {
        ...omittedInput.rest,
        updatedBy: currentUser,
        stockAdjustmentDetails: {
          create: toCreate.map((d) => ({
            ...d,
            expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
            createdBy: currentUser,
          })),
          update: toUpdate.map((d) => ({
            where: { id: d.id },
            data: {
              ...customOmit(d, ["id"]).rest,
              expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
              updatedBy: currentUser,
            },
          })),
          updateMany: {
            where: {
              id: { in: toDelete },
            },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
        },
      },
      include: {
        stockAdjustmentDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    /*---------------------Stock Adjustment ------------------------*/
    if (input.status === STOCK_ADJUSTMENT_STATUS.COMPLETED) {
      for (const detail of updatedStockAdjustment.stockAdjustmentDetails) {
        if (detail.adjustType === Action.ADDITION) {
          await addItemStock(
            tx,
            {
              itemId: detail.itemId,
              warehouseId: input.warehouseId ?? undefined,
              branchId: input.branchId ?? undefined,
              quantity: detail.quantity,
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate
                ? new Date(detail.expiryDate)
                : undefined,
              isFoc: detail.isFoc ?? undefined,
            },
            {
              operation: PmsOperation.STOCK_ADJUSTMENT,
              refId: updatedStockAdjustment.id,
              refDetailsId: detail.id,
              refNo: updatedStockAdjustment.refNo,
              refDate: updatedStockAdjustment.date,
            },
          );
        } else {
          await subItemStock(
            tx,
            {
              itemId: detail.itemId,
              warehouseId: input.warehouseId ?? undefined,
              branchId: input.branchId ?? undefined,
              quantity: detail.quantity,
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate
                ? new Date(detail.expiryDate)
                : undefined,
              isFoc: detail.isFoc ?? undefined,
            },
            {
              operation: PmsOperation.STOCK_ADJUSTMENT,
              refId: updatedStockAdjustment.id,
              refDetailsId: detail.id,
              refNo: updatedStockAdjustment.refNo,
              refDate: updatedStockAdjustment.date,
            },
          );
        }
      }
    }
    /*---------------------------------------------------------------------*/
  });

  logger.info("exiting::updateStockAdjustmentInDb::repository");
  return true;
};

export const getStockAdjustmentByIdFromDb = async (
  id: number,
): Promise<StockAdjustmentResponse | null> => {
  logger.info("entering::getStockAdjustmentByIdFromDb::repository");
  const record = await db.stockAdjustment.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      stockAdjustmentDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getStockAdjustmentByIdFromDb::repository");
  return record;
};
