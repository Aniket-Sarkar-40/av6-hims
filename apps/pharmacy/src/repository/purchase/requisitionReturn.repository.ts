import { API_TIMEOUT } from "@repo/shared";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  GetStoreRequisitionReturnResponse,
  RejectStoreRequisitionReturnInput,
  ReturnItem,
} from "@/types/purchase/requisitionReturn.js";
import { customOmit } from "av6-core-v2";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PmsStoreRequisitionReturn,
  PmsUinShortCode,
} from "@repo/db/generated/prisma/client";
import {
  addInTransitStock,
  subInTransitStock,
} from "../inTransitStock/inTransitStock.repository.js";
import { addItemStock, subItemStock } from "../stock/stock.repository.js";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { emailConfigService } from "@/services/master/emailConfig.service.js";

export const createStoreRequisitionReturnInDb = async (
  input: CreateStoreRequisitionReturnInput,
) => {
  logger.info("entering::createStoreRequisitionReturn::repository");

  const omittedSRR = customOmit<
    CreateStoreRequisitionReturnInput,
    "storeReq" | "storeReqReturn" | "id" | "ccId" | "returnItems"
  >(input, ["storeReq", "storeReqReturn", "id", "ccId", "returnItems"]);

  const storeRequisitionReturnData = omittedSRR.rest;

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const srrUin = await uinServiceFactory.generateUIN(PmsUinShortCode.SRR);

      // Master
      const created = await tx.pmsStoreRequisitionReturn.create({
        data: {
          ...storeRequisitionReturnData,
          srrNumber: srrUin,
          warehouseId: input.storeReq.warehouseId,
          branchId: omittedSRR.omitted.ccId,
          createdBy: currentUser,

          // Item-level details
          storeRequisitionReturnDetails: {
            create: omittedSRR.omitted.returnItems.map((ri) => {
              const omittedReturnItems = customOmit<ReturnItem, "itemBatch">(
                ri,
                ["itemBatch"],
              );
              return {
                ...omittedReturnItems.rest,
                createdBy: currentUser,

                // Batch/Lot-level lines
                requisitionReturnItemDetails: {
                  create: ri.itemBatch.map((b) => ({
                    ...b,
                    itemId: ri.itemId,
                    expiryDate: b.expiryDate
                      ? new Date(b.expiryDate)
                      : undefined,
                    sourceBranchId: omittedSRR.omitted.ccId,
                    destinationWarehouseId: input.storeReq.warehouseId,
                    createdBy: currentUser,
                  })),
                },
              };
            }),
          },
        },
        include: {
          storeRequisitionReturnDetails: {
            where: { isActive: true },
            include: {
              requisitionReturnItemDetails: { where: { isActive: true } },
            },
          },
        },
      });

      // optional email
      const emailTemplate = await emailConfigService.getEventEmail();
      const feature = await featureFlagService.getFeatureFlagByShortCode(
        "STORE_REQ_RETURN_NOTIFICATION",
        true,
      );
      // if (emailTemplate && emailTemplate.emailBody && store?.user?.email && feature?.isEnabled) {
      //   sendTemplatedEmail({
      //     template: emailTemplate,
      //     to: [store.user.email],
      //     variables: {
      //       name: store?.user?.userName || "User",
      //       companyDetails: "Aerial View-6",
      //       message: `Store Requisition Return created.`,
      //       signature: `Aerial View-6 Pvt. Ltd.`,
      //     },
      //   })
      //     .then(() => logger.info("Email Sent Successfully."))
      //     .catch((e) => logger.error(`Email Failed:: ${e.message}`));
      // }

      // TODO: Send notification

      return created;
    },
    { timeout: API_TIMEOUT },
  );
};

