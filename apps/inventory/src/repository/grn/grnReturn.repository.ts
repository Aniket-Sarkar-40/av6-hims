import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateGrnReturnInput,
  GoodReceivedReturnResponse,
  GrnReturnDetailInput,
  GrnReturnResponse,
} from "@/types/grn/grnReturn.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { RETURN_STS } from "@repo/db/generated/prisma/client";
import { subItemStock } from "../stock/stock.repository.js";
import { eventEmailService } from "@/services/master/emailConfig.service.js";

export const createGrnReturnInDb = async (input: CreateGrnReturnInput) => {
  logger.info("entering::createGrnReturnInDb::repository");

  const omittedGRNReturn = customOmit<
    CreateGrnReturnInput,
    "goodReceiveReturnDetails" | "id" | "isApproval" | "supplier"
  >(input, ["goodReceiveReturnDetails", "id", "isApproval", "supplier"]);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.$transaction(async (tx) => {
    const createdGrnReturn = await tx.invGoodReceiveReturn.create({
      data: {
        ...omittedGRNReturn.rest,
        date: new Date(omittedGRNReturn.rest.date),
        createdBy: currentUser,
        goodReceiveReturnDetails: {
          create: omittedGRNReturn.omitted.goodReceiveReturnDetails.map(
            (detail) => {
              const omittedGrnRetDet = customOmit<
                GrnReturnDetailInput,
                "id" | "purchasedPrice" | "inHandQty" | "isExpiry" | "isBatch"
              >(detail, [
                "id",
                "inHandQty",
                "purchasedPrice",
                "isBatch",
                "isExpiry",
              ]);
              return {
                ...omittedGrnRetDet.rest,
                expiryDate: omittedGrnRetDet.rest.expiryDate
                  ? new Date(omittedGrnRetDet.rest.expiryDate)
                  : null,
                createdBy: currentUser,
              };
            },
          ),
        },
      },
      include: {
        goodReceiveReturnDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    const supplier = omittedGRNReturn.omitted.supplier;

    if (supplier.isReturnEmail && supplier?.email) {
      const emailTemplate = await eventEmailService.getEventEmail();

      if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
        // sendTemplatedEmail({
        //   template: emailTemplate,
        //   to: [supplier.email],
        //   variables: {
        //     name: store.user.userName || "User",
        //     companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
        //     message: `Good Receive Return created.`,
        //     signature: `Aerial View-6 Pvt. Ltd.`,
        //   },
        // })
        //   .then(() => {
        //     logger.info("Email Sent Successfully.");
        //   })
        //   .catch((e) => logger.error(`Email Failed:: ${e.message} `));
        // TODO: Send notification
      }
    }

    return createdGrnReturn;
  });
};

export const updateGrnReturnInDb = async (input: CreateGrnReturnInput) => {
  logger.info("entering::updateGrnReturnInDb::repository");

  const omittedGRNReturn = customOmit<
    CreateGrnReturnInput,
    | "goodReceiveReturnDetails"
    | "grnReturn"
    | "id"
    | "ccId"
    | "isApproval"
    | "supplier"
  >(input, [
    "goodReceiveReturnDetails",
    "grnReturn",
    "id",
    "ccId",
    "isApproval",
    "supplier",
  ]);

  const { id, goodReceiveReturnDetails, grnReturn } = omittedGRNReturn.omitted;
  if (!id) {
    throw new Error("Cannot update a Good Receive Return without an id");
  }

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = goodReceiveReturnDetails.filter(
    (d) => typeof d.id === "number",
  );
  const toCreate = goodReceiveReturnDetails.filter(
    (d) => typeof d.id !== "number",
  );
  const toDelete = grnReturn.goodReceiveReturnDetails.filter(
    (d) => !goodReceiveReturnDetails.some((item) => item.id === d.id),
  );

  return await db.$transaction(async (tx) => {
    const updatedGrnReturn = await tx.invGoodReceiveReturn.update({
      where: { id },
      data: {
        ...omittedGRNReturn.rest,
        date: new Date(omittedGRNReturn.rest.date),
        updatedBy: currentUser,
        approvedBy: currentUser,
        updatedAt: new Date(),
        goodReceiveReturnDetails: {
          update: toUpdate.map((d) => {
            const omittedGrnRetDet = customOmit<
              GrnReturnDetailInput,
              "id" | "purchasedPrice" | "inHandQty" | "isExpiry" | "isBatch"
            >(d, ["id", "inHandQty", "purchasedPrice", "isBatch", "isExpiry"]);

            return {
              where: { id: omittedGrnRetDet.omitted.id },
              data: {
                ...omittedGrnRetDet.rest,
                expiryDate: omittedGrnRetDet.rest.expiryDate
                  ? new Date(omittedGrnRetDet.rest.expiryDate)
                  : null,
                updatedBy: currentUser,
              },
            };
          }),
          create: toCreate.map((d) => {
            const omittedGrnRetDet = customOmit<
              GrnReturnDetailInput,
              "id" | "purchasedPrice" | "inHandQty" | "isExpiry" | "isBatch"
            >(d, ["id", "inHandQty", "purchasedPrice", "isBatch", "isExpiry"]);
            return {
              ...omittedGrnRetDet.rest,
              expiryDate: omittedGrnRetDet.rest.expiryDate
                ? new Date(omittedGrnRetDet.rest.expiryDate)
                : null,

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
        goodReceiveReturnDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    return updatedGrnReturn;
  });
};

export const getCountGrnReturnDetailsFromDb = async (
  detailIds: number[],
  grnReturnId: number,
): Promise<number> => {
  logger.info("entering::getCountGrnReturnDetailsFromDb::repository");

  const count = await db.invGoodReceiveReturnDetails.count({
    where: {
      id: { in: detailIds },
      isActive: true,
      grnReturnId: grnReturnId,
    },
  });

  logger.info(`exit::getCountGrnReturnDetailsFromDb::found ${count} records`);
  return count;
};

export const getAllGrnReturnFromDb = async (): Promise<GrnReturnResponse[]> => {
  logger.info("entering::getAllGrnReturnFromDb::repository");

  const allGrnReturns = await db.invGoodReceiveReturn.findMany({
    where: { isActive: true },
    include: {
      goodReceiveReturnDetails: {
        where: { isActive: true },
      },
    },
  });

  logger.info("exiting::getAllGrnReturnFromDb::repository");
  return allGrnReturns;
};

export const getGrnReturnByIdFromDb = async (
  id: number,
): Promise<GoodReceivedReturnResponse | null> => {
  logger.info(`entering::getGrnReturnByIdFromDb::repository id=${id}`);

  const grnReturn = await db.invGoodReceiveReturn.findFirst({
    where: { id, isActive: true },
    include: {
      goodReceiveReturnDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });

  logger.info(`exiting::getGrnReturnByIdFromDb::repository id=${id}`);
  return grnReturn;
};

export const deleteGrnReturnFromDb = async (id: number) => {
  logger.info(`entering::deleteGrnReturnFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.invGoodReceiveReturn.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      goodReceiveReturnDetails: {
        updateMany: {
          where: { grnReturnId: id },
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
    `exiting::deleteGrnReturnFromDb::repository id=${id} (deletedBy=${currentUser})`,
  );
};

export const approvedGrnReturnInDb = async (input: CreateGrnReturnInput) => {
  logger.info("entering::approvedGrnReturnInDb::repository");

  const { id, goodReceiveReturnDetails, grnId, totalAmount, ...grnReturnData } =
    input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = goodReceiveReturnDetails.filter(
    (d) => typeof d.id === "number",
  );
  // const toCreate = goodReceiveReturnDetails.filter(
  //   (d) => typeof d.id !== "number"
  // );

  return await db.$transaction(async (tx) => {
    const updatedGrnReturn = await tx.invGoodReceiveReturn.update({
      where: { id },
      data: {
        approvedBy: currentUser,
        approveAt: new Date(),
        status: RETURN_STS.APPROVED,
        goodReceiveReturnDetails: {
          update: toUpdate.map((d) => ({
            where: { id: d.id! },
            data: {
              quantity: d.quantity,
              netAmount: d.netAmount,
              netTax: d.netTax,
              netDiscount: d.netDiscount,
              totalAmount: d.totalAmount,
              updatedBy: currentUser,
            },
          })),
        },
      },
      include: {
        goodReceiveReturnDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    for (const detail of goodReceiveReturnDetails) {
      await subItemStock(
        tx,
        {
          itemId: detail.itemId,
          quantity: Number(detail.quantity),
          batchNo: detail.batchNo ?? null,
          ccId: grnReturnData.ccId,
          expiryDate: detail.expiryDate ?? null,
          isFoc: false,
        },
        {
          operation: "GRN_RETURN_APPROVAL",
          refApprovedBy: currentUser,
          refDate: new Date(),
          refDetailsId: detail.id!,
          refId: id,
          refNo: grnReturnData.grnNumber,
        },
      );
    }

    await Promise.all(
      goodReceiveReturnDetails.map(async (detail) => {
        await tx.invGoodReceiveDetails.updateMany({
          where: {
            id: detail.grnDetailId,
            goodReceiveId: grnId,
            itemId: detail.itemId,
          },
          data: {
            returnQuantity: {
              increment: detail.quantity ?? 0,
            },
          },
        });
      }),
    );

    await tx.invGoodReceive.update({
      where: { id: grnId },
      data: {
        returnedAmount: {
          increment: totalAmount,
        },
      },
    });

    return updatedGrnReturn;
  });
};

export const rejectGrnReturnInDb = async (input: {
  id: number;
  grnId: number;
}) => {
  logger.info("entering::rejectGrnReturnInDb::repository");
  const { id, grnId } = input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const grnReturn = await db.invGoodReceiveReturn.findUnique({
    where: {
      id,
      grnId,
    },
  });

  if (!grnReturn) {
    throw new Error(`GRN with id ${id} and grnId ${grnId} not found`);
  }

  await db.invGoodReceiveReturn.update({
    where: {
      id,
      grnId,
    },
    data: {
      status: RETURN_STS.REJECTED,
      rejectedBy: currentUser,
      rejectedAt: new Date(),
    },
  });
};
