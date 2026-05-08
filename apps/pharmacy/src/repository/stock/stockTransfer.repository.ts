import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";
import {
  CreateItemStockTransferInput,
  StockTransferAcknowledgeInput,
  StockTransferSearchInput,
  StockTransferUpdate,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";
import { customOmit } from "av6-core-v2";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  PMS_STR_RETURN_STATUS,
  PMS_STR_STATUS,
  PmsOperation,
  PmsUinShortCode,
} from "@repo/db/generated/prisma/enums.js";
import { addItemStock, subItemStock } from "./stock.repository.js";
import {
  addInTransitStock,
  subInTransitStock,
} from "../inTransitStock/inTransitStock.repository.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { emailConfigService } from "@/services/master/emailConfig.service.js";

export const createStockTransfer = async (
  input: CreateItemStockTransferInput
) => {
  logger.info("entering::createStockTransfer::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedGrn = customOmit<CreateItemStockTransferInput, "warehouse">(
    input,
    ["warehouse"]
  );

  const { from, to, ccId, items, ...rest } = omittedGrn.rest;

  const created = await db.$transaction(
    async (tx) => {
      const strUin = await uinServiceFactory.generateUIN(PmsUinShortCode.STR);

      return tx.pmsStockTransfer.create({
        data: {
          ...rest,
          stockTransferNumber: strUin,
          ccId: ccId.id,
          fromId: from.id,
          toId: to.id,
          date: new Date(),
          status: PMS_STR_STATUS.CREATED,
          createdBy: currentUser,
          stockTransferDetails: {
            create: items.map((it) => ({
              itemId: it.itemId,
              batchNo: it.batchNo ?? "",
              isFoc: it.isFoc,
              expiryDate: new Date(it.expiryDate).toISOString(),
              quantity: it.quantity,
              createdBy: currentUser,
            })),
          },
        },
        include: { stockTransferDetails: true },
      });
    },
    { timeout: API_TIMEOUT }
  );

  const wareHouse = omittedGrn.omitted.warehouse;
  const feature = await featureFlagService.getFeatureFlagByShortCode(
    "STOCK_TRANSFER_NOTIFICATION",
    true
  );
  if (wareHouse?.email && feature?.isEnabled) {
    const emailTemplate = await emailConfigService.getEventEmail();
    // if (emailTemplate && emailTemplate.emailBody && store?.user?.email && feature?.isEnabled) {
    //   sendTemplatedEmail({
    //     template: emailTemplate,
    //     to: [wareHouse.email],
    //     variables: {
    //       name: store.user.userName ?? "User",
    //       companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
    //       message: `Stock Transfer ${created.stockTransferNumber} created.`,
    //       signature: "Aerial View-6 Infotech Pvt. Ltd.",
    //     },
    //   })
    //     .then(() => {
    //       logger.info("Email Sent Successfully.");
    //     })
    //     .catch((e) => logger.error(`Email Failed:: ${e.message} `));
    //   logger.info("Email Sent Successfully.");
    // }

    // TODO: Send notification
  }

  return created;
};

export const updateStockTransfer = async (
  input: UpdateItemStockTransferInput
) => {
  logger.info("entering::createStockTransfer::repository");
  const { items, stockTransfer } = input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = items.filter((d) => typeof d.id === "number");
  const toCreate = items.filter((d) => typeof d.id !== "number");
  const toDelete = stockTransfer.stockTransferDetails.filter(
    (d) => !items.some((item) => item.id === d.id)
  );

  return await db.$transaction(
    async (tx) => {
      const updatedStockTransfer = await tx.pmsStockTransfer.update({
        where: { id: input.id },
        data: {
          staffId: input.staffId,
          ccId: input.ccId.id,
          fromId: input.from.id,
          toId: input.to.id,

          updatedBy: currentUser,
          stockTransferDetails: {
            update: toUpdate.map((item) => ({
              where: {
                id: item.id,
              },
              data: {
                itemId: item.itemId,
                batchNo: item.batchNo ?? "",
                isFoc: item.isFoc,
                expiryDate: new Date(item.expiryDate).toISOString(),
                quantity: item.quantity,
                updatedBy: currentUser,
              },
            })),
            create: toCreate.map((item) => ({
              itemId: item.itemId,
              batchNo: item.batchNo ?? "",
              isFoc: item.isFoc,
              expiryDate: new Date(item.expiryDate).toISOString(),
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

  await db.pmsStockTransfer.update({
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
      const approvedStockTransfer = await tx.pmsStockTransfer.update({
        where: {
          id: input.id,
          isActive: true,
        },
        data: {
          status: PMS_STR_STATUS.DISPATCHED,
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
          operation: PmsOperation.STOCK_TRANSFER,
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
            branchId: approvedStockTransfer.fromId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
        // Add Stock into in-transit stock
        await addInTransitStock(
          tx,
          {
            fromId: approvedStockTransfer.fromId,
            toId: approvedStockTransfer.toId,
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
      const acknowledgedStock = await tx.pmsStockTransfer.update({
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
            update: input.items.map((item) => ({
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
          operation: PmsOperation.STOCK_TRANSFER,
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
            branchId: acknowledgedStock.toId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
        // Subtract Stock from in-transit stock
        await subInTransitStock(
          tx,
          {
            fromId: acknowledgedStock.fromId,
            toId: acknowledgedStock.toId,
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
  return db.pmsStockTransfer.findUnique({
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
  return db.pmsStockTransfer.findMany({
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

  const andFilters: Prisma.PmsStockTransferWhereInput[] = [];

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

  const where: Prisma.PmsStockTransferWhereInput =
    andFilters.length > 0 ? { AND: andFilters } : {};

  const [data, total] = await Promise.all([
    db.pmsStockTransfer.findMany({
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
    db.pmsStockTransfer.count({ where }),
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
      const approvedReturnStockTransfer = await tx.pmsStockTransfer.update({
        where: {
          id: input.id,
          isActive: true,
        },
        data: {
          returnStatus: PMS_STR_RETURN_STATUS.RETURNED,
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
          operation: PmsOperation.STOCK_TRANSFER,
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
            branchId: approvedReturnStockTransfer.fromId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          auditDetails
        );
        // Subtract Stock from in-transit stock
        await subInTransitStock(
          tx,
          {
            fromId: approvedReturnStockTransfer.fromId,
            toId: approvedReturnStockTransfer.toId,
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
