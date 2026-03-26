import { uinServiceFactory } from "@/config/core.config.js";
import {
  CreateGrnInput,
  GrnReqExcelFilter,
  GrnResponse,
} from "@/types/grn/grn.js";
import { db } from "@repo/db";
import { PmsUinShortCode } from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-core";
import { addItemStock, subItemStock } from "../stock/stock.repository.js";
import { API_TIMEOUT } from "@repo/shared";
import { PmsGoodReceiveDetails } from "@repo/db/generated/prisma/client";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { emailConfigService } from "@/services/master/emailConfig.service.js";

export const createGrnInDb = async (input: CreateGrnInput) => {
  logger.info("entering::createGrnInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { gatePassId, poId, poStatus } = input;

  const omittedGrn = customOmit<
    CreateGrnInput,
    "distributor" | "goodReceiveDetails" | "poStatus"
  >(input, ["distributor", "goodReceiveDetails", "poStatus"]);

  return db.$transaction(
    async (tx) => {
      const grnUin = await uinServiceFactory.generateUIN(PmsUinShortCode.GRN);

      const createdGrn = await tx.pmsGoodReceive.create({
        data: {
          ...omittedGrn.rest,
          gatePassId,
          poId,
          createdBy: currentUser,
          grnNumber: grnUin,
          goodReceiveDetails: {
            create: omittedGrn.omitted.goodReceiveDetails.map((d) => ({
              item: { connect: { id: d.itemId } },

              itemCategoryId: d.itemCategoryId ?? undefined,
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

              orderQuantity: d.orderQuantity,
              mrp: d.mrp ?? undefined,
              purchasedPrice: d.purchasedPrice,
              focQuantity: d.focQuantity,
              tax: d.tax ?? undefined,
              netTax: d.netTax,
              taxMethod: d.taxMethod,
              quantity: d.quantity ?? undefined,
              totalAmount: d.totalAmount,
              netAmount: d.netAmount,

              discountMethod: d.discountMethod,
              discount: d.discount ?? undefined,
              netDiscount: d.netDiscount,

              batchNo: d.batchNo,
              expiryDate: d.expiryDate ?? undefined,

              createdBy: currentUser,
            })),
          },
        },
        include: {
          goodReceiveDetails: true,
        },
      });

      for (const detail of createdGrn.goodReceiveDetails) {
        if ((detail.quantity ?? 0) > 0) {
          await addItemStock(
            tx,
            {
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate ?? undefined,
              itemId: detail.itemId,
              quantity: detail.quantity,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: createdGrn.id,
              refDetailsId: detail.id,
              refNo: createdGrn.grnNumber,
            },
          );
        }

        if ((detail.focQuantity ?? 0) > 0) {
          await addItemStock(
            tx,
            {
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate ?? undefined,
              itemId: detail.itemId,
              quantity: detail.focQuantity,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: createdGrn.id,
              refDetailsId: detail.id,
              refNo: createdGrn.grnNumber,
            },
          );
        }
      }
      await tx.pmsGatePass.update({
        where: { id: gatePassId },
        data: { status: "COMPLETED" },
      });

      await tx.pmsPurchaseOrder.update({
        where: { id: poId },
        data: { status: poStatus! },
      });

      await Promise.all(
        omittedGrn.omitted.goodReceiveDetails.map((detail) =>
          tx.pmsPurchaseOrderDetails.updateMany({
            where: { id: detail.poDetailsId },
            data: {
              receivedQty: {
                increment: detail.quantity ?? 0,
              },
            },
          }),
        ),
      );

      const distributor = omittedGrn.omitted.distributor;

      if (distributor?.grnEmail) {
        const feature = await featureFlagService.getFeatureFlagByShortCode(
          "GRN_NOTIFICATION",
          true,
        );
        const emailTemplate = await emailConfigService.getEventEmail();

        // if (emailTemplate && emailTemplate.emailBody && store?.user?.email && feature?.isEnabled) {
        //   sendTemplatedEmail({
        //     template: emailTemplate,
        //     to: [distributor.dpEmail, distributor.proInEmail],
        //     variables: {
        //       name: store.user.userName || "User",
        //       companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
        //       message: `Good Receive created.`,
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

      return createdGrn;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const updateGrnInDb = async (input: CreateGrnInput) => {
  logger.info("entering::updateGrnInDb::repository");

  const { id, goodReceiveDetails } = input;
  if (!id) throw new Error("Cannot update a GoodReceive without an id");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const toUpdate = goodReceiveDetails.filter((d) => typeof d.id === "number");
  const toCreate = goodReceiveDetails.filter((d) => typeof d.id !== "number");

  const omittedGrn = customOmit<
    CreateGrnInput,
    "distributor" | "goodReceiveDetails" | "poStatus"
  >(input, ["distributor", "goodReceiveDetails", "poStatus"]);

  return await db.$transaction(async (tx) => {
    const prevGrn = await tx.pmsGoodReceive.findUnique({
      where: { id },
      include: { goodReceiveDetails: true },
    });
    if (!prevGrn) throw new Error(`GRN ${id} not found`);

    const updatedGrn = await tx.pmsGoodReceive.update({
      where: { id },
      data: {
        ...omittedGrn.rest,
        updatedBy: currentUser,
        goodReceiveDetails: {
          update: toUpdate.map((d) => ({
            where: { id: d.id! },
            data: {
              itemId: d.itemId,
              batchNo: d.batchNo ?? undefined,
              expiryDate: d.expiryDate ?? undefined,
              quantity: d.quantity,
              totalAmount: d.totalAmount,
              discount: d.discount ?? undefined,
              netDiscount: d.netDiscount,
              tax: d.tax,
              netTax: d.netTax,
              discountMethod: d.discountMethod,
              focQuantity: d.focQuantity,
              taxMethod: d.taxMethod,
              netAmount: d.netAmount,
              updatedBy: currentUser,
            },
          })),
          create: toCreate.map((detail) => ({
            item: { connect: { id: detail.itemId } },
            itemCategoryId: detail.itemCategoryId ?? undefined,
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

            mrp: detail.mrp ?? undefined,
            purchasedPrice: detail.purchasedPrice,
            focQuantity: detail.focQuantity,
            tax: detail.tax ?? undefined,
            netTax: detail.netTax,
            taxMethod: detail.taxMethod,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate ?? undefined,
            quantity: detail.quantity ?? undefined,
            totalAmount: detail.totalAmount,
            netAmount: detail.netAmount,
            discountMethod: detail.discountMethod,
            discount: detail.discount ?? undefined,
            netDiscount: detail.netDiscount,
            createdBy: currentUser,
          })),
        },
      },
      include: { goodReceiveDetails: true },
    });

    const prevMap = new Map<number, (typeof prevGrn.goodReceiveDetails)[0]>(
      prevGrn.goodReceiveDetails.map((d) => [d.id, d]),
    );
    const updatedMap = new Map<
      number,
      (typeof updatedGrn.goodReceiveDetails)[0]
    >(updatedGrn.goodReceiveDetails.map((d) => [d.id, d]));

    for (const prevDetail of prevGrn.goodReceiveDetails) {
      if (!updatedMap.has(prevDetail.id)) {
        if (prevDetail.quantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo,
              expiryDate: prevDetail.expiryDate ?? undefined,
              itemId: prevDetail.itemId,
              quantity: prevDetail.quantity,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            },
          );
        }
        if (prevDetail.focQuantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo,
              expiryDate: prevDetail.expiryDate ?? undefined,
              itemId: prevDetail.itemId,
              quantity: prevDetail.focQuantity,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            },
          );
        }
      }
    }

    for (const updDetail of updatedGrn.goodReceiveDetails) {
      const prevDetail = prevMap.get(updDetail.id);
      if (!prevDetail) continue;

      const sameBatch =
        prevDetail.batchNo === updDetail.batchNo &&
        String(prevDetail.expiryDate) === String(updDetail.expiryDate);

      if (sameBatch) {
        const delta = updDetail.quantity - prevDetail.quantity;
        const deltaFoc = updDetail.focQuantity - prevDetail.focQuantity;
        if (delta > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: delta,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            },
          );
        } else if (delta < 0) {
          await subItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: -delta,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: prevGrn.id,
              refDetailsId: updDetail.id,
              refNo: prevGrn.grnNumber,
            },
          );
        }

        if (deltaFoc > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: deltaFoc,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            },
          );
        } else if (deltaFoc < 0) {
          await subItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: -deltaFoc,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: prevGrn.id,
              refDetailsId: updDetail.id,
              refNo: prevGrn.grnNumber,
            },
          );
        }
      } else {
        if (prevDetail.quantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo,
              expiryDate: prevDetail.expiryDate ?? undefined,
              itemId: prevDetail.itemId,
              quantity: prevDetail.quantity,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            },
          );
        }
        if (updDetail.quantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: updDetail.quantity,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            },
          );
        }
        if (prevDetail.focQuantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo,
              expiryDate: prevDetail.expiryDate ?? undefined,
              itemId: prevDetail.itemId,
              quantity: prevDetail.focQuantity,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            },
          );
        }
        if (updDetail.focQuantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: updDetail.focQuantity,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            },
          );
        }
      }
    }

    for (const updDetail of updatedGrn.goodReceiveDetails) {
      if (!prevMap.has(updDetail.id)) {
        if (updDetail.quantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: updDetail.quantity,
              warehouseId: input.warehouseId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            },
          );
        }
        if (updDetail.focQuantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo,
              expiryDate: updDetail.expiryDate ?? undefined,
              itemId: updDetail.itemId,
              quantity: updDetail.focQuantity,
              warehouseId: input.warehouseId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: input.date,
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            },
          );
        }
      }
    }

    return updatedGrn;
  });
};

