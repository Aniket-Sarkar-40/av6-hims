import { uinServiceFactory } from "@/config/core.config.js";
import {
  addInTransitStock,
  subInTransitStock,
} from "@/repository/inTransitStock/inTransitStock.repository.js";
import {
  addItemStock,
  subItemStock,
} from "@/repository/stock/stock.repository.js";
import {
  AcknowledgeBranchRequisitionReturn,
  ApproveBranchReqReturnInput,
  BranchReturnItem,
  CreateBranchRequisitionReturnInput,
  GetBranchRequisitionReturnResponse,
  RejectBranchRequisitionReturnInput,
} from "@/types/purchase/branchRequisitionReturn.js";
import { db } from "@repo/db/client";
import { BranchRequisitionReturn } from "@repo/db/generated/prisma/client";
import {
  InvOperation,
  InvUinShortCode,
} from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const createBranchRequisitionReturnInDb = async (
  input: CreateBranchRequisitionReturnInput
) => {
  logger.info("entering::createBranchRequisitionReturnInDb::repository");

  const omittedBRR = customOmit<
    CreateBranchRequisitionReturnInput,
    "branchReq" | "branchReqReturn" | "id" | "returnItems"
  >(input, ["branchReq", "branchReqReturn", "id", "returnItems"]);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    const brrUin = await uinServiceFactory.generateUIN(InvUinShortCode.BRR);

    const created = await tx.branchRequisitionReturn.create({
      data: {
        ...omittedBRR.rest,
        brrNumber: brrUin,
        createdBy: currentUser,
        ccId: omittedBRR.omitted.branchReq.ccId,

        branchRequisitionReturnDetails: {
          create: input.returnItems.map((ri) => {
            const omittedReturnItem = customOmit<BranchReturnItem, "itemBatch">(
              ri,
              ["itemBatch"]
            );

            return {
              ...omittedReturnItem.rest,
              createdBy: currentUser,

              branchReturnItemDetails: {
                create: ri.itemBatch.map((b) => ({
                  branchItemDetailsId: b.branchItemDetailsId,
                  returnQty: b.returnQty,
                  batchNo: b.isBatch && b.batchNo ? b.batchNo : null,
                  expiryDate:
                    b.isExpiry && b.expiryDate ? new Date(b.expiryDate) : null,
                  isFoc: b.isFoc,
                  comment: b.comment ?? null,
                  itemId: ri.itemId,
                  branchId: input.branchId,
                  ccId: omittedBRR.omitted.branchReq.ccId,
                  createdBy: currentUser,
                })),
              },
            };
          }),
        },
      },
    });

    logger.info("exiting::createBranchRequisitionReturnInDb::repository");
    return created;
  });
};

