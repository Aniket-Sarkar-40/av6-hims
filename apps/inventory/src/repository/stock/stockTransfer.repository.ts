import { uinServiceFactory } from "@/config/core.config.js";
import {
  CreateItemStockTransferInput,
  StockTransferAcknowledgeInput,
  StockTransferSearchInput,
  StockTransferUpdate,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";

import {
  addInTransitStock,
  subInTransitStock,
} from "../inTransitStock/inTransitStock.repository.js";
import { addItemStock, subItemStock } from "./stock.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { customOmit } from "av6-utils";
import { db } from "@repo/db";
import {
  InvOperation,
  InvUinShortCode,
  ST_RETURN_STATUS,
  ST_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { API_TIMEOUT } from "@repo/shared";
import { Prisma } from "@repo/db/generated/prisma/client";

export const createStockTransfer = async (
  input: CreateItemStockTransferInput
) => {
  logger.info("entering::createStockTransfer::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedStockTransfer = customOmit<
    CreateItemStockTransferInput,
    "stockTransferDetails"
  >(input, ["stockTransferDetails"]);

  const created = await db.$transaction(
    async (tx) => {
      const strUin = await uinServiceFactory.generateUIN(InvUinShortCode.ST_TR);

      return tx.invStockTransfer.create({
        data: {
          ...omittedStockTransfer.rest,
          stockTransferNumber: strUin,
          date: new Date(input.date),
          createdBy: currentUser,
          stockTransferDetails: {
            create: input.stockTransferDetails.map((it) => ({
              ...it,
              expiryDate: it.expiryDate ? new Date(it.expiryDate) : null,
              createdBy: currentUser,
            })),
          },
        },
        include: { stockTransferDetails: true },
      });
    },
    { timeout: API_TIMEOUT }
  );

  return created;
};

export const updateStockTransfer = async (
  input: UpdateItemStockTransferInput
) => {
  logger.info("entering::createStockTransfer::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omitted = customOmit(input, [
    "stockTransfer",
    "stockTransferDetails",
    "id",
  ]);

  const { stockTransferDetails, stockTransfer } = omitted.omitted;

  const toUpdate = stockTransferDetails.filter((d) => typeof d.id === "number");
  const toCreate = stockTransferDetails.filter((d) => typeof d.id !== "number");
  const toDelete = stockTransfer.stockTransferDetails.filter(
    (d) => !stockTransferDetails.some((item) => item.id === d.id)
  );

  return await db.$transaction(
    async (tx) => {
      const updatedStockTransfer = await tx.invStockTransfer.update({
        where: { id: input.id },
        data: {
          ...omitted.rest,
          date: new Date(input.date),
          updatedBy: currentUser,
          stockTransferDetails: {
            update: toUpdate.map((item) => ({
              where: {
                id: item.id,
              },
              data: {
                itemId: item.itemId,
                batchNo: item.batchNo,
                isFoc: item.isFoc,
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
                quantity: item.quantity,
                updatedBy: currentUser,
              },
            })),
            create: toCreate.map((item) => ({
              itemId: item.itemId,
              batchNo: item.batchNo,
              isFoc: item.isFoc,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              quantity: item.quantity,
              createdBy: currentUser,
            })),
            updateMany: {
              where: {
                id: {
                  in: toDelete.map((d) => d.id),
                },
              },
              data: {
                isActive: false,
                deletedAt: new Date(),
                deletedBy: currentUser,
              },
            },
          },
        },
        include: {
          stockTransferDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      return updatedStockTransfer;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const deleteStockTransfer = async (id: number) => {
  logger.info(`entering::deleteStockTransfer::repository id=${id}`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.invStockTransfer.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      stockTransferDetails: {
        updateMany: {
          where: { stId: id },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });
};

export const approveStockTransfer = async (input: StockTransferUpdate) => {
  logger.info("entering::approveStockTransfer::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const approvedStockTransfer = await tx.invStockTransfer.update({
        where: {
          id: input.id,
          isActive: true,
        },
        data: {
          status: ST_STATUS.DISPATCHED,
          updatedBy: currentUser,
          updatedAt: new Date(),
          approvedBy: currentUser,
          approvedAt: new Date(),
        },
        include: { stockTransferDetails: true },
      });
      //Stock Transfer Operation
      for (const detail of approvedStockTransfer.stockTransferDetails) {
        const auditDetails = {
          operation: InvOperation.STOCK_TRANSFER,
          refId: approvedStockTransfer.id,
          refDetailsId: detail.id,
          refNo: approvedStockTransfer.stockTransferNumber,
          refDate: approvedStockTransfer.date,
          refApprovedBy: currentUser,
          refApprovedAt: new Date(),
        };
        // Freez stock from sending branch
        await subItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: detail.quantity,
            batchNo: detail.batchNo,
            ccId: approvedStockTransfer.fromId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
        // Add Stock into in-transit stock
        await addInTransitStock(
          tx,
          {
            fromCcId: approvedStockTransfer.fromId,
            toCcId: approvedStockTransfer.toId,
            itemId: detail.itemId,
            quantity: detail.quantity,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
      }

      return approvedStockTransfer;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const acknowledgeStockTransfer = async (
  input: StockTransferAcknowledgeInput
) => {
  logger.info("entering::acknowledgeStockTransfer::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.$transaction(
    async (tx) => {
      const acknowledgedStock = await tx.invStockTransfer.update({
        where: {
          id: input.id,
          isActive: true,
        },
        data: {
          status: input.status,
          returnStatus: input.returnStatus,
          updatedBy: currentUser,
          updatedAt: new Date(),
          acknowledgedBy: currentUser,
          acknowledgedAt: new Date(),
          stockTransferDetails: {
            update: input.stockTransferDetails.map((item) => ({
              where: {
                id: item.id,
              },
              data: {
                acknowledgedQuantity: item.acknowledgedQuantity,
                returnQuantity: item.returnQuantity ?? 0,
                updatedBy: currentUser,
              },
            })),
          },
        },
        include: { stockTransferDetails: true },
      });
      //Stock Transfer Operation
      for (const detail of acknowledgedStock.stockTransferDetails) {
        const auditDetails = {
          operation: InvOperation.STOCK_TRANSFER,
          refId: acknowledgedStock.id,
          refDetailsId: detail.id,
          refNo: acknowledgedStock.stockTransferNumber,
          refDate: acknowledgedStock.date,
          refApprovedBy: currentUser,
          refApprovedAt: new Date(),
        };
        // Add stock to receiving branch
        await addItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: detail.acknowledgedQuantity,
            batchNo: detail.batchNo,
            ccId: acknowledgedStock.toId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
        // Subtract Stock from in-transit stock
        await subInTransitStock(
          tx,
          {
            fromCcId: acknowledgedStock.fromId,
            toCcId: acknowledgedStock.toId,
            itemId: detail.itemId,
            quantity: detail.acknowledgedQuantity,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
      }

      return acknowledgedStock;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const getStockTransferById = async (id: number) => {
  logger.info("entering::getStockTransferById::repository");
  return db.invStockTransfer.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      stockTransferDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getAllStockTransfer = async () => {
  logger.info("entering::getAllStockTransfer::repository");
  return db.invStockTransfer.findMany({
    where: {
      isActive: true,
    },
    include: { stockTransferDetails: true },
  });
};

export const searchStockTransfers = async (
  params: StockTransferSearchInput
) => {
  logger.info("entering::searchStockTransfers::repository");
  const {
    pageNo,
    pageSize,
    searchText = "",
    sortBy = "createdAt",
    sortDir = "ASC",
    startDate,
    endDate,
    status,
    returnStatus,
    ccId,
    staffId,
  } = params;

  const andFilters: Prisma.InvStockTransferWhereInput[] = [];

  if (searchText) {
    andFilters.push({
      stockTransferNumber: {
        contains: searchText,
      },
    });
  }

  if (status) {
    andFilters.push({ status });
  }
  if (returnStatus) {
    andFilters.push({ returnStatus });
  }

  if (staffId) {
    andFilters.push({ staffId });
  }

  if (startDate) {
    andFilters.push({
      date: { gte: startDate },
    });
  }

  if (endDate) {
    andFilters.push({
      date: { lte: endDate },
    });
  }

  if (ccId) {
    andFilters.push({
      OR: [{ ccId }, { fromId: ccId }, { toId: ccId }],
    });
  }

  const where: Prisma.InvStockTransferWhereInput =
    andFilters.length > 0 ? { AND: andFilters } : {};

  const [data, total] = await Promise.all([
    db.invStockTransfer.findMany({
      where,
      orderBy: {
        [sortBy]: sortDir.toLowerCase() as Prisma.SortOrder,
      },
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      include: {
        stockTransferDetails: true,
      },
    }),
    db.invStockTransfer.count({ where }),
  ]);

  logger.info("exiting::searchStockTransfers::repository");
  return { data, total };
};

export const approveReturnStockTransfer = async (
  input: StockTransferUpdate
) => {
  logger.info("entering::approveReturnStockTransfer::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const approvedReturnStockTransfer = await tx.invStockTransfer.update({
        where: {
          id: input.id,
          isActive: true,
        },
        data: {
          returnStatus: ST_RETURN_STATUS.RETURNED,
          updatedBy: currentUser,
          updatedAt: new Date(),
          returnApprovedBy: currentUser,
          returnApprovedAt: new Date(),
        },
        include: { stockTransferDetails: true },
      });
      //Stock Transfer Operation
      for (const detail of approvedReturnStockTransfer.stockTransferDetails) {
        const auditDetails = {
          operation: InvOperation.STOCK_TRANSFER,
          refId: approvedReturnStockTransfer.id,
          refDetailsId: detail.id,
          refNo: approvedReturnStockTransfer.stockTransferNumber,
          refDate: approvedReturnStockTransfer.date,
          refApprovedBy: currentUser,
          refApprovedAt: new Date(),
        };
        // Add stock to receiving branch
        await addItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: detail.returnQuantity,
            batchNo: detail.batchNo,
            ccId: approvedReturnStockTransfer.fromId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
        // Subtract Stock from in-transit stock
        await subInTransitStock(
          tx,
          {
            fromCcId: approvedReturnStockTransfer.fromId,
            toCcId: approvedReturnStockTransfer.toId,
            itemId: detail.itemId,
            quantity: detail.returnQuantity,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
      }

      return approvedReturnStockTransfer;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};