export const getCountGRNDetailsFromDb = async (
  detailIds: number[],
  grnId: number,
): Promise<number> => {
  logger.info("entering::getCountGRNDetailsFromDb::repository");

  const count = await db.pmsGoodReceiveDetails.count({
    where: {
      id: { in: detailIds },
      isActive: true,
      goodReceiveId: grnId,
    },
  });

  logger.info(`exit::getCountGRNDetailsFromDb::found ${count} records`);
  return count;
};

export const getAllGrnFromDb = async (): Promise<GrnResponse[]> => {
  logger.info("entering::getAllGrnFromDb::repository");

  const allGRNs = await db.pmsGoodReceive.findMany({
    where: { isActive: true },
    include: {
      goodReceiveDetails: {
        where: {
          isActive: true,
          quantity: {
            gt: 0,
          },
        },
      },
      po: {
        select: {
          id: true,
          date: true,
          lastVerifiedBy: true,
          lastVerifiedAt: true,
          createdBy: true,
          status: true,
          currency: true,
          grandTotal: true,
        },
      },
      gatePass: true,
    },
  });

  logger.info("exiting::getAllGrnFromDb::repository");
  return allGRNs;
};

export const getGrnByIdFromDb = async (
  id: number,
): Promise<GrnResponse | null> => {
  logger.info(`entering::getGrnByIdFromDb::repository id=${id}`);

  const grn = await db.pmsGoodReceive.findFirst({
    where: { id, isActive: true },
    include: {
      goodReceiveDetails: {
        where: {
          isActive: true,
          quantity: {
            gt: 0,
          },
        },
      },
      po: {
        select: {
          id: true,
          date: true,
          lastVerifiedBy: true,
          lastVerifiedAt: true,
          createdBy: true,
          status: true,
          currency: true,
          grandTotal: true,
        },
      },
      gatePass: true,
    },
  });

  logger.info(`exiting::getGrnByIdFromDb::repository id=${id}`);
  return grn;
};

