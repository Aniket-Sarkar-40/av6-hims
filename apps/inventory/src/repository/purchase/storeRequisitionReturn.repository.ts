import { uinServiceFactory } from "@/config/core.config.js";
import {
  addInTransitStock,
  subInTransitStock,
} from "../inTransitStock/inTransitStock.repository.js";
import { addItemStock, subItemStock } from "../stock/stock.repository.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  GetStoreRequisitionReturnResponse,
  ItemBatch,
  RejectStoreRequisitionReturnInput,
  ReturnItem,
} from "@/types/purchase/storeRequisitionReturn.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { InvUinShortCode } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { StoreRequisitionReturn } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core-v2";

export const createStoreRequisitionReturnInDb = async (
  input: CreateStoreRequisitionReturnInput
) => {
  logger.info("entering::createStoreRequisitionReturnInDb::repository");

  const omittedSRR = customOmit<
    CreateStoreRequisitionReturnInput,
    "storeReq" | "storeReqReturn" | "id" | "returnItems"
  >(input, ["storeReq", "storeReqReturn", "id", "returnItems"]);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    const srrUin = await uinServiceFactory.generateUIN(InvUinShortCode.SRR);

    const created = await tx.storeRequisitionReturn.create({
      data: {
        ...omittedSRR.rest,
        srrNumber: srrUin,
        createdBy: currentUser,

        storeRequisitionReturnDetails: {
          create: input.returnItems.map((ri) => {
            const omittedReturnItems = customOmit<ReturnItem, "itemBatch">(ri, [
              "itemBatch",
            ]);

            return {
              ...omittedReturnItems.rest,
              createdBy: currentUser,

              requisitionReturnItemDetails: {
                create: ri.itemBatch.map((b) => {
                  const omittedFlags = customOmit<
                    ItemBatch,
                    "isBatch" | "isExpiry"
                  >(b, ["isBatch", "isExpiry"]);
                  return {
                    ...omittedFlags.rest,
                    batchNo: b.isBatch && b.batchNo ? b.batchNo : null,
                    expiryDate:
                      b.isExpiry && b.expiryDate
                        ? new Date(b.expiryDate)
                        : undefined,
                    itemId: ri.itemId,
                    reqFrom: input.requisitionFrom,
                    ccId: input.ccId,
                    createdBy: currentUser,
                  };
                }),
              },
            };
          }),
        },
      },
      include: {
        storeRequisitionReturnDetails: {
          where: { isActive: true },
          include: {
            requisitionReturnItemDetails: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    logger.info("exiting::createStoreRequisitionReturnInDb::repository");
    return created;
  });
};

export const updateStoreRequisitionReturnInDb = async (
  input: CreateStoreRequisitionReturnInput
) => {
  logger.info("entering::updateStoreRequisitionReturnInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    const omittedSRR = customOmit<
      CreateStoreRequisitionReturnInput,
      "storeReq" | "storeReqReturn" | "id" | "returnItems"
    >(input, ["storeReq", "storeReqReturn", "id", "returnItems"]);

    const id = input.id;
    const storeRequisitionReturnData = omittedSRR.rest;
    const existing = input.storeReqReturn?.storeRequisitionReturnDetails || [];

    if (!id) {
      throw new Error("Cannot update a store requisition return without an id");
    }

    const detailIds = existing.map((d) => d.id);

    if (detailIds.length) {
      await tx.requisitionReturnItemDetails.updateMany({
        where: {
          storeRequisitionReturnDetailsId: { in: detailIds },
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser,
          isActive: false,
        },
      });

      await tx.storeRequisitionReturnDetails.updateMany({
        where: {
          id: { in: detailIds },
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser,
          isActive: false,
        },
      });
    }

    const updated = await tx.storeRequisitionReturn.update({
      where: { id },
      data: {
        ...storeRequisitionReturnData,
        updatedBy: currentUser,

        storeRequisitionReturnDetails: {
          create: input.returnItems.map((ri) => {
            const omittedReturnItems = customOmit<ReturnItem, "itemBatch">(ri, [
              "itemBatch",
            ]);

            return {
              ...omittedReturnItems.rest,
              createdBy: currentUser,

              requisitionReturnItemDetails: {
                create: ri.itemBatch.map((b) => {
                  const omittedFlags = customOmit<
                    ItemBatch,
                    "isBatch" | "isExpiry"
                  >(b, ["isBatch", "isExpiry"]);
                  return {
                    ...omittedFlags.rest,
                    batchNo: b.isBatch ? b.batchNo ?? null : null,
                    expiryDate:
                      b.isExpiry && b.expiryDate
                        ? new Date(b.expiryDate)
                        : undefined,
                    itemId: ri.itemId,
                    reqFrom: input.requisitionFrom,
                    ccId: input.ccId,
                    createdBy: currentUser,
                  };
                }),
              },
            };
          }),
        },
      },
      include: {
        storeRequisitionReturnDetails: {
          where: { isActive: true },
          include: {
            requisitionReturnItemDetails: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    logger.info("exiting::updateStoreRequisitionReturnInDb::repository");
    return updated;
  });
};

export const getStoreRequisitionReturnByIdFromDb = async (
  id: number
): Promise<GetStoreRequisitionReturnResponse | null> => {
  logger.info(
    `entering::getStoreRequisitionReturnByIdFromDb::repository id=${id}`
  );

  const storeReqReturn = await db.storeRequisitionReturn.findFirst({
    where: { id, isActive: true },
    include: {
      storeRequisitionReturnDetails: {
        where: { isActive: true },
        include: {
          requisitionReturnItemDetails: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  logger.info(
    `exiting::getStoreRequisitionReturnByIdFromDb::repository id=${id}`
  );
  return storeReqReturn;
};

export const getAllStoreRequisitionReturnByFromDb = async (): Promise<
  GetStoreRequisitionReturnResponse[]
> => {
  logger.info(`entering::getAllStoreRequisitionReturnByFromDb::repository`);

  const storeReqReturns = await db.storeRequisitionReturn.findMany({
    where: { isActive: true },
    include: {
      storeRequisitionReturnDetails: {
        where: { isActive: true },
        include: {
          requisitionReturnItemDetails: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  logger.info(`exiting::getAllStoreRequisitionReturnByFromDb::repository`);
  return storeReqReturns;
};

export const getPendingSRRFromSRId = async (
  storeRequisitionId: number
): Promise<StoreRequisitionReturn[]> => {
  logger.info(
    `entering::getPendingSRRFromSRId::repository storeRequisitionId=${storeRequisitionId}`
  );

  const storeReqReturns = await db.storeRequisitionReturn.findMany({
    where: {
      storeRequisitionId,
      isActive: true,
      returnStatus: { in: ["Pending", "Partially_Approved"] },
    },
  });

  logger.info(
    `exiting::getPendingSRRFromSRId::repository storeRequisitionId=${storeRequisitionId}`
  );
  return storeReqReturns;
};

export const deleteStoreRequisitionReturnFromDb = async (id: number) => {
  logger.info(
    `entering::deleteStoreRequisitionReturnFromDb::repository id=${id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(async (tx) => {
    await tx.storeRequisitionReturn.update({
      where: { id },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),

        storeRequisitionReturnDetails: {
          updateMany: {
            where: { storeRequisitionReturnId: id },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
        },
      },
    });

    await tx.requisitionReturnItemDetails.updateMany({
      where: {
        storeRequisitionReturnDetails: {
          storeRequisitionReturnId: id,
        },
      },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });
  });

  logger.info(
    `exiting::deleteStoreRequisitionReturnFromDb::repository id=${id}`
  );
};

export const rejectStoreRequisitionReturn = async (
  inp: RejectStoreRequisitionReturnInput
) => {
  logger.info(
    `entering::rejectStoreRequisitionReturn::repository id=${inp.id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.storeRequisitionReturn.update({
    where: { id: inp.id },
    data: {
      returnStatus: "Reject",
      rejectAt: new Date(),
      rejectBy: currentUser,
    },
  });

  logger.info(`exiting::rejectStoreRequisitionReturn::repository id=${inp.id}`);
};

export const approveStoreRequisitionReturn = async (
  inp: ApproveStoreReqReturnInput
) => {
  logger.info(
    `entering::approveStoreRequisitionReturn::repository id=${inp.id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.storeRequisitionReturn.update({
      where: { id: inp.id },
      data: {
        returnStatus: inp.returnStatus || "Approved",
        approvedAt: now,
        approvedBy: currentUser,

        storeRequisitionReturnDetails: {
          update: inp.returnItems.map((det) => ({
            where: { id: det.id },
            data: {
              requestedReturnQty: det.requestedReturnQty,
              updatedBy: currentUser,

              requisitionReturnItemDetails: {
                update: det.itemBatch.map((item) => ({
                  where: { id: item.id },
                  data: {
                    returnQty: item.returnQty,
                    comment: item.comment,
                    updatedBy: currentUser,
                  },
                })),
              },
            },
          })),
        },
      },
    });

    for (const det of inp.returnItems) {
      const srrDetail = inp.storeReqReturn.storeRequisitionReturnDetails.find(
        (d) => d.id === det.id
      );

      for (const item of det.itemBatch) {
        const rrItem = srrDetail?.requisitionReturnItemDetails.find(
          (r) => r.id === item.id
        );

        if (rrItem?.requisitionItemDetailsId) {
          await tx.requisitionInvItemDetails.update({
            where: { id: rrItem.requisitionItemDetailsId },
            data: {
              returnedQty: { increment: item.returnQty },
              updatedBy: currentUser,
            },
          });
        }

        await subItemStock(
          tx,
          {
            itemId: det.itemId,
            quantity: item.returnQty,
            batchNo: item.batchNo,
            userId: inp.storeReqReturn.requisitionFrom,
            expiryDate: item.expiryDate,
            isFoc: item.isFoc,
          },
          {
            operation: "STORE_REQUISITION_RETURN",
            refApprovedBy: currentUser,
            refDate: now,
            refDetailsId: det.id,
            refId: inp.id,
            refNo: inp.storeReqReturn.srrNumber,
            refApprovedAt: now,
          }
        );

        await addInTransitStock(
          tx,
          {
            itemId: det.itemId,
            quantity: item.returnQty,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            isFoc: item.isFoc,
            fromId: inp.storeReqReturn.ccId,
            toId: inp.storeReqReturn.requisitionFrom,
          },
          {
            operation: "STORE_REQUISITION_RETURN",
            refApprovedBy: currentUser,
            refDate: now,
            refDetailsId: det.id,
            refId: inp.id,
            refNo: inp.storeReqReturn.srrNumber,
            refApprovedAt: now,
          }
        );
      }

      if (srrDetail?.storeRequisitionDetailsId) {
        await tx.invStoreRequisitionDetails.update({
          where: { id: srrDetail.storeRequisitionDetailsId },
          data: {
            returnedQuantity: { increment: det.requestedReturnQty },
            updatedBy: currentUser,
          },
        });
      }
    }

    logger.info(
      `exiting::approveStoreRequisitionReturn::repository id=${inp.id}`
    );
  });
};

export const acknowledgeStoreRequisitionReturn = async (
  inp: AcknowledgeRequisitionReturn
) => {
  logger.info(
    `entering::acknowledgeStoreRequisitionReturn::repository id=${inp.id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const now = new Date();

  await db.$transaction(async (tx) => {
    for (const detail of inp.acknowledgeItems) {
      for (const item of detail.itemBatch) {
        await tx.requisitionReturnItemDetails.update({
          where: { id: item.id },
          data: {
            acknowledgedQty: { increment: item.acknowledgedQty },
            isCompleted: item.isCompleted,
            updatedBy: currentUser,
          },
        });

        await addItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: item.acknowledgedQty,
            batchNo: item.batchNo,
            userId: inp.storeReqReturn.requisitionFrom,
            expiryDate: item.expiryDate,
            isFoc: item.isFoc,
          },
          {
            operation: "STORE_REQUISITION_RETURN",
            refDate: now,
            refDetailsId: detail.id,
            refId: inp.id,
            refNo: inp.storeReqReturn.srrNumber,
          }
        );

        await subInTransitStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: item.acknowledgedQty,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            isFoc: item.isFoc,
            fromId: inp.storeReqReturn.ccId,
            toId: inp.storeReqReturn.requisitionFrom,
          },
          {
            operation: "STORE_REQUISITION_RETURN",
            refDate: now,
            refDetailsId: detail.id,
            refId: inp.id,
            refNo: inp.storeReqReturn.srrNumber,
          }
        );
      }

      await tx.storeRequisitionReturnDetails.update({
        where: { id: detail.id },
        data: {
          acknowledgedReturnQty: { increment: detail.acknowledgedReturnQty },
          updatedBy: currentUser,
        },
      });
    }

    await tx.storeRequisitionReturn.update({
      where: { id: inp.id },
      data: {
        ackStatus: inp.ackStatus,
        acknowledgementBy: currentUser,
        acknowledgementAt: now,
      },
    });
  });

  logger.info(
    `exiting::acknowledgeStoreRequisitionReturn::repository id=${inp.id}`
  );
};
