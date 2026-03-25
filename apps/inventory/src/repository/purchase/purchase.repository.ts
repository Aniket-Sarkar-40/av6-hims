import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { eventEmailService } from "@/services/master/emailConfig.service.js";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrder,
} from "@/types/purchase/purchase.js";
import { applyRound } from "av6-utils";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  InvPurchaseOrder,
  InvPurchaseOrderDetails,
  RoundFormat,
  InvUinShortCode,
} from "@repo/db/generated/prisma/client";

export const createPurchaseOrder = async (input: CreatePurchaseOrderInput) => {
  logger.info("entering::createPurchaseOrder::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? 1;
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;
  const omittedPO = customOmit<
    CreatePurchaseOrderInput,
    "supplier" | "purchaseOrderDetails"
  >(input, ["purchaseOrderDetails", "supplier"]);

  const poUin = await uinServiceFactory.generateUIN(InvUinShortCode.PO);

  const poCreate = await db.$transaction(async (tx) => {
    const createdPurchaseOrder = await tx.invPurchaseOrder.create({
      data: {
        ...omittedPO.rest,
        poNumber: poUin,
        createdBy: currentUser,
        purchaseOrderDetails: {
          create: omittedPO.omitted.purchaseOrderDetails.map((detail) => ({
            ...detail,
            purchasedPrice: applyRound(
              detail.purchasedPrice,
              RoundFormat.TO_FIXED,
              precision,
            ),
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

    return createdPurchaseOrder;
  });

  const supplier = omittedPO.omitted.supplier;

  if (supplier?.isPoEmail && supplier.email) {
    const emailTemplate = await eventEmailService.getEventEmail();

    if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
      // sendTemplatedEmail({
      //   template: emailTemplate,
      //   to: [supplier.email],
      //   variables: {
      //     name: store.user.userName || "User",
      //     companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
      //     message: `Po Created.`,
      //     signature: `Aerial View-6 Pvt. Ltd.`,
      //   },
      // })
      //   .then(() => {
      //     logger.info("Email Sent Successfully.");
      //   })
      //   .catch((e: Error) => logger.error(`Email Failed:: ${e.message} `));
      // TODO: Send notification
    }
  }

  return poCreate;
};

export const getPOByIdFromDb = async (id: number) => {
  logger.info("entering::getPOByIdFromDb::repository");
  return db.invPurchaseOrder.findUnique({
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

export const updatePurchaseOrderInDb = async (input: UpdatePurchaseOrder) => {
  logger.info("entering::updatePurchaseOrder::repository");

  if (!input.id) {
    throw new Error("Cannot update a PurchaseOrder without an id");
  }

  const store = requestStorage.getStore();
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;

  const omittedPO = customOmit<
    UpdatePurchaseOrder,
    "supplier" | "purchaseOrderDetails" | "id" | "po"
  >(input, ["supplier", "purchaseOrderDetails", "id", "po"]);

  const incomingDetails = omittedPO.omitted.purchaseOrderDetails;
  const existingDetails = await db.invPurchaseOrderDetails.findMany({
    where: { purchaseId: omittedPO.omitted.id, isActive: true },
    select: { id: true, itemId: true },
  });

  const existingIds = new Set(existingDetails.map((d) => d.id));
  const toUpdate = incomingDetails.filter(
    (d) => d.id != null && existingIds.has(d.id),
  );
  const toCreate = incomingDetails.filter(
    (d) => d.id == null || !existingIds.has(d.id),
  );
  const toDelete = omittedPO.omitted.purchaseOrderDetails.filter(
    (d) => !incomingDetails.some((detail) => detail.id === d.id),
  );

  const toDeleteIds = toDelete
    .map((d) => d.id)
    .filter((id): id is number => typeof id === "number");
  const updated = await db.invPurchaseOrder.update({
    where: { id: omittedPO.omitted.id },
    data: {
      ...omittedPO.rest,
      updatedBy: store?.user?.id,
      purchaseOrderDetails: {
        update: toUpdate.map((d) => ({
          where: { id: d.id! },
          data: {
            itemId: d.itemId,
            packingQty: d.packingQty,
            quantity: d.quantity,
            purchasedPrice: applyRound(
              d.purchasedPrice,
              RoundFormat.TO_FIXED,
              precision,
            ),
            totalAmount: applyRound(
              d.totalAmount,
              RoundFormat.TO_FIXED,
              precision,
            ),
            updatedBy: store?.user?.id,
          },
        })),
        create: toCreate.map((d) => ({
          itemId: d.itemId,
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
          createdBy: store?.user?.id,
        })),
        updateMany:
          toDeleteIds.length > 0
            ? {
                where: {
                  id: {
                    in: toDeleteIds,
                  },
                },
                data: {
                  isActive: false,
                  deletedAt: new Date(),
                  deletedBy: store?.user?.id,
                },
              }
            : undefined,
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

  return updated;
};

export const getCountPODetailsFromDb = async (
  detailIds: number[],
  purchaseOrderId: number,
): Promise<number> => {
  return db.invPurchaseOrderDetails.count({
    where: {
      id: { in: detailIds },
      isActive: true,
      purchaseId: purchaseOrderId,
    },
  });
};

export const getAllPurchaseFromDb = async (): Promise<
  (InvPurchaseOrder & { purchaseOrderDetails: InvPurchaseOrderDetails[] })[]
> => {
  logger.info("entering::getAllPurchaseFromDb::repository");
  const allPOs = await db.invPurchaseOrder.findMany({
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
  | (InvPurchaseOrder & {
      purchaseOrderDetails: (InvPurchaseOrderDetails & {
        item: { item: string };
      })[];
    })
  | null
> => {
  logger.info(`entering::getPurchaseByIdFromDb::repository id=${id}`);
  const po = await db.invPurchaseOrder.findUnique({
    where: { id, isActive: true },
    include: {
      purchaseOrderDetails: {
        where: {
          isActive: true,
        },
        include: {
          item: {
            select: { item: true },
          },
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

  await db.invPurchaseOrder.update({
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

// export async function purchaseApprovalInDb(id: number, data: PurchaseOrderApprovalInput) {
//   logger.info("entering::updatePurchaseOrderVerification::repository");

//   const store = requestStorage.getStore();
//   const userName = store?.user?.id;

//   if ("verifiedBy1" in data) data.verifiedBy1 = userName;
//   if ("verifiedBy2" in data) data.verifiedBy2 = userName;

//   await db.purchaseOrder.update({
//     where: { id },
//     data,
//   });

//   logger.info("exiting::updatePurchaseOrderVerification::repository");
// }

export const getPOByNumberFromDb = async (
  poNumber: string,
): Promise<
  | (InvPurchaseOrder & { purchaseOrderDetails: InvPurchaseOrderDetails[] })
  | null
> => {
  logger.info(`entering::getPOByNumberFromDb::repository poNumber=${poNumber}`);

  return db.invPurchaseOrder.findFirst({
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