export const updateBranchRequisitionReturnInDb = async (
  input: CreateBranchRequisitionReturnInput
) => {
  logger.info("entering::updateBranchRequisitionReturnInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    const omittedBRR = customOmit<
      CreateBranchRequisitionReturnInput,
      "branchReq" | "branchReqReturn" | "id" | "returnItems"
    >(input, ["branchReq", "branchReqReturn", "id", "returnItems"]);

    const id = input.id;
    const existing =
      input.branchReqReturn?.branchRequisitionReturnDetails || [];

    const detailIds = existing.map((d) => d.id);

    if (detailIds.length) {
      await tx.branchReturnItemDetails.updateMany({
        where: {
          branchRequisitionReturnDetailsId: { in: detailIds },
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser,
          isActive: false,
        },
      });

      await tx.branchRequisitionReturnDetails.updateMany({
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

    const updated = await tx.branchRequisitionReturn.update({
      where: { id },
      data: {
        ...omittedBRR.rest,
        updatedBy: currentUser,

        branchRequisitionReturnDetails: {
          create: input.returnItems.map((ri) => {
            const omittedReturnItem = customOmit<BranchReturnItem, "itemBatch">(
              ri,
              ["itemBatch"]
            );

            return {
              ...omittedReturnItem.rest,
              createdBy: currentUser,

              branchReturnItemDetails: {
                create: ri.itemBatch.map((b) => ({
                  branchItemDetailsId: b.branchItemDetailsId,
                  returnQty: b.returnQty,
                  batchNo: b.isBatch && b.batchNo ? b.batchNo : null,
                  expiryDate:
                    b.isExpiry && b.expiryDate ? new Date(b.expiryDate) : null,
                  isFoc: b.isFoc,
                  comment: b.comment ?? null,
                  itemId: ri.itemId,
                  branchId: input.branchId,
                  ccId: omittedBRR.omitted.branchReq.ccId,
                  createdBy: currentUser,
                })),
              },
            };
          }),
        },
      },
    });

    logger.info("exiting::updateBranchRequisitionReturnInDb::repository");
    return updated;
  });
};

export const getBranchRequisitionReturnByIdFromDb = async (
  id: number
): Promise<GetBranchRequisitionReturnResponse | null> => {
  logger.info(
    `entering::getBranchRequisitionReturnByIdFromDb::repository id=${id}`
  );

  const brr = await db.branchRequisitionReturn.findFirst({
    where: { id, isActive: true },
    include: {
      branchRequisitionReturnDetails: {
        where: { isActive: true },
        include: {
          branchReturnItemDetails: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  logger.info(
    `exiting::getBranchRequisitionReturnByIdFromDb::repository id=${id}`
  );
  return brr;
};

export const getAllBranchRequisitionReturnFromDb = async (): Promise<
  GetBranchRequisitionReturnResponse[]
> => {
  logger.info(`entering::getAllBranchRequisitionReturnFromDb::repository`);

  const brrs = await db.branchRequisitionReturn.findMany({
    where: { isActive: true },
    include: {
      branchRequisitionReturnDetails: {
        where: { isActive: true },
        include: {
          branchReturnItemDetails: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  logger.info(`exiting::getAllBranchRequisitionReturnFromDb::repository`);
  return brrs;
};

export const getPendingBRRFromBRId = async (
  branchRequisitionId: number
): Promise<BranchRequisitionReturn[]> => {
  logger.info(
    `entering::getPendingBRRFromBRId::repository branchRequisitionId=${branchRequisitionId}`
  );

  const brrs = await db.branchRequisitionReturn.findMany({
    where: {
      branchRequisitionId,
      isActive: true,
      returnStatus: { in: ["Pending", "Partially_Approved"] },
    },
  });

  logger.info(
    `exiting::getPendingBRRFromBRId::repository branchRequisitionId=${branchRequisitionId}`
  );
  return brrs;
};

export const deleteBranchRequisitionReturnFromDb = async (id: number) => {
  logger.info(
    `entering::deleteBranchRequisitionReturnFromDb::repository id=${id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(async (tx) => {
    await tx.branchRequisitionReturn.update({
      where: { id, isActive: true },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),

        branchRequisitionReturnDetails: {
          updateMany: {
            where: { branchRequisitionReturnId: id, isActive: true },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
        },
      },
    });

    await tx.branchReturnItemDetails.updateMany({
      where: {
        branchRequisitionReturnDetails: {
          branchRequisitionReturnId: id,
          isActive: true,
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
    `exiting::deleteBranchRequisitionReturnFromDb::repository id=${id}`
  );
};

export const rejectBranchRequisitionReturn = async (
  inp: RejectBranchRequisitionReturnInput
) => {
  logger.info(
    `entering::rejectBranchRequisitionReturn::repository id=${inp.id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.branchRequisitionReturn.update({
    where: { id: inp.id, isActive: true },
    data: {
      returnStatus: "Reject",
      rejectAt: new Date(),
      rejectBy: currentUser,
    },
  });

  logger.info(
    `exiting::rejectBranchRequisitionReturn::repository id=${inp.id}`
  );
};

export const approveBranchRequisitionReturn = async (
  inp: ApproveBranchReqReturnInput
) => {
  logger.info(
    `entering::approveBranchRequisitionReturn::repository id=${inp.id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.branchRequisitionReturn.update({
      where: { id: inp.id, isActive: true },
      data: {
        returnStatus: inp.returnStatus || "Approved",
        approvedAt: now,
        approvedBy: currentUser,

        branchRequisitionReturnDetails: {
          update: inp.returnItems.map((det) => ({
            where: { id: det.id, isActive: true },
            data: {
              requestedReturnQty: det.requestedReturnQty,
              updatedBy: currentUser,

              branchReturnItemDetails: {
                update: det.itemBatch.map((item) => ({
                  where: { id: item.id, isActive: true },
                  data: {
                    returnQty: item.returnQty,
                    comment: item.comment ?? null,
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
      const brrDetail = inp.branchReqReturn.branchRequisitionReturnDetails.find(
        (d) => d.id === det.id
      );

      for (const item of det.itemBatch) {
        const rrItem = brrDetail?.branchReturnItemDetails.find(
          (r) => r.id === item.id
        );

        if (rrItem?.branchItemDetailsId) {
          await tx.branchItemDetails.update({
            where: { id: rrItem.branchItemDetailsId, isActive: true },
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
            batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
            ccId: inp.branchReqReturn.branchId,
            expiryDate:
              item.isExpiry && item.expiryDate
                ? new Date(item.expiryDate)
                : null,
            isFoc: item.isFoc,
          },
          {
            operation: InvOperation.BRANCH_REQUISITION_RETURN,
            refApprovedBy: currentUser,
            refDate: now,
            refDetailsId: det.id,
            refId: inp.id,
            refNo: inp.branchReqReturn.brrNumber,
            refApprovedAt: now,
          }
        );

        await addInTransitStock(
          tx,
          {
            itemId: det.itemId,
            quantity: item.returnQty,
            batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
            expiryDate:
              item.isExpiry && item.expiryDate
                ? new Date(item.expiryDate)
                : null,
            isFoc: item.isFoc,
            fromId: inp.branchReqReturn.branchId,
            toId: inp.branchReqReturn.ccId,
          },
          {
            operation: InvOperation.BRANCH_REQUISITION_RETURN,
            refApprovedBy: currentUser,
            refDate: now,
            refDetailsId: det.id,
            refId: inp.id,
            refNo: inp.branchReqReturn.brrNumber,
            refApprovedAt: now,
          }
        );
      }

      if (brrDetail?.branchRequisitionDetailsId) {
        await tx.branchRequisitionDetails.update({
          where: { id: brrDetail.branchRequisitionDetailsId, isActive: true },
          data: {
            returnedQuantity: { increment: det.requestedReturnQty },
            updatedBy: currentUser,
          },
        });
      }
    }

    logger.info(
      `exiting::approveBranchRequisitionReturn::repository id=${inp.id}`
    );
  });
};

export const acknowledgeBranchRequisitionReturn = async (
  inp: AcknowledgeBranchRequisitionReturn
) => {
  logger.info(
    `entering::acknowledgeBranchRequisitionReturn::repository id=${inp.id}`
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const now = new Date();

  await db.$transaction(async (tx) => {
    for (const detail of inp.acknowledgeItems) {
      for (const item of detail.itemBatch) {
        await tx.branchReturnItemDetails.update({
          where: { id: item.id, isActive: true },
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
            batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
            ccId: inp.ccId,
            expiryDate:
              item.isExpiry && item.expiryDate
                ? new Date(item.expiryDate)
                : null,
            isFoc: item.isFoc,
          },
          {
            operation: InvOperation.BRANCH_REQUISITION_RETURN,
            refDate: now,
            refDetailsId: detail.id,
            refId: inp.id,
            refNo: inp.branchReqReturn.brrNumber,
          }
        );

        await subInTransitStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: item.acknowledgedQty,
            batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
            expiryDate:
              item.isExpiry && item.expiryDate
                ? new Date(item.expiryDate)
                : null,
            isFoc: item.isFoc,
            fromId: inp.branchReqReturn.branchId,
            toId: inp.branchReqReturn.ccId,
          },
          {
            operation: InvOperation.BRANCH_REQUISITION_RETURN,
            refDate: now,
            refDetailsId: detail.id,
            refId: inp.id,
            refNo: inp.branchReqReturn.brrNumber,
          }
        );
      }

      await tx.branchRequisitionReturnDetails.update({
        where: { id: detail.id, isActive: true },
        data: {
          acknowledgedReturnQty: { increment: detail.acknowledgedReturnQty },
          updatedBy: currentUser,
        },
      });
    }

    await tx.branchRequisitionReturn.update({
      where: { id: inp.id, isActive: true },
      data: {
        ackStatus: inp.ackStatus,
        acknowledgementBy: currentUser,
        acknowledgementAt: now,
      },
    });
  });

  logger.info(
    `exiting::acknowledgeBranchRequisitionReturn::repository id=${inp.id}`
  );
};