export const updateStoreRequisitionReturnInDb = async (
  input: CreateStoreRequisitionReturnInput,
) => {
  logger.info("entering::updateStoreRequisitionReturn::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const omittedSRR = customOmit<
        CreateStoreRequisitionReturnInput,
        "storeReq" | "storeReqReturn" | "id" | "ccId" | "returnItems"
      >(input, ["storeReq", "storeReqReturn", "id", "ccId", "returnItems"]);

      const id = omittedSRR.omitted.id;
      const storeRequisitionReturnData = omittedSRR.rest;
      const existing =
        omittedSRR.omitted.storeReqReturn?.storeRequisitionReturnDetails || [];
      if (!id) {
        throw new Error("Cannot update a storeRequisition without an id");
      }

      const detailIds = existing.map((d) => d.id);

      if (detailIds.length) {
        await tx.pmsRequisitionReturnItemDetails.updateMany({
          where: { storeRequisitionReturnDetailsId: { in: detailIds } },
          data: {
            deletedAt: new Date(),
            deletedBy: currentUser,
            isActive: false,
          },
        });
        await tx.pmsStoreRequisitionReturnDetails.updateMany({
          where: { id: { in: detailIds } },
          data: {
            deletedAt: new Date(),
            deletedBy: currentUser,
            isActive: false,
          },
        });
      }

      // Update master + recreate children
      const updated = await tx.pmsStoreRequisitionReturn.update({
        where: { id },
        data: {
          ...storeRequisitionReturnData,
          updatedBy: currentUser,
          storeRequisitionReturnDetails: {
            create: omittedSRR.omitted.returnItems.map((ri) => {
              const omittedReturnItems = customOmit<ReturnItem, "itemBatch">(
                ri,
                ["itemBatch"],
              );
              return {
                ...omittedReturnItems.rest,
                createdBy: currentUser,

                // Batch/Lot-level lines
                requisitionReturnItemDetails: {
                  create: ri.itemBatch.map((b) => ({
                    ...b,
                    itemId: ri.itemId,
                    expiryDate: b.expiryDate
                      ? new Date(b.expiryDate)
                      : undefined,
                    sourceBranchId: omittedSRR.omitted.ccId,
                    destinationWarehouseId: input.storeReq.warehouseId,
                    createdBy: currentUser,
                  })),
                },
              };
            }),
          },
        },
        include: {
          storeRequisitionReturnDetails: {
            where: { isActive: true },
            include: {
              requisitionReturnItemDetails: { where: { isActive: true } },
            },
          },
        },
      });

      return updated;
    },
    { timeout: API_TIMEOUT },
  );
};