export const getGrnDetailsByIdFromDb = async (
  id: number,
): Promise<PmsGoodReceiveDetails | null> => {
  logger.info(`entering::getGrnDetailsByIdFromDb::repository id=${id}`);

  const grnDetails = await db.pmsGoodReceiveDetails.findUnique({
    where: { id, isActive: true },
  });

  logger.info(`exiting::getGrnByIdFromDb::repository id=${id}`);
  return grnDetails;
};

export const deleteGrnFromDb = async (id: number) => {
  logger.info(`entering::deleteGrnFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.pmsGoodReceive.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      goodReceiveDetails: {
        updateMany: {
          where: { goodReceiveId: id },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
    include: {
      goodReceiveDetails: true,
    },
  });

  logger.info(
    `exiting::deleteGrnFromDb::repository id=${id} (deletedBy=${currentUser})`,
  );
};

export const getGrnForExcelInDb = async (
  input: GrnReqExcelFilter,
): Promise<GrnResponse[]> => {
  logger.info("entering::getGrnForExcelInDb::repository");
  const results = await db.pmsGoodReceive.findMany({
    where: {
      id: input.id,
      poNumber: input.poNumber,
      date: {
        gte: input.startDate ? new Date(input.startDate) : undefined,
        lte: input.endDate ? new Date(input.endDate) : undefined,
      },
      warehouseId: input.warehouseId,
      distributorId: input.distributorId,
      status: input.status,
      paymentStatus: input.paymentStatus,
      po: { status: input.poStatus },
      gatePassId: input.gatePassId,
      isActive: true,
    },
    orderBy: { date: "desc" },
    include: {
      goodReceiveDetails: {
        where: {
          isActive: true,
          quantity: { gt: 0 },
        },
      },
      po: {
        select: {
          id: true,
          date: true,
          lastVerifiedBy: true,
          lastVerifiedAt: true,
          createdBy: true,
          status: true,
          currency: true,
          grandTotal: true,
        },
      },
      gatePass: true,
    },
  });
  return results;
};
