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
  AcknowledgeBranchRequisition,
  ApproveBranchReqInput,
  AssignBranchItem,
  BranchReqBatchWiseResponse,
  BranchRequisitionDetailInput,
  BranchRequisitionResponse,
  CreateBranchRequisitionInput,
  RejectBranchRequisitionInput,
  ValBranchRequisitionResponse,
} from "@/types/purchase/branchRequisition.js";
import { db } from "@repo/db/client";
import { BranchItemDetails } from "@repo/db/generated/prisma/client";
import {
  InvOperation,
  InvUinShortCode,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-core-v2";

export const createBranchRequisitionInDb = async (
  input: CreateBranchRequisitionInput
): Promise<BranchRequisitionResponse> => {
  logger.info("entering::createBranchRequisitionInDb::repository");

  const omittedInput = customOmit<
    CreateBranchRequisitionInput,
    "branchRequisitionDetails" | "branchReq" | "locationId"
  >(input, ["branchRequisitionDetails", "branchReq", "locationId"]);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const createdBranchRequisition = await db.$transaction(async (tx) => {
    const brNumber =
      input.brNumber ??
      (await uinServiceFactory.generateUIN(InvUinShortCode.BRN));

    const filteredBranchRequisitionDetails =
      omittedInput.omitted.branchRequisitionDetails.map((detail) => {
        const omittedRes = customOmit<
          BranchRequisitionDetailInput,
          "warehouseInHandStock" | "branchInHandStock"
        >(detail, ["warehouseInHandStock", "branchInHandStock"]);

        return omittedRes.rest;
      });

    return tx.branchRequisition.create({
      data: {
        ...omittedInput.rest,
        brNumber,
        createdBy: currentUser,
        branchRequisitionDetails: {
          create: filteredBranchRequisitionDetails.map((detail) => ({
            ...detail,
            createdBy: currentUser,
          })),
        },
      },
      include: {
        branchRequisitionDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });
  });

  logger.info("exiting::createBranchRequisitionInDb::repository");
  return createdBranchRequisition;
};

export const updateBranchRequisitionInDb = async (
  input: CreateBranchRequisitionInput
): Promise<BranchRequisitionResponse> => {
  logger.info("entering::updateBranchRequisitionInDb::repository");

  const omittedInput = customOmit<
    CreateBranchRequisitionInput,
    "branchRequisitionDetails" | "id" | "branchReq" | "brNumber" | "locationId"
  >(input, [
    "branchRequisitionDetails",
    "id",
    "branchReq",
    "brNumber",
    "locationId",
  ]);

  const id = omittedInput.omitted.id;

  if (!id) {
    throw new Error("Cannot update a Branch Requisition without an id");
  }

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = omittedInput.omitted.branchRequisitionDetails.filter(
    (d) => typeof d.id === "number"
  );

  const toCreate = omittedInput.omitted.branchRequisitionDetails.filter(
    (d) => typeof d.id !== "number"
  );

  const toDelete =
    omittedInput.omitted.branchReq?.branchRequisitionDetails?.filter(
      (d) =>
        !omittedInput.omitted.branchRequisitionDetails.some(
          (item) => item.id === d.id
        )
    ) || [];

  const updated = await db.$transaction(async (tx) => {
    return tx.branchRequisition.update({
      where: {
        id,
        isActive: true,
      },
      data: {
        ...omittedInput.rest,
        updatedBy: currentUser,
        branchRequisitionDetails: {
          update: toUpdate.map((d) => {
            const omittedDetail = customOmit<
              BranchRequisitionDetailInput,
              "warehouseInHandStock" | "branchInHandStock"
            >(d, ["branchInHandStock", "warehouseInHandStock"]);

            return {
              where: {
                id: d.id!,
              },
              data: {
                ...omittedDetail.rest,
                updatedBy: currentUser,
              },
            };
          }),
          create: toCreate.map((d) => {
            const omittedDetail = customOmit<
              BranchRequisitionDetailInput,
              "warehouseInHandStock" | "branchInHandStock" | "id"
            >(d, ["branchInHandStock", "warehouseInHandStock", "id"]);

            return {
              ...omittedDetail.rest,
              createdBy: currentUser,
            };
          }),
          updateMany:
            toDelete.length > 0
              ? {
                  where: {
                    id: {
                      in: toDelete.map((d) => d.id),
                    },
                    isActive: true,
                  },
                  data: {
                    isActive: false,
                    deletedAt: new Date(),
                    deletedBy: currentUser,
                  },
                }
              : undefined,
        },
      },
      include: {
        branchRequisitionDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });
  });

  // const emailTemplate = await eventEmailService.getEventEmail();

  // if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
  //   sendTemplatedEmail({
  //     template: emailTemplate,
  //     to: [store.user.email],
  //     variables: {
  //       name: store.user.userName || "User",
  //       companyDetails: "Aerial View-6",
  //       message: "Branch Requisition updated.",
  //       signature: "Aerial View-6 Pvt. Ltd.",
  //     },
  //   })
  //     .then(() => {
  //       logger.info("Email Sent Successfully.");
  //     })
  //     .catch((e) => logger.error(`Email Failed:: ${e.message} `));
  // }

  logger.info("exiting::updateBranchRequisitionInDb::repository");
  return updated;
};

export const validateBranchRequisitionByIdFromDb = async (
  id: number
): Promise<ValBranchRequisitionResponse | null> => {
  logger.info("entering::validateBranchRequisitionByIdFromDb::repository");

  const branchReq = await db.branchRequisition.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      branchRequisitionDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });

  logger.info("exiting::validateBranchRequisitionByIdFromDb::repository");
  return branchReq;
};

export const deleteBranchRequisitionFromDb = async (
  id: number
): Promise<void> => {
  logger.info("entering::deleteBranchRequisitionFromDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.branchRequisition.update({
    where: {
      id,
      isActive: true,
    },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      branchRequisitionDetails: {
        updateMany: {
          where: {
            branchRequisitionId: id,
            isActive: true,
          },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });

  logger.info("exiting::deleteBranchRequisitionFromDb::repository");
};

export const rejectBranchRequisition = async (
  inp: RejectBranchRequisitionInput
): Promise<void> => {
  logger.info("entering::rejectBranchRequisition::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.branchRequisition.update({
    where: {
      id: inp.id,
      isActive: true,
    },
    data: {
      branchReqStatus: STORE_REQ_STATUS.Reject,
      rejectAt: new Date(),
      rejectBy: currentUser,
    },
  });

  logger.info("exiting::rejectBranchRequisition::repository");
};

export const approveBranchRequisition = async (
  inp: ApproveBranchReqInput
): Promise<void> => {
  logger.info("entering::approveBranchRequisition::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const now = new Date();

  const appStr = customOmit<
    ApproveBranchReqInput,
    "branchReqStatus" | "branchReqAckStatus" | "branchReq"
  >(inp, ["branchReqStatus", "branchReqAckStatus", "branchReq"]);

  await db.$transaction(async (tx) => {
    const branchReq = appStr.omitted.branchReq;

    if (!branchReq) {
      throw new Error("Branch Requisition is required for approval");
    }

    const rawAssignItems = appStr.rest.assignItems ?? [];

    const assignItems = rawAssignItems.map((details) => {
      const omittedFlags = customOmit<AssignBranchItem, "isBatch" | "isExpiry">(
        details,
        ["isBatch", "isExpiry"]
      );

      return {
        ...omittedFlags.rest,
        batchNo: details.isBatch ? details.batchNo : null,
        expiryDate:
          details.isExpiry && details.expiryDate
            ? details.expiryDate
            : undefined,
      };
    });

    if (assignItems.length) {
      await tx.branchItemDetails.createMany({
        data: assignItems.map((details) => ({
          branchRequisitionId: appStr.rest.branchReqId,
          branchRequisitionDetailsId: details.branchRequisitionDetailsId,
          itemStockId: details.itemStockId,
          itemId: details.itemId,
          assignedQty: details.assignedQty,
          batchNo: details.batchNo ?? null,
          expiryDate: details.expiryDate ? new Date(details.expiryDate) : null,
          isFoc: details.isFoc,
          ccId: appStr.rest.ccId,
          createdBy: currentUser,
        })),
      });
    }

    if (assignItems.length) {
      const agg = new Map<number, number>();

      for (const item of assignItems) {
        agg.set(
          item.branchRequisitionDetailsId,
          (agg.get(item.branchRequisitionDetailsId) ?? 0) + item.assignedQty
        );
      }

      await Promise.all(
        Array.from(agg.entries()).map(([id, qty]) =>
          tx.branchRequisitionDetails.update({
            where: {
              id,
              isActive: true,
            },
            data: {
              assignedQuantity: {
                increment: qty,
              },
              updatedBy: currentUser,
            },
          })
        )
      );
    }

    await tx.branchRequisition.update({
      where: {
        id: appStr.rest.branchReqId,
        isActive: true,
      },
      data: {
        branchReqStatus: appStr.omitted.branchReqStatus,
        branchReqAckStatus: appStr.omitted.branchReqAckStatus,
        approvedAt: now,
        approvedBy: currentUser,
      },
    });

    for (const detail of assignItems) {
      await subItemStock(
        tx,
        {
          itemId: detail.itemId,
          quantity: detail.assignedQty,
          batchNo: detail.batchNo ?? null,
          ccId: appStr.rest.ccId,
          expiryDate: detail.expiryDate ?? null,
          isFoc: detail.isFoc,
        },
        {
          operation: InvOperation.BRANCH_REQUISITION,
          refApprovedBy: currentUser,
          refDate: now,
          refDetailsId: detail.branchRequisitionDetailsId,
          refId: appStr.rest.branchReqId,
          refNo: appStr.rest.brNumber,
          refApprovedAt: now,
        }
      );

      await addInTransitStock(
        tx,
        {
          batchNo: detail.batchNo ?? "",
          expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : null,
          isFoc: detail.isFoc,
          itemId: detail.itemId,
          quantity: detail.assignedQty,
          fromId: branchReq.ccId,
          toId: branchReq.branchId,
        },
        {
          operation: InvOperation.BRANCH_REQUISITION,
          refApprovedBy: currentUser,
          refDate: now,
          refDetailsId: detail.branchRequisitionDetailsId,
          refId: appStr.rest.branchReqId,
          refNo: appStr.rest.brNumber,
          refApprovedAt: now,
        }
      );
    }
  });

  logger.info("exiting::approveBranchRequisition::repository");
};

export const acknowledgeBranchRequisition = async (
  inp: AcknowledgeBranchRequisition
): Promise<void> => {
  logger.info("entering::acknowledgeBranchRequisition::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const ackBranch = customOmit<AcknowledgeBranchRequisition, "branchReq">(inp, [
    "branchReq",
  ]);

  await db.$transaction(async (tx) => {
    const branchReq = ackBranch.omitted.branchReq;

    if (!branchReq) {
      throw new Error("Branch Requisition is required for acknowledgement");
    }

    for (const detail of inp.acknowledgeItems) {
      for (const item of detail.itemBatch) {
        await tx.branchItemDetails.update({
          where: {
            id: item.branchItemId,
            isActive: true,
          },
          data: {
            acknowledgedQty: {
              increment: item.acknowledgeQty,
            },
            updatedBy: currentUser,
            ackCCId: inp.branchId,
            isCompleted: item.isCompleted,
          },
        });

        await addItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: item.acknowledgeQty,
            batchNo: item.batchNo ?? null,
            expiryDate: item.expiryDate ?? null,
            isFoc: item.isFoc,
            ccId: inp.branchId,
          },
          {
            operation: InvOperation.BRANCH_REQUISITION,
            refDate: new Date(),
            refDetailsId: detail.branchRequisitionDetailsId,
            refId: ackBranch.rest.branchReqId,
            refNo: ackBranch.rest.brNumber,
          }
        );

        await subInTransitStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: item.acknowledgeQty,
            batchNo: item.batchNo ?? "",
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            isFoc: item.isFoc,
            fromId: branchReq.ccId,
            toId: branchReq.branchId,
          },
          {
            operation: InvOperation.BRANCH_REQUISITION,
            refDate: new Date(),
            refDetailsId: detail.branchRequisitionDetailsId,
            refId: ackBranch.rest.branchReqId,
            refNo: ackBranch.rest.brNumber,
          }
        );
      }

      await tx.branchRequisitionDetails.update({
        where: {
          id: detail.branchRequisitionDetailsId,
          isActive: true,
        },
        data: {
          acknowledgedQuantity: {
            increment: detail.totalAcknowledgeQty,
          },
          updatedBy: currentUser,
        },
      });
    }

    await tx.branchRequisition.update({
      where: {
        id: ackBranch.rest.branchReqId,
        isActive: true,
      },
      data: {
        branchReqAckStatus: ackBranch.rest.branchReqAckStatus,
        acknowledgementBy: currentUser,
        acknowledgementAt: new Date(),
      },
    });
  });

  logger.info("exiting::acknowledgeBranchRequisition::repository");
};

