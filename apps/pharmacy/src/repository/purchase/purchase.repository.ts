import { uinServiceFactory } from "@/config/core.config.js";
import { settingsService } from "@/services/master/settings.service.js";
import {
  CreatePurchaseOrderInput,
  PurchaseReqExcelFilter,
} from "@/types/purchase/purchase.js";
import { db } from "@repo/db";
import {
  PmsPurchaseOrder,
  PmsPurchaseOrderDetails,
} from "@repo/db/generated/prisma/client";
import { PmsUinShortCode } from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared";
import { customOmit } from "av6-core";
import { applyRound, RoundFormat } from "av6-utils";

export const createPurchaseOrder = async (input: CreatePurchaseOrderInput) => {
  logger.info("entering::createPurchaseOrder::repository");

  // const { purchaseOrderDetails, ...purchaseOrderData } = input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const setting = await settingsService.getSettings();
  const precision = setting?.poPrecision ?? setting?.defaultPrecision ?? 2;
  const omittedPO = customOmit<
    CreatePurchaseOrderInput,
    "distributor" | "purchaseOrderDetails" | "po" | "warehouse"
  >(input, ["distributor", "purchaseOrderDetails", "po", "warehouse"]);

  return await db.$transaction(
    async (tx) => {
      const poUin = await uinServiceFactory.generateUIN(PmsUinShortCode.PO);

      const createdPurchaseOrder = await tx.pmsPurchaseOrder.create({
        data: {
          ...omittedPO.rest,
          grandTotal: applyRound(
            omittedPO.rest.grandTotal,
            RoundFormat.TO_FIXED,
            precision,
          ),
          poNumber: poUin,
          createdBy: currentUser,
          purchaseOrderDetails: {
            create: omittedPO.omitted.purchaseOrderDetails.map((detail) => ({
              uom: detail.uom,
              itemId: detail.itemId,
              itemCategoryId: detail.itemCategoryId,
              itemMedCategory: detail.itemMedCategory,
              medType: detail.medType,
              medComp: detail.medComp,
              medUnit: detail.medUnit,
              manufacturer: detail.manufacturer,
              packSize: detail.packSize,
              drugType: detail.drugType,
              medTypeId: detail.medTypeId,
              medCompId: detail.medCompId,
              medUnitId: detail.medUnitId,
              manufacturerId: detail.manufacturerId,
              packSizeId: detail.packSizeId,
              drugTypeId: detail.drugTypeId,
              mrp:
                detail.mrp !== undefined && detail.mrp !== null
                  ? applyRound(detail.mrp, RoundFormat.TO_FIXED, precision)
                  : null,
              purchasedPrice: applyRound(
                detail.purchasedPrice,
                RoundFormat.TO_FIXED,
                precision,
              ),
              packingQty: detail.packingQty,
              quantity: detail.quantity,
              receivedQty: detail.receivedQty,
              totalAmount: applyRound(
                detail.totalAmount,
                RoundFormat.TO_FIXED,
                precision,
              ),
              createdBy: currentUser,
            })),
          },
        },
        include: {
          purchaseOrderDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      const distributor = omittedPO.omitted.distributor;

      const feature = await featureFlagService.getFeatureFlagByShortCode(
        "PURCHASE_ORDER_NOTIFICATION",
        true,
      );
      if (distributor?.posEmail && feature?.isEnabled) {
        const emailTemplate = await emailConfigService.getEventEmail();

        // if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
        //   sendTemplatedEmail({
        //     template: emailTemplate,
        //     to: [distributor.dpEmail, distributor.proInEmail],
        //     variables: {
        //       name: store.user.userName || "User",
        //       companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
        //       message: `Purchase Order created.`,
        //       signature: `Aerial View-6 Pvt. Ltd.`,
        //     },
        //   })
        //     .then(() => {
        //       logger.info("Email Sent Successfully.");
        //     })
        //     .catch((e) => logger.error(`Email Failed:: ${e.message} `));
        // }

        // TODO: Send notification
      }

      // if (createdPurchaseOrder.status === "SENT_FOR_APPROVAL") {
      //   await approvalService.startFlow(tx, {
      //     service: "PHARMACY",
      //     subjectType: "PURCHASE_ORDER",
      //     subjectId: createdPurchaseOrder.id,
      //     refNo: createdPurchaseOrder.poNumber,
      //     netTotal: Number(createdPurchaseOrder.grandTotal),
      //     ccId: input.warehouseId,
      //     extra: {
      //       distributor: distributor?.proInName || null,
      //       cc: input.warehouse?.name || null,
      //     },
      //   });
      // }

      // TODO: Send approval flow

      return createdPurchaseOrder;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getPOByIdFromDb = async (id: number) => {
  logger.info("entering::getPOByIdFromDb::repository");
  return db.pmsPurchaseOrder.findUnique({
    where: { id, isActive: true },
    include: {
      purchaseOrderDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const updatePurchaseOrderInDb = async (
  input: CreatePurchaseOrderInput,
) => {
  logger.info("entering::updatePurchaseOrder::repository");

  if (!input.id) {
    throw new Error("Cannot update a PurchaseOrder without an id");
  }

  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const precision = setting?.poPrecision ?? setting?.poPrecision ?? 2;

  const omittedPO = customOmit<
    CreatePurchaseOrderInput,
    "distributor" | "purchaseOrderDetails" | "id" | "po" | "warehouse"
  >(input, ["distributor", "purchaseOrderDetails", "id", "po", "warehouse"]);

  const toUpdate = omittedPO.omitted.purchaseOrderDetails.filter(
    (d) => typeof d.id === "number",
  );
  const toCreate = omittedPO.omitted.purchaseOrderDetails.filter(
    (d) => typeof d.id !== "number",
  );
  const toDelete = omittedPO.omitted.po.purchaseOrderDetails.filter(
    (d) =>
      !omittedPO.omitted.purchaseOrderDetails.some(
        (detail) => detail.id === d.id,
      ),
  );

  return await db.$transaction(async (tx) => {
    const updated = await tx.pmsPurchaseOrder.update({
      where: { id: omittedPO.omitted.id },
      data: {
        ...omittedPO.rest,
        grandTotal: applyRound(
          omittedPO.rest.grandTotal,
          RoundFormat.TO_FIXED,
          precision,
        ),
        updatedBy: store?.user?.id,
        purchaseOrderDetails: {
          update: toUpdate.map((d) => ({
            where: { id: d.id! },
            data: {
              itemId: d.itemId,
              uom: d.uom,
              itemCategoryId: d.itemCategoryId,
              mrp:
                d.mrp !== undefined && d.mrp !== null
                  ? applyRound(d.mrp, RoundFormat.TO_FIXED, precision)
                  : null,
              purchasedPrice: applyRound(
                d.purchasedPrice,
                RoundFormat.TO_FIXED,
                precision,
              ),
              packingQty: d.packingQty,
              quantity: d.quantity,
              totalAmount: applyRound(
                d.totalAmount,
                RoundFormat.TO_FIXED,
                precision,
              ),
              updatedBy: store?.user?.id,
            },
          })),
          create: toCreate.map((d) => ({
            uom: d.uom,
            itemId: d.itemId,
            itemCategoryId: d.itemCategoryId,
            itemMedCategory: d.itemMedCategory,
            medType: d.medType,
            medComp: d.medComp,
            medUnit: d.medUnit,
            manufacturer: d.manufacturer,
            packSize: d.packSize,
            drugType: d.drugType,
            medTypeId: d.medTypeId,
            medCompId: d.medCompId,
            medUnitId: d.medUnitId,
            manufacturerId: d.manufacturerId,
            packSizeId: d.packSizeId,
            drugTypeId: d.drugTypeId,
            mrp:
              d.mrp !== undefined && d.mrp !== null
                ? applyRound(d.mrp, RoundFormat.TO_FIXED, precision)
                : null,
            purchasedPrice: applyRound(
              d.purchasedPrice,
              RoundFormat.TO_FIXED,
              precision,
            ),
            packingQty: d.packingQty,
            quantity: d.quantity,
            receivedQty: d.receivedQty,
            totalAmount: applyRound(
              d.totalAmount,
              RoundFormat.TO_FIXED,
              precision,
            ),
            updatedBy: store?.user?.id,
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
              deletedBy: store?.user?.id,
            },
          },
        },
      },
      include: {
        purchaseOrderDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    const distributor = omittedPO.omitted.distributor;

    if (distributor?.posEmail) {
      const emailTemplate = await emailConfigService.getEventEmail();
      const feature = await featureFlagService.getFeatureFlagByShortCode(
        "PURCHASE_ORDER_NOTIFICATION",
        true,
      );
      // if (emailTemplate && emailTemplate.emailBody && store?.user?.email && feature?.isEnabled) {
      //   sendTemplatedEmail({
      //     template: emailTemplate,
      //     to: [distributor.dpEmail, distributor.proInEmail],
      //     variables: {
      //       name: store.user.userName || "User",
      //       companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
      //       message: `Purchase Order created.`,
      //       signature: `Aerial View-6 Pvt. Ltd.`,
      //     },
      //   })
      //     .then(() => {
      //       logger.info("Email Sent Successfully.");
      //     })
      //     .catch((e) => logger.error(`Email Failed:: ${e.message} `));
      // }

      // TODO: Send notification
    }

    // if (updated.status === "SENT_FOR_APPROVAL") {
    //   await approvalService.startFlow(tx, {
    //     service: "PHARMACY",
    //     subjectType: "PURCHASE_ORDER",
    //     subjectId: updated.id,
    //     refNo: updated.poNumber,
    //     netTotal: Number(updated.grandTotal),
    //     ccId: input.warehouseId,
    //     extra: {
    //       distributor: distributor?.proInName || null,
    //       cc: input.warehouse?.name || null,
    //     },
    //   });
    // }

    // TODO: Send approval flow

    return updated;
  });
};

export const getCountPODetailsFromDb = async (
  detailIds: number[],
  purchaseOrderId: number,
): Promise<number> => {
  return db.pmsPurchaseOrderDetails.count({
    where: {
      id: { in: detailIds },
      isActive: true,
      purchaseId: purchaseOrderId,
    },
  });
};

export const getAllPurchaseFromDb = async (): Promise<
  (PmsPurchaseOrder & { purchaseOrderDetails: PmsPurchaseOrderDetails[] })[]
> => {
  logger.info("entering::getAllPurchaseFromDb::repository");
  const allPOs = await db.pmsPurchaseOrder.findMany({
    where: { isActive: true },
    include: {
      purchaseOrderDetails: {
        where: { isActive: true },
      },
    },
  });
  logger.info("exiting::getAllPurchaseFromDb::repository");
  return allPOs;
};

export const getPurchaseByIdFromDb = async (
  id: number,
): Promise<
  | (PmsPurchaseOrder & { purchaseOrderDetails: PmsPurchaseOrderDetails[] })
  | null
> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository id=${id}`);
  const po = await db.pmsPurchaseOrder.findUnique({
    where: { id, isActive: true },
    include: {
      purchaseOrderDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info(`exiting::getPurchaseByIdFromDb::repository id=${id}`);
  return po;
};

export const deletePurchaseOrderFromDb = async (id: number): Promise<void> => {
  logger.info(`entering::deletePurchaseOrderFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.pmsPurchaseOrder.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      purchaseOrderDetails: {
        updateMany: {
          where: { purchaseId: id },
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
    `exiting::deletePurchaseOrderFromDb::repository id=${id} (deletedBy=${currentUser})`,
  );
};

// export async function purchaseApprovalInDb(id: number, level: "level1" | "level2", approverId: number) {
//   logger.info("entering::updatePurchaseOrderVerification::repository");

//   const data: PurchaseOrderApprovalInput = {};

//   if (level === "level1") {
//     data.verifiedBy1 = approverId;
//     data.verifiedAt1 = new Date();
//   }
//   if (level === "level2") {
//     data.verifiedBy2 = approverId;
//     data.verifiedAt2 = new Date();
//   }

//   await db.purchaseOrder.update({
//     where: { id },
//     data: {
//       ...data,
//       status: "verifiedBy2" in data ? "APPROVED" : "PARTIALLY_APPROVED",
//     },
//   });

//   logger.info("exiting::updatePurchaseOrderVerification::repository");
// }

export const rejectPurchaseOrderInDb = async (
  id: number,
  approverId: number,
) => {
  logger.info("entering::rejectPurchaseOrderInDb::repository");
  await db.pmsPurchaseOrder.update({
    where: { id },
    data: {
      status: "REJECTED",
      deletedBy: approverId,
      deletedAt: new Date(),
    },
  });
  logger.info("exiting::rejectPurchaseOrderInDb::repository");
};

export const getPOByNumberFromDb = async (
  poNumber: string,
): Promise<
  | (PmsPurchaseOrder & { purchaseOrderDetails: PmsPurchaseOrderDetails[] })
  | null
> => {
  logger.info(`entering::getPOByNumberFromDb::repository poNumber=${poNumber}`);

  return db.pmsPurchaseOrder.findFirst({
    where: {
      poNumber,
      isActive: true,
    },
    include: {
      purchaseOrderDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getPurchasesFromDb = async (
  input: PurchaseReqExcelFilter,
): Promise<
  (PmsPurchaseOrder & { purchaseOrderDetails: PmsPurchaseOrderDetails[] })[]
> => {
  logger.info(`entering::getPurchasesFromDb::repository`);
  return db.pmsPurchaseOrder.findMany({
    where: {
      id: input.id,
      poNumber: input.poNumber,
      date: {
        gte: input.startDate ? new Date(input.startDate) : undefined,
        lte: input.endDate ? new Date(input.endDate) : undefined,
      },
      warehouseId: input.warehouseId,
      distributorId: input.distributorId,
      storageId: input.storageId,
      status: input.status,
      isActive: true,
    },
    include: {
      purchaseOrderDetails: {
        where: { isActive: true },
      },
    },
  });
};
