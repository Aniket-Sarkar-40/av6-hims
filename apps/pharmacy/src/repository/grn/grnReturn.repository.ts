import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateGrnReturnDetailsInput,
  CreateGrnReturnInput,
  GoodReceivedReturnResponse,
  GrnReturnReqExcelFilter,
  GrnReturnResponse,
} from "@/types/grn/grnReturn.js";

import { API_TIMEOUT } from "@repo/shared";
import { RETURN_STS } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-core-v2";
import { subItemStock } from "../stock/stock.repository.js";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { emailConfigService } from "@/services/master/emailConfig.service.js";

export const createGrnReturnInDb = async (input: CreateGrnReturnInput) => {
  logger.info("entering::createGrnReturnInDb::repository");

  const omittedGRNReturn = customOmit<
    CreateGrnReturnInput,
    "distributor" | "goodReceiveReturnDetails" | "grnReturn" | "ccId"
  >(input, ["distributor", "goodReceiveReturnDetails", "grnReturn", "ccId"]);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const createdGrnReturn = await tx.pmsGoodReceiveReturn.create({
        data: {
          ...omittedGRNReturn.rest,
          createdBy: currentUser,
          approvedBy: currentUser,
          goodReceiveReturnDetails: {
            create: omittedGRNReturn.omitted.goodReceiveReturnDetails.map(
              (detail) => {
                const omittedGrnRetDet = customOmit<
                  CreateGrnReturnDetailsInput,
                  "id" | "purchasedPrice" | "inHandQty" | "grnDetailsId"
                >(detail, [
                  "id",
                  "purchasedPrice",
                  "inHandQty",
                  "grnDetailsId",
                ]);
                return {
                  ...omittedGrnRetDet.rest,
                  grnDetailId: omittedGrnRetDet.omitted.grnDetailsId,
                  createdBy: currentUser,
                };
              }
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

      const distributor = omittedGRNReturn.omitted.distributor;

      const feature = await featureFlagService.getFeatureFlagByShortCode(
        "GRN_RETURN_NOTIFICATION",
        true
      );
      if (distributor?.returnEmail) {
        const emailTemplate = await emailConfigService.getEventEmail();
        // if (emailTemplate && emailTemplate.emailBody && store?.user?.email && feature?.isEnabled) {
        //   sendTemplatedEmail({
        //     template: emailTemplate,
        //     to: [distributor.dpEmail, distributor.proInEmail],
        //     variables: {
        //       name: store.user.userName || "User",
        //       companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
        //       message: `Good Receive Return created.`,
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

      return createdGrnReturn;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const updateGrnReturnInDb = async (input: CreateGrnReturnInput) => {
  logger.info("entering::updateGrnReturnInDb::repository");

  const omittedGRNReturn = customOmit<
    CreateGrnReturnInput,
    "distributor" | "goodReceiveReturnDetails" | "grnReturn" | "id" | "ccId"
  >(input, [
    "distributor",
    "goodReceiveReturnDetails",
    "grnReturn",
    "id",
    "ccId",
  ]);

  const { id, goodReceiveReturnDetails, grnReturn } = omittedGRNReturn.omitted;
  if (!id) {
    throw new Error("Cannot update a Good Receive Return without an id");
  }

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = goodReceiveReturnDetails.filter(
    (d) => typeof d.id === "number"
  );
  const toCreate = goodReceiveReturnDetails.filter(
    (d) => typeof d.id !== "number"
  );
  const toDelete = grnReturn.goodReceiveReturnDetails.filter(
    (d) => !goodReceiveReturnDetails.some((item) => item.id === d.id)
  );

  return await db.$transaction(
    async (tx) => {
      const updatedGrnReturn = await tx.pmsGoodReceiveReturn.update({
        where: { id },
        data: {
          ...omittedGRNReturn.rest,
          updatedBy: currentUser,
          approvedBy: currentUser,
          updatedAt: new Date(),
          goodReceiveReturnDetails: {
            update: toUpdate.map((d) => {
              const omittedGrnRetDet = customOmit<
                CreateGrnReturnDetailsInput,
                "id" | "purchasedPrice" | "inHandQty" | "grnDetailsId"
              >(d, ["id", "purchasedPrice", "inHandQty", "grnDetailsId"]);

              return {
                where: { id: omittedGrnRetDet.omitted.id },
                data: {
                  ...omittedGrnRetDet.rest,
                  grnDetailId: omittedGrnRetDet.omitted.grnDetailsId,
                  updatedBy: currentUser,
                },
              };
            }),
            create: toCreate.map((d) => {
              const omittedGrnRetDet = customOmit<
                CreateGrnReturnDetailsInput,
                "id" | "purchasedPrice" | "inHandQty" | "grnDetailsId"
              >(d, ["id", "purchasedPrice", "inHandQty", "grnDetailsId"]);
              return {
                ...omittedGrnRetDet.rest,
                grnDetailId: omittedGrnRetDet.omitted.grnDetailsId,
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
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const getCountGrnReturnDetailsFromDb = async (
  detailIds: number[],
  grnReturnId: number
): Promise<number> => {
  logger.info("entering::getCountGrnReturnDetailsFromDb::repository");

  const count = await db.pmsGoodReceiveReturnDetails.count({
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

  const allGrnReturns = await db.pmsGoodReceiveReturn.findMany({
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
  id: number
): Promise<GoodReceivedReturnResponse | null> => {
  logger.info(`entering::getGrnReturnByIdFromDb::repository id=${id}`);

  const grnReturn = await db.pmsGoodReceiveReturn.findFirst({
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

  await db.pmsGoodReceiveReturn.update({
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
    `exiting::deleteGrnReturnFromDb::repository id=${id} (deletedBy=${currentUser})`
  );
};

export const approvedGrnReturnInDb = async (input: CreateGrnReturnInput) => {
  logger.info("entering::approvedGrnReturnInDb::repository");

  const { id, goodReceiveReturnDetails, grnId, totalAmount, ...grnReturnData } =
    input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = goodReceiveReturnDetails.filter(
    (d) => typeof d.id === "number"
  );
  // const toCreate = goodReceiveReturnDetails.filter(
  //   (d) => typeof d.id !== "number"
  // );

  return await db.$transaction(
    async (tx) => {
      const updatedGrnReturn = await tx.pmsGoodReceiveReturn.update({
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
            quantity: detail.quantity,
            batchNo: detail.batchNo,
            warehouseId: grnReturnData.ccId,
            expiryDate: detail.expiryDate,
            isFoc: false,
          },
          {
            operation: "GRN_RETURN_APPROVAL",
            refApprovedBy: currentUser,
            refDate: new Date(),
            refDetailsId: detail.id!,
            refId: id,
            refNo: grnReturnData.grnNumber,
          }
        );
      }

      await Promise.all(
        goodReceiveReturnDetails.map(async (detail) => {
          await tx.pmsGoodReceiveDetails.updateMany({
            where: {
              id: detail.grnDetailsId,
              goodReceiveId: grnId,
              itemId: detail.itemId,
            },
            data: {
              returnQuantity: {
                increment: detail.quantity ?? 0,
              },
            },
          });
        })
      );

      await tx.pmsGoodReceive.update({
        where: { id: grnId },
        data: {
          returnedAmount: {
            increment: totalAmount,
          },
        },
      });

      return updatedGrnReturn;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const rejectGrnReturnInDb = async (input: {
  id: number;
  grnId: number;
}) => {
  logger.info("entering::rejectGrnReturnInDb::repository");
  const { id, grnId } = input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const grnReturn = await db.pmsGoodReceiveReturn.findUnique({
    where: {
      id,
      grnId,
    },
  });

  if (!grnReturn) {
    throw new Error(`GRN with id ${id} and grnId ${grnId} not found`);
  }

  await db.pmsGoodReceiveReturn.update({
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

export const getGrnReturnForExcelInDb = async (
  input: GrnReturnReqExcelFilter
): Promise<GrnReturnResponse[]> => {
  logger.info("entering::getGrnReturnForExcelInDb::repository");
  const results = await db.pmsGoodReceiveReturn.findMany({
    where: {
      id: input.id,
      grnId: input.grnId,
      grnNumber: input.grnNumber,
      poNumber: input.poNumber,
      date: {
        gte: input.startDate ? new Date(input.startDate) : undefined,
        lte: input.endDate ? new Date(input.endDate) : undefined,
      },
      warehouseId: input.warehouseId,
      distributorId: input.distributorId,
      status: input.status,
      paymentStatus: input.paymentStatus,
      isActive: true,
    },
    include: {
      goodReceiveReturnDetails: {
        where: { isActive: true },
      },
    },
  });
  return results;
};
