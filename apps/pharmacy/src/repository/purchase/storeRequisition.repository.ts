import {
  AcknowledgeRequisition,
  ApproveStoreReqInput,
  CreateStoreRequisitionInput,
  RejectStoreRequisitionInput,
  StoreReqBatchWiseResponse,
  StoreReqExcelFilter,
  StoreRequisitionDetailInput,
  StoreRequisitionResponse,
  StoreReqValResponse,
  ValStoreRequisitionResponse,
} from "@/types/purchase/storeRequisition.js";

import {
  addInTransitStock,
  subInTransitStock,
} from "../inTransitStock/inTransitStock.repository.js";
import { addItemStock, subItemStock } from "../stock/stock.repository.js";
import { uinServiceFactory } from "@/config/core.config.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-core";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { PmsUinShortCode } from "@repo/db/generated/prisma/enums.js";
import { API_TIMEOUT } from "@repo/shared";
import { PmsRequisitionItemDetails } from "@repo/db/generated/prisma/client";
import { emailConfigService } from "@/services/master/emailConfig.service.js";
import { featureFlagService } from "@/services/feature/feature.service.js";

export const createStoreRequisitionInDb = async (
  input: CreateStoreRequisitionInput
) => {
  logger.info("entering::createStoreRequisition::repository");

  const omittedInput = customOmit<
    CreateStoreRequisitionInput,
    "storeRequisitionDetails" | "ccId" | "storeReq"
  >(input, ["storeRequisitionDetails", "ccId", "storeReq"]);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.$transaction(
    async (tx) => {
      const srUin = await uinServiceFactory.generateUIN(PmsUinShortCode.SRN);

      // Filter out unwanted fields from storeRequisitionDetails
      const filteredStoreRequisitionDetails =
        omittedInput.omitted.storeRequisitionDetails.map((detail) => {
          const omittedRes = customOmit<
            StoreRequisitionDetailInput,
            "warehouseInHandStock" | "branchInHandStock"
          >(detail, ["warehouseInHandStock", "branchInHandStock"]);

          return omittedRes.rest;
        });
      const createdStoreRequisition = await tx.pmsStoreRequisition.create({
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

      const emailTemplate = await emailConfigService.getEventEmail();
      const feature = await featureFlagService.getFeatureFlagByShortCode(
        "STORE_REQ_NOTIFICATION",
        true
      );
      // if (emailTemplate && emailTemplate.emailBody && store?.user?.email && feature?.isEnabled) {
      //   sendTemplatedEmail({
      //     template: emailTemplate,
      //     to: [store?.user?.email],
      //     variables: {
      //       name: store?.user?.userName || "User",
      //       companyDetails: "Aerial View-6",
      //       message: `Store Requisition created.`,
      //       signature: `Aerial View-6 Pvt. Ltd.`,
      //     },
      //   })
      //     .then(() => {
      //       logger.info("Email Sent Successfully.");
      //     })
      //     .catch((e) => logger.error(`Email Failed:: ${e.message} `));
      // }

      // TODO: Send notification

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

  // const { id, storeRequisitionDetails, ...storeRequisitionData } = input;
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
  const toDelete = omittedInput.omitted.storeReq.storeRequisitionDetails.filter(
    (d) =>
      !omittedInput.omitted.storeRequisitionDetails.some(
        (item) => item.id === d.id
      )
  );

  return await db.$transaction(
    async (tx) => {
      const updated = await tx.pmsStoreRequisition.update({
        where: { id },
        data: {
          ...storeRequisitionData,
          updatedBy: currentUser,
          storeRequisitionDetails: {
            update: toUpdate.map((d) => {
              const omittedDetail = customOmit<
                StoreRequisitionDetailInput,
                "warehouseInHandStock" | "branchInHandStock"
              >(d, ["branchInHandStock", "warehouseInHandStock"]);

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
                "warehouseInHandStock" | "branchInHandStock" | "id"
              >(d, ["branchInHandStock", "warehouseInHandStock", "id"]);
              return {
                ...omittedDetail.rest,
                createdBy: currentUser,
              };
            }),
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
          storeRequisitionDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

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
  return db.pmsStoreRequisitionDetails.count({
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
  const allStoreReq = await db.pmsStoreRequisition.findMany({
    where: { isActive: true },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
      staff: true,
    },
  });
  logger.info("exiting::getAllStoreRequisitionFromDb::repository");
  return allStoreReq;
};

export const getStoreRequisitionByIdFromDb = async (
  id: number
): Promise<StoreRequisitionResponse | null> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository id=${id}`);
  const storeReq = await db.pmsStoreRequisition.findUnique({
    where: { id, isActive: true },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
      staff: true,
    },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository id=${id}`);
  return storeReq;
};

export const validateStoreRequisitionByIdFromDb = async (
  id: number
): Promise<ValStoreRequisitionResponse | null> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository id=${id}`);
  const storeReq = await db.pmsStoreRequisition.findUnique({
    where: { id, isActive: true },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
    },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository id=${id}`);
  return storeReq;
};

export const deleteStoreRequisitionFromDb = async (id: number) => {
  logger.info(`entering::deleteStoreRequisitionFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.pmsStoreRequisition.update({
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

  logger.info(
    `exiting::deleteStoreRequisitionFromDb::repository id=${id} (deletedBy=${currentUser})`
  );
};

export const rejectStoreRequisition = async (
  inp: RejectStoreRequisitionInput
) => {
  logger.info(`entering::rejectStoreRequisition::repository id=${inp.id}`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.$transaction(
    async (tx) => {
      await tx.pmsStoreRequisition.update({
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

  logger.info(`exiting::rejectStoreRequisition::repository id=${inp.id}`);
};

export const approveStoreRequisition = async (inp: ApproveStoreReqInput) => {
  logger.info(`entering::approveStoreRequisition::repository`);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.$transaction(
    async (tx) => {
      await tx.pmsRequisitionItemDetails.createMany({
        data: inp.assignItems.map((details) => ({
          storeRequisitionId: inp.storeReqId,
          ...details,
          expiryDate: details.expiryDate
            ? new Date(details.expiryDate)
            : undefined,
          ccId: inp.ccId,
          createdBy: currentUser,
        })),
      });

      const assignItems = inp.assignItems;

      const result = Object.values(
        assignItems.reduce(
          (
            acc: Record<
              number,
              { storeRequisitionDetailsId: number; assignQty: number }
            >,
            item
          ) => {
            const id = item.storeRequisitionDetailsId;
            if (!acc[id]) {
              acc[id] = { storeRequisitionDetailsId: id, assignQty: 0 };
            }
            acc[id].assignQty += item.assignedQty;
            return acc;
          },
          {}
        )
      );

      for (const element of result) {
        await tx.pmsStoreRequisitionDetails.update({
          where: {
            id: element.storeRequisitionDetailsId,
          },
          data: {
            assignedQuantity: {
              increment: element.assignQty,
            },
          },
        });
      }

      await tx.pmsStoreRequisition.update({
        where: {
          id: inp.storeReqId,
        },
        data: {
          storeReqStatus: inp.storeReqStatus,
          storeReqAckStatus: inp.storeReqAckStatus,
          approvedAt: new Date(),
          approvedBy: currentUser,
        },
      });

      for (const detail of inp.assignItems) {
        await subItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: detail.assignedQty,
            batchNo: detail.batchNo,
            warehouseId: inp.ccId,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          },
          {
            operation: "STORE_REQUISITION",
            refApprovedBy: currentUser,
            refDate: new Date(),
            refDetailsId: detail.storeRequisitionDetailsId,
            refId: inp.storeReqId,
            refNo: inp.storeReqNo,
            refApprovedAt: new Date(),
          }
        );

        await addInTransitStock(
          tx,
          {
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate
              ? new Date(detail.expiryDate)
              : undefined,
            isFoc: detail.isFoc,
            itemId: detail.itemId,
            quantity: detail.assignedQty,
            fromId: inp.storeReq.warehouseId,
            toId: inp.storeReq.branchId,
          },
          {
            operation: "STORE_REQUISITION",
            refApprovedBy: currentUser,
            refDate: new Date(),
            refDetailsId: detail.storeRequisitionDetailsId,
            refId: inp.storeReqId,
            refNo: inp.storeReqNo,
            refApprovedAt: new Date(),
          }
        );
      }
    },
    {
      timeout: API_TIMEOUT,
    }
  );

  logger.info(`exiting::approveStoreRequisition::repository`);
};

export const acknowledgeStoreRequisition = async (
  inp: AcknowledgeRequisition
) => {
  logger.info(`entering::approveStoreRequisition::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(
    async (tx) => {
      for (const detail of inp.acknowledgeItems) {
        for (const item of detail.itemBatch) {
          await tx.pmsRequisitionItemDetails.update({
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
              branchId: inp.ccId,
              batchNo: item.batchNo,
              expiryDate: item.expiryDate,
              isFoc: item.isFoc,
            },
            {
              operation: "STORE_REQUISITION",
              refDate: new Date(),
              refDetailsId: detail.storeRequisitionDetailsId,
              refId: inp.storeReqId,
              refNo: inp.storeReqNo,
            }
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
              fromId: inp.storeReq.warehouseId,
              toId: inp.storeReq.branchId,
            },
            {
              operation: "STORE_REQUISITION",
              refDate: new Date(),
              refDetailsId: detail.storeRequisitionDetailsId,
              refId: inp.storeReqId,
              refNo: inp.storeReqNo,
            }
          );
        }

        await tx.pmsStoreRequisitionDetails.update({
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

      await tx.pmsStoreRequisition.update({
        where: {
          id: inp.storeReqId,
        },
        data: {
          storeReqAckStatus: inp.storeReqAckStatus,
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
): Promise<PmsRequisitionItemDetails | null> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository id=${id}`);
  const storeReq = await db.pmsRequisitionItemDetails.findUnique({
    where: { id, isActive: true },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository id=${id}`);
  return storeReq;
};

export const getStoreRequisitionBatchWiseFromDb = async (
  id: number
): Promise<StoreReqBatchWiseResponse | null> => {
  logger.info(
    `entering::getStoreRequisitionBatchWiseFromDb::repository id=${id}`
  );
  const storeReq = await db.pmsStoreRequisition.findUnique({
    where: { id, isActive: true },
    include: {
      requisitionItemDetails: {
        where: {
          isActive: true,
          isCompleted: false,
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

export const valStoreRequisitionBatchWiseFromDb = async (
  id: number
): Promise<StoreReqBatchWiseResponse | null> => {
  logger.info(
    `entering::getStoreRequisitionBatchWiseFromDb::repository id=${id}`
  );
  const storeReq = await db.pmsStoreRequisition.findUnique({
    where: { id, isActive: true },
    include: {
      requisitionItemDetails: {
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
  const storeReq = await db.pmsStoreRequisition.findUnique({
    where: { id, isActive: true },
    include: {
      requisitionItemDetails: {
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

export const getItemRequisitionDetails = async (
  itemId: number,
  location: { storeRequisitionId?: number; storeRequisitionDetailsId?: number },
  batchNo: string,
  expiryDate?: Date | null
) => {
  logger.info(`entering::getItemStockByBatchWise::repository`);

  const requisitionDetail = await db.pmsRequisitionItemDetails.findFirst({
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

export const getStoreReqForExcelInDb = async (
  input: StoreReqExcelFilter
): Promise<StoreRequisitionResponse[]> => {
  logger.info(`entering::getStoreReqForExcelInDb::repository`);
  return db.pmsStoreRequisition.findMany({
    where: {
      id: input.id,
      requisitionFrom: input.staffId,
      branchId: input.branchId,
      warehouseId: input.warehouseId,
      date: {
        lte: input.endDate ? new Date(input.endDate) : undefined,
        gte: input.startDate ? new Date(input.startDate) : undefined,
      },
      storeReqStatus: input.storeReqStatus,
      storeReqAckStatus: input.storeReqAckStatus,
    },
    orderBy: {
      date: "desc",
    },
    include: {
      storeRequisitionDetails: {
        where: { isActive: true },
      },
      staff: true,
    },
  });
};
