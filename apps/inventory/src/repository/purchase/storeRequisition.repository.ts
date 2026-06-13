import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  AcknowledgeRequisition,
  ApproveStoreReqInput,
  AssignItem,
  CreateStoreRequisitionInput,
  RejectStoreRequisitionInput,
  StoreReqBatchWiseResponse,
  StoreRequisitionDetailInput,
  StoreRequisitionResponse,
  StoreReqValResponse,
  ValStoreRequisitionResponse,
} from "@/types/purchase/storeRequisition.js";

import { logger } from "@repo/platform/logging/logger.js";
import {
  RequisitionInvItemDetails,
  InvUinShortCode,
  StaffCollectionCenter,
} from "@repo/db/generated/prisma/client";
import {
  addItemStock,
  subItemStock,
} from "@/repository/stock/stock.repository.js";
import { customOmit } from "av6-utils";
import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  addInTransitStock,
  subInTransitStock,
} from "@/repository/inTransitStock/inTransitStock.repository.js";
import { eventEmailService } from "@/services/master/emailConfig.service.js";

export const createStoreRequisitionInDb = async (
  input: CreateStoreRequisitionInput
) => {
  logger.info("entering::createStoreRequisitionInDb::repository");

  const omittedInput = customOmit<
    CreateStoreRequisitionInput,
    "storeRequisitionDetails" | "storeReq"
  >(input, ["storeRequisitionDetails", "storeReq"]);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.$transaction(
    async (tx) => {
      const srUin = await uinServiceFactory.generateUIN(InvUinShortCode.SRN);

      const filteredStoreRequisitionDetails =
        omittedInput.omitted.storeRequisitionDetails.map((detail) => {
          const omittedRes = customOmit<
            StoreRequisitionDetailInput,
            "warehouseInHandStock" | "branchInHandStock" | "userInHandStock"
          >(detail, [
            "warehouseInHandStock",
            "branchInHandStock",
            "userInHandStock",
          ]);

          return omittedRes.rest;
        });
      const createdStoreRequisition = await tx.invStoreRequisition.create({
        data: {
          ...omittedInput.rest,
          srNumber: srUin,
          createdBy: currentUser,
          storeRequisitionDetails: {
            create: filteredStoreRequisitionDetails.map((detail) => ({
              ...detail,
              createdBy: currentUser,
            })),
          },
        },
        include: {
          storeRequisitionDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      const emailTemplate = await eventEmailService.getEventEmail();

      if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
        // sendTemplatedEmail({
        //   template: emailTemplate,
        //   to: [store?.user?.email],
        //   variables: {
        //     name: store?.user?.userName || "User",
        //     companyDetails: "Aerial View-6",
        //     message: `Store Requisition created.`,
        //     signature: `Aerial View-6 Pvt. Ltd.`,
        //   },
        // })
        //   .then(() => {
        //     logger.info("Email Sent Successfully.");
        //   })
        //   .catch((e) => logger.error(`Email Failed:: ${e.message} `));
        // TODO: Send notification
      }

      return createdStoreRequisition;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const updateStoreRequisitionInDb = async (
  input: CreateStoreRequisitionInput
) => {
  logger.info("entering::updateStoreRequisition::repository");

  const omittedInput = customOmit<
    CreateStoreRequisitionInput,
    "storeRequisitionDetails" | "ccId" | "id" | "storeReq"
  >(input, ["storeRequisitionDetails", "ccId", "id", "storeReq"]);
  const id = omittedInput.omitted.id;
  const storeRequisitionData = omittedInput.rest;
  if (!id) {
    throw new Error("Cannot update a storeRequisition without an id");
  }

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = omittedInput.omitted.storeRequisitionDetails.filter(
    (d) => typeof d.id === "number"
  );
  const toCreate = omittedInput.omitted.storeRequisitionDetails.filter(
    (d) => typeof d.id !== "number"
  );
  const toDelete =
    omittedInput.omitted.storeReq?.storeRequisitionDetails?.filter(
      (d) =>
        !omittedInput.omitted.storeRequisitionDetails.some(
          (item) => item.id === d.id
        )
    ) || [];

  return await db.$transaction(
    async (tx) => {
      const updated = await tx.invStoreRequisition.update({
        where: { id },
        data: {
          ...storeRequisitionData,
          updatedBy: currentUser,
          storeRequisitionDetails: {
            update: toUpdate.map((d) => {
              const omittedDetail = customOmit<
                StoreRequisitionDetailInput,
                "warehouseInHandStock" | "branchInHandStock" | "userInHandStock"
              >(d, [
                "branchInHandStock",
                "warehouseInHandStock",
                "userInHandStock",
              ]);

              return {
                where: { id: d.id! },
                data: {
                  ...omittedDetail.rest,
                  updatedBy: currentUser,
                },
              };
            }),
            create: toCreate.map((d) => {
              const omittedDetail = customOmit<
                StoreRequisitionDetailInput,
                | "warehouseInHandStock"
                | "branchInHandStock"
                | "id"
                | "userInHandStock"
              >(d, [
                "branchInHandStock",
                "warehouseInHandStock",
                "id",
                "userInHandStock",
              ]);
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
          storeRequisitionDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      const emailTemplate = await eventEmailService.getEventEmail();

      if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
        // TODO: Send notification
      }

      return updated;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const getCountSRDetailsFromDb = async (
  detailIds: number[],
  storeRequisitionId: number
): Promise<number> => {
  return db.invStoreRequisitionDetails.count({
    where: {
      id: { in: detailIds },
      isActive: true,
      storeRequisitionId: storeRequisitionId,
    },
  });
};

export const getAllStoreRequisitionFromDb = async (): Promise<
  StoreRequisitionResponse[]
> => {
  logger.info("entering::getAllStoreRequisitionFromDb::repository");
  const allStoreReq = await db.invStoreRequisition.findMany({
    where: { isActive: true },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
      requisitionInvItemDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getAllStoreRequisitionFromDb::repository");
  return allStoreReq;
};

export const getStoreRequisitionByIdFromDb = async (
  id: number
): Promise<StoreRequisitionResponse | null> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository`);
  const storeReq = await db.invStoreRequisition.findFirst({
    where: { id, isActive: true },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
      requisitionInvItemDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository`);
  return storeReq;
};

export const validateStoreRequisitionByIdFromDb = async (
  id: number
): Promise<ValStoreRequisitionResponse | null> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository`);
  const storeReq = await db.invStoreRequisition.findUnique({
    where: { id, isActive: true },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
      requisitionInvItemDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository`);
  return storeReq;
};

export const deleteStoreRequisitionFromDb = async (id: number) => {
  logger.info(`entering::deleteStoreRequisitionFromDb::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.invStoreRequisition.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      storeRequisitionDetails: {
        updateMany: {
          where: { storeRequisitionId: id },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });

  logger.info(`exiting::deleteStoreRequisitionFromDb::repository`);
};

export const rejectStoreRequisition = async (
  inp: RejectStoreRequisitionInput
) => {
  logger.info(`entering::rejectStoreRequisition::repository id=${inp.id}`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.$transaction(
    async (tx) => {
      await tx.invStoreRequisition.update({
        where: {
          id: inp.id,
        },
        data: {
          storeReqStatus: "Reject",
          rejectAt: new Date(),
          rejectBy: currentUser,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    }
  );

  logger.info(`exiting::rejectStoreRequisition::repository`);
};

export const approveStoreRequisition = async (inp: ApproveStoreReqInput) => {
  logger.info(`entering::approveStoreRequisition::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const now = new Date();

  const appStr = customOmit<
    ApproveStoreReqInput,
    "storeReqStatus" | "storeReqAckStatus" | "storeReq"
  >(inp, ["storeReqStatus", "storeReqAckStatus", "storeReq"]);

  await db.$transaction(async (tx) => {
    const rawAssignItems = appStr.rest.assignItems ?? [];
    const assignItems = rawAssignItems.map((details) => {
      const omittedFlags = customOmit<AssignItem, "isBatch" | "isExpiry">(
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
      await tx.requisitionInvItemDetails.createMany({
        data: assignItems.map((details) => ({
          ...details,
          storeRequisitionId: appStr.rest.storeReqId,
          batchNo: details.batchNo ?? null,
          expiryDate: details.expiryDate ? new Date(details.expiryDate) : null,
          ccId: appStr.rest.ccId,
          createdBy: currentUser,
        })),
      });
    }

    if (assignItems.length) {
      const agg = new Map<number, number>();
      for (const item of assignItems) {
        agg.set(
          item.storeRequisitionDetailsId,
          (agg.get(item.storeRequisitionDetailsId) ?? 0) + item.assignedQty
        );
      }
      await Promise.all(
        Array.from(agg.entries()).map(([id, qty]) =>
          tx.invStoreRequisitionDetails.update({
            where: { id },
            data: { assignedQuantity: { increment: qty } },
          })
        )
      );
    }

    await tx.invStoreRequisition.update({
      where: { id: appStr.rest.storeReqId },
      data: {
        storeReqStatus: appStr.omitted.storeReqStatus,
        storeReqAckStatus: appStr.omitted.storeReqAckStatus,
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
          operation: "STORE_REQUISITION",
          refApprovedBy: currentUser,
          refDate: now,
          refDetailsId: detail.storeRequisitionDetailsId,
          refId: appStr.rest.storeReqId,
          refNo: appStr.rest.storeReqNo,
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
          fromCcId: appStr.omitted.storeReq.ccId,
          userId: appStr.omitted.storeReq.requisitionFrom,
        },
        {
          operation: "STORE_REQUISITION",
          refApprovedBy: currentUser,
          refDate: now,
          refDetailsId: detail.storeRequisitionDetailsId,
          refId: appStr.rest.storeReqId,
          refNo: appStr.rest.storeReqNo,
          refApprovedAt: now,
        }
      );
    }
  });

  logger.info(`exiting::approveStoreRequisition::repository`);
};

export const acknowledgeStoreRequisition = async (
  inp: AcknowledgeRequisition
) => {
  logger.info(`entering::approveStoreRequisition::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const ackStore = customOmit<
    AcknowledgeRequisition,
    "requisitionFrom" | "storeReq"
  >(inp, ["requisitionFrom", "storeReq"]);
  await db.$transaction(
    async (tx) => {
      for (const detail of inp.acknowledgeItems) {
        for (const item of detail.itemBatch) {
          await tx.requisitionInvItemDetails.update({
            where: {
              id: item.requisitionItemId,
            },
            data: {
              acknowledgedQty: {
                increment: item.acknowledgeQty,
              },
              updatedBy: currentUser,
              ackCCId: inp.ccId,
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
              userId: ackStore.omitted.requisitionFrom,
            },
            {
              operation: "STORE_REQUISITION",
              refDate: new Date(),
              refDetailsId: detail.storeRequisitionDetailsId,
              refId: ackStore.rest.storeReqId,
              refNo: ackStore.rest.storeReqNo,
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
              fromCcId: ackStore.rest.ccId,
              userId: ackStore.omitted.requisitionFrom,
            },
            {
              operation: "STORE_REQUISITION",
              refDate: new Date(),
              refDetailsId: detail.storeRequisitionDetailsId,
              refId: ackStore.rest.storeReqId,
              refNo: ackStore.rest.storeReqNo,
            }
          );
        }

        await tx.invStoreRequisitionDetails.update({
          where: {
            id: detail.storeRequisitionDetailsId,
          },
          data: {
            acknowledgedQuantity: {
              increment: detail.totalAcknowledgeQty,
            },
          },
        });
      }

      await tx.invStoreRequisition.update({
        where: {
          id: ackStore.rest.storeReqId,
        },
        data: {
          storeReqAckStatus: ackStore.rest.storeReqAckStatus,
          acknowledgementBy: currentUser,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    }
  );

  logger.info(`exiting::approveStoreRequisition::repository`);
};

export const getRequisitionItemDetailsFromDb = async (
  id: number
): Promise<RequisitionInvItemDetails | null> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository`);
  const storeReq = await db.requisitionInvItemDetails.findFirst({
    where: { id, isActive: true },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository`);
  return storeReq;
};

export const getStoreRequisitionBatchWiseFromDb = async (
  id: number
): Promise<StoreReqBatchWiseResponse | null> => {
  logger.info(`entering::getStoreRequisitionBatchWiseFromDb::repository`);
  const storeReq = await db.invStoreRequisition.findFirst({
    where: { id, isActive: true },
    include: {
      requisitionInvItemDetails: {
        where: {
          isActive: true,
        },
        include: {
          storeRequisitionDetails: true,
        },
      },
    },
  });
  logger.info(`exiting::getStoreRequisitionBatchWiseFromDb::repository`);
  return storeReq;
};

export const getItemRequisitionDetails = async (
  itemId: number,
  location: { storeRequisitionId?: number; storeRequisitionDetailsId?: number },
  batchNo?: string,
  expiryDate?: Date | null
) => {
  logger.info(`entering::getItemRequisitionDetails::repository`);

  const requisitionDetail = await db.requisitionInvItemDetails.findFirst({
    where: {
      itemId,
      storeRequisitionId: location.storeRequisitionId,
      storeRequisitionDetailsId: location.storeRequisitionDetailsId,
      batchNo,
      expiryDate,
    },
  });

  return requisitionDetail?.id ? requisitionDetail : null;
};

export const valStoreRequisitionBatchWiseFromDb = async (
  id: number
): Promise<StoreReqBatchWiseResponse | null> => {
  logger.info(
    `entering::getStoreRequisitionBatchWiseFromDb::repository id=${id}`
  );
  const storeReq = await db.invStoreRequisition.findFirst({
    where: { id, isActive: true },
    include: {
      requisitionInvItemDetails: {
        where: {
          isActive: true,
        },
        include: {
          storeRequisitionDetails: true,
        },
      },
    },
  });
  logger.info(
    `exiting::getStoreRequisitionBatchWiseFromDb::repository id=${id}`
  );
  return storeReq;
};

export const valStoreRequisitionFromDb = async (
  id: number
): Promise<StoreReqValResponse | null> => {
  logger.info(
    `entering::getStoreRequisitionBatchWiseFromDb::repository id=${id}`
  );
  const storeReq = await db.invStoreRequisition.findFirst({
    where: { id, isActive: true },
    include: {
      requisitionInvItemDetails: {
        where: {
          isActive: true,
        },
      },
      storeRequisitionDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info(
    `exiting::getStoreRequisitionBatchWiseFromDb::repository id=${id}`
  );
  return storeReq;
};

export const getStaffCollectionCenterFromDb = async (
  staffId: number,
  ccId: number
): Promise<StaffCollectionCenter | null> => {
  logger.info(`entering::getStaffCollectionCenterFromDb::repository`);
  const staffCollectionCenter = await db.staffCollectionCenter.findFirst({
    where: { staffId, collectionCenterId: ccId },
  });
  logger.info(`exiting::getStaffCollectionCenterFromDb::repository`);
  return staffCollectionCenter;
};