export const getBranchItemDetailsFromDb = async (
  id: number
): Promise<BranchItemDetails | null> => {
  logger.info("entering::getBranchItemDetailsFromDb::repository");

  const branchItem = await db.branchItemDetails.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  logger.info("exiting::getBranchItemDetailsFromDb::repository");
  return branchItem;
};

export const getBranchRequisitionBatchWiseFromDb = async (
  id: number
): Promise<BranchReqBatchWiseResponse | null> => {
  logger.info(`entering::getStoreRequisitionBatchWiseFromDb::repository`);
  const branchReq = await db.branchRequisition.findFirst({
    where: { id, isActive: true },
    include: {
      branchItemDetails: {
        where: {
          isActive: true,
        },
        include: {
          branchRequisitionDetails: true,
        },
      },
    },
  });
  logger.info(`exiting::getStoreRequisitionBatchWiseFromDb::repository`);
  return branchReq;
};

export const valBranchRequisitionBatchWiseFromDb = async (
  id: number
): Promise<BranchReqBatchWiseResponse | null> => {
  logger.info(
    `entering::getBranchRequisitionBatchWiseFromDb::repository id=${id}`
  );
  const branchReq = await db.branchRequisition.findFirst({
    where: { id, isActive: true },
    include: {
      branchItemDetails: {
        where: {
          isActive: true,
        },
        include: {
          branchRequisitionDetails: true,
        },
      },
    },
  });
  logger.info(
    `exiting::getBranchRequisitionBatchWiseFromDb::repository id=${id}`
  );
  return branchReq;
};