export const getStoreRequisitionReturnByIdFromDb = async (
  id: number,
): Promise<GetStoreRequisitionReturnResponse | null> => {
  logger.info(
    `entering::getStoreRequisitionReturnByIdFromDb::repository id=${id}`,
  );
  const storeReqReturn = await db.pmsStoreRequisitionReturn.findUnique({
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
    `exiting::getStoreRequisitionReturnByIdFromDb::repository id=${id}`,
  );
  return storeReqReturn;
};

export const getAllStoreRequisitionReturnByFromDb = async (): Promise<
  GetStoreRequisitionReturnResponse[]
> => {
  logger.info(`entering::getAllStoreRequisitionReturnByFromDb::repository `);
  const storeReqReturn = await db.pmsStoreRequisitionReturn.findMany({
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
  return storeReqReturn;
};

export const getPendingSRRFromSRId = async (
  storeRequisitionId: number,
): Promise<PmsStoreRequisitionReturn[]> => {
  logger.info(
    `entering::getPendingSRRFromSRId::repository storeRequisitionId=${storeRequisitionId}`,
  );
  const storeReqReturn = await db.pmsStoreRequisitionReturn.findMany({
    where: {
      storeRequisitionId,
      isActive: true,
      returnStatus: {
        in: ["Draft", "Pending", "Partially_Approved"],
      },
    },
  });
  logger.info(
    `exiting::getPendingSRRFromSRId::repository storeRequisitionId=${storeRequisitionId}`,
  );
  return storeReqReturn;
};

export const deleteStoreRequisitionReturnFromDb = async (id: number) => {
  logger.info(
    `entering::deleteStoreRequisitionReturnFromDb::repository id=${id}`,
  );

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(async (tx) => {
    await tx.pmsStoreRequisitionReturn.update({
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

    await tx.pmsRequisitionReturnItemDetails.updateMany({
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
    `exiting::deleteStoreRequisitionReturnFromDb::repository id=${id} (deletedBy=${currentUser})`,
  );
};

export const rejectStoreRequisitionReturn = async (
  inp: RejectStoreRequisitionReturnInput,
) => {
  logger.info(
    `entering::rejectStoreRequisitionReturn::repository id=${inp.id}`,
  );
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.$transaction(
    async (tx) => {
      await tx.pmsStoreRequisitionReturn.update({
        where: {
          id: inp.id,
        },
        data: {
          returnStatus: "Reject",
          rejectAt: new Date(),
          rejectBy: currentUser,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );

  logger.info(`exiting::rejectStoreRequisition::repository id=${inp.id}`);
};

export const approveStoreRequisitionReturn = async (
  inp: ApproveStoreReqReturnInput,
) => {
  logger.info(
    `entering::approveStoreRequisitionReturn::repository id=${inp.id}`,
  );
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.$transaction(
    async (tx) => {
      await tx.pmsStoreRequisitionReturn.update({
        where: {
          id: inp.id,
        },
        data: {
          returnStatus: inp.storeReqStatus || "Approved",
          approvedAt: new Date(),
          approvedBy: currentUser,
          storeRequisitionReturnDetails: {
            update: inp.returnItems.map((det) => {
              return {
                where: {
                  id: det.id,
                },
                data: {
                  requestedReturnQty: det.requestedReturnQty,
                  updatedBy: currentUser,
                  requisitionReturnItemDetails: {
                    update: det.itemBatch.map((item) => ({
                      where: {
                        id: item.id,
                      },
                      data: {
                        returnQty: item.returnQty,
                        updatedBy: currentUser,
                        comment: item.comment,
                        requisitionItemDetails: {
                          update: {
                            returnedQty: {
                              increment: item.returnQty,
                            },
                          },
                        },
                      },
                    })),
                  },
                  storeRequisitionDetails: {
                    update: {
                      returnedQuantity: {
                        increment: det.requestedReturnQty,
                      },
                    },
                  },
                },
              };
            }),
          },
        },
        include: {
          storeRequisitionReturnDetails: {
            where: {
              isActive: true,
            },
            include: {
              requisitionReturnItemDetails: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
      });

      // for (const element of updatedSRR.storeRequisitionReturnDetails) {
      //   for (const itemDet of element.requisitionReturnItemDetails) {
      //     await tx.requisitionItemDetails.update({
      //       where: {
      //         id: itemDet.requisitionItemDetailsId,
      //       },
      //       data: {
      //         returnedQty: itemDet.returnQty,
      //       },
      //     });
      //   }

      //   await tx.storeRequisitionDetails.update({
      //     where: {
      //       id: element.storeRequisitionDetailsId,
      //     },
      //     data: {
      //       returnedQuantity: {
      //         increment: element.requestedReturnQty,
      //       },
      //     },
      //   });
      // }

      for (const det of inp.returnItems) {
        for (const item of det.itemBatch) {
          await subItemStock(
            tx,
            {
              itemId: det.itemId,
              quantity: item.returnQty,
              batchNo: item.batchNo,
              branchId: inp.ccId,
              expiryDate: item.expiryDate,
              isFoc: item.isFoc,
            },
            {
              operation: "STORE_REQUISITION_RETURN",
              refApprovedBy: currentUser,
              refDate: new Date(),
              refDetailsId: det.id,
              refId: inp.id,
              refNo: inp.storeReqReturn.srrNumber,
              refApprovedAt: new Date(),
            },
          );

          await addInTransitStock(
            tx,
            {
              batchNo: item.batchNo,
              expiryDate: item.expiryDate
                ? new Date(item.expiryDate)
                : undefined,
              isFoc: item.isFoc,
              itemId: det.itemId,
              quantity: item.returnQty,
              fromId: inp.storeReqReturn.branchId,
              toId: inp.storeReqReturn.warehouseId,
            },
            {
              operation: "STORE_REQUISITION_RETURN",
              refApprovedBy: currentUser,
              refDate: new Date(),
              refDetailsId: det.id,
              refId: inp.id,
              refNo: inp.storeReqReturn.srrNumber,
              refApprovedAt: new Date(),
            },
          );
        }
      }
    },
    {
      timeout: API_TIMEOUT,
    },
  );

  logger.info(
    `exiting::approveStoreRequisitionReturn::repository id=${inp.id}`,
  );
};

export const acknowledgeStoreRequisitionReturn = async (
  inp: AcknowledgeRequisitionReturn,
) => {
  logger.info(`entering::acknowledgeStoreRequisitionReturn::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(
    async (tx) => {
      for (const detail of inp.acknowledgeItems) {
        for (const item of detail.itemBatch) {
          await tx.pmsRequisitionReturnItemDetails.update({
            where: {
              id: item.id,
            },
            data: {
              acknowledgedQty: {
                increment: item.acknowledgeQty,
              },
              updatedBy: currentUser,
              isCompleted: item.isCompleted,
            },
          });

          await addItemStock(
            tx,
            {
              itemId: detail.itemId,
              quantity: item.acknowledgeQty,
              warehouseId: inp.ccId,
              batchNo: item.batchNo,
              expiryDate: item.expiryDate,
              isFoc: item.isFoc,
            },
            {
              operation: "STORE_REQUISITION_RETURN",
              refDate: new Date(),
              refDetailsId: detail.id,
              refId: inp.id,
              refNo: inp.storeReqReturn.srrNumber,
            },
          );

          await subInTransitStock(
            tx,
            {
              itemId: detail.itemId,
              quantity: item.acknowledgeQty,
              batchNo: item.batchNo,
              expiryDate: item.expiryDate
                ? new Date(item.expiryDate)
                : undefined,
              isFoc: item.isFoc,
              fromId: inp.storeReqReturn.branchId,
              toId: inp.storeReqReturn.warehouseId,
            },
            {
              operation: "STORE_REQUISITION_RETURN",
              refDate: new Date(),
              refDetailsId: detail.id,
              refId: inp.id,
              refNo: inp.storeReqReturn.srrNumber,
            },
          );
        }

        await tx.pmsStoreRequisitionReturnDetails.update({
          where: {
            id: detail.id,
          },
          data: {
            acknowledgedReturnQty: {
              increment: detail.acknowledgedQuantity,
            },
          },
        });
      }

      await tx.pmsStoreRequisitionReturn.update({
        where: {
          id: inp.id,
        },
        data: {
          ackStatus: inp.storeReqAckStatus,
          acknowledgementBy: currentUser,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );

  logger.info(`exiting::acknowledgeStoreRequisition::repository`);
};
