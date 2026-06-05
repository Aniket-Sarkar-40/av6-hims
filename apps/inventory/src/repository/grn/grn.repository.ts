import { uinServiceFactory } from "@/config/core.config.js";
import {
  CreateGrnInput,
  GrnDetailInput,
  GrnResponse,
} from "@/types/grn/grn.js";
import { db } from "@repo/db/client";
import {
  GRN_STATUS,
  InvGoodReceive,
  InvGoodReceiveDetails,
  InvUinShortCode,
  ItemStockType,
  VoucherReferenceType,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";
import { addItemStock } from "../stock/stock.repository.js";
import { subItemStock } from "./../stock/stock.repository.js";
import { settingsService } from "@/services/master/settings.service.js";
import { calculateGrnStockQty } from "@/utils/commonCalculation.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { getDetailKey } from "@/validations/service/grn/grn.service.validation.js";
import { voucherService } from "@apps/acc/services/voucher/voucher.service.js";

export const createGrnInDb = async (
  input: CreateGrnInput
): Promise<InvGoodReceive> => {
  logger.info("entering::createGrnInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { poId, poStatus } = input;

  const omittedGrn = customOmit<
    CreateGrnInput,
    "goodReceiveDetails" | "poStatus" | "supplier"
  >(input, ["goodReceiveDetails", "poStatus", "supplier"]);
  const grnUin = await uinServiceFactory.generateUIN(InvUinShortCode.GRN);
  return db.$transaction(async (tx) => {
    const inputDetails = omittedGrn.omitted.goodReceiveDetails;

    const createdGrn = await tx.invGoodReceive.create({
      data: {
        ...omittedGrn.rest,
        date: new Date(omittedGrn.rest.date),
        createdBy: currentUser,
        grnNumber: grnUin,
        goodReceiveDetails: {
          create: inputDetails.map((d) => {
            const omittedDetails = customOmit<
              GrnDetailInput,
              | "poDetailsId"
              | "id"
              | "isExpiry"
              | "isBatch"
              | "stockQuantity"
              | "stockFocQuantity"
            >(d, [
              "id",
              "poDetailsId",
              "isBatch",
              "isExpiry",
              "stockQuantity",
              "stockFocQuantity",
            ]);
            return {
              ...omittedDetails.rest,
              expiryDate: d.expiryDate ? new Date(d.expiryDate) : undefined,
              createdBy: currentUser,
            };
          }),
        },
      },
      include: {
        goodReceiveDetails: true,
      },
    });

    await Promise.all(
      createdGrn.goodReceiveDetails.map(async (detail, index) => {
        const inputDetail = inputDetails[index];

        if ((detail.quantity ?? 0) > 0) {
          await addItemStock(
            tx,
            {
              batchNo: detail.batchNo ?? null,
              expiryDate: detail.expiryDate ?? null,
              itemId: detail.itemId,
              quantity: inputDetail.stockQuantity ?? detail.quantity,
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(new Date(input.date)),
              refId: createdGrn.id,
              refDetailsId: detail.id,
              refNo: createdGrn.grnNumber,
            }
          );
        }

        if ((detail.focQuantity ?? 0) > 0) {
          await addItemStock(
            tx,
            {
              batchNo: detail.batchNo ?? null,
              expiryDate: detail.expiryDate ?? null,
              itemId: detail.itemId,
              quantity: inputDetail.stockFocQuantity ?? detail.focQuantity,
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(new Date(input.date)),
              refId: createdGrn.id,
              refDetailsId: detail.id,
              refNo: createdGrn.grnNumber,
            }
          );
        }
      })
    );

    await tx.invPurchaseOrder.update({
      where: { id: poId },
      data: { status: poStatus! },
    });

    await Promise.all(
      omittedGrn.omitted.goodReceiveDetails.map((detail) =>
        tx.invPurchaseOrderDetails.updateMany({
          where: { id: detail.poDetailsId },
          data: {
            receivedQty: {
              increment: detail.quantity ?? 0,
            },
          },
        })
      )
    );

    // voucher entry
    // const settings = await settingsService.getSettings();
    // if (settings?.isAccounting && createdGrn.status === GRN_STATUS.COMPLETED) {
    //   const result = await accountingExternalService.createVoucher({
    //     ccId: createdGrn.ccId,
    //     refType: VoucherReferenceType.INVENTORY_GRN,
    //     refNo: createdGrn.grnNumber,
    //     refId: createdGrn.id,
    //     refDate: createdGrn.date,
    //     currencyId: createdGrn.currencyId ?? undefined,
    //     currencyConversionRate: createdGrn.conversionRate
    //       ? Number(createdGrn.conversionRate)
    //       : undefined,
    //     totalAmount: Number(createdGrn.totalAmount),
    //     clientId: createdGrn.supplierId,
    //     clientPayAmount: 0,
    //     customerPayAmount: 0,
    //     customerName: "",
    //     createdBy: currentUser,
    //   });
    //   if (!result.success) {
    //     throw new ErrorHandler(result.status, result.message);
    //   }
    // }

    return createdGrn;
  });
};

export const updateGrnInDb = async (input: CreateGrnInput) => {
  logger.info("entering::updateGrnInDb::repository");

  const { id, goodReceiveDetails } = input;
  if (!id) throw new Error("Cannot update a GoodReceive without an id");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const settings = await settingsService.getSettings();

  const toUpdate = goodReceiveDetails.filter((d) => typeof d.id === "number");
  const toCreate = goodReceiveDetails.filter((d) => typeof d.id !== "number");

  const omittedGrn = customOmit<
    CreateGrnInput,
    "goodReceiveDetails" | "poStatus" | "supplier"
  >(input, ["goodReceiveDetails", "poStatus", "supplier"]);

  const newInputDetailByKey = new Map(
    toCreate.map((detail) => [getDetailKey(detail), detail])
  );

  return await db.$transaction(async (tx) => {
    const prevGrn = await tx.invGoodReceive.findUnique({
      where: { id },
      include: {
        goodReceiveDetails: {
          include: {
            item: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
    });
    if (!prevGrn) throw new Error(`GRN ${id} not found`);

    const itemStockType: ItemStockType =
      settings?.itemStockType || ItemStockType.PACK_WISE;

    const getPrevStockQty = (
      detail: (typeof prevGrn.goodReceiveDetails)[number],
      quantity: number
    ) => {
      return calculateGrnStockQty({
        itemStockType,
        unitDefaultValue: Number(detail.item?.unit?.defaultValue ?? 1),
        quantity,
      });
    };

    const inputDetailById = new Map(
      goodReceiveDetails
        .filter((detail) => typeof detail.id === "number")
        .map((detail) => [detail.id!, detail])
    );

    const getInputStockQty = (detailId: number, fallbackQty: number) => {
      return inputDetailById.get(detailId)?.stockQuantity ?? fallbackQty;
    };

    const getInputFocStockQty = (detailId: number, fallbackQty: number) => {
      return inputDetailById.get(detailId)?.stockFocQuantity ?? fallbackQty;
    };

    const updatedGrn = await tx.invGoodReceive.update({
      where: { id },
      data: {
        ...omittedGrn.rest,
        updatedBy: currentUser,
        date: new Date(omittedGrn.rest.date),
        goodReceiveDetails: {
          update: toUpdate.map((d) => ({
            where: { id: d.id! },
            data: {
              ...customOmit<
                GrnDetailInput,
                | "poDetailsId"
                | "id"
                | "isExpiry"
                | "isBatch"
                | "stockQuantity"
                | "stockFocQuantity"
              >(d, [
                "id",
                "poDetailsId",
                "isBatch",
                "isExpiry",
                "stockQuantity",
                "stockFocQuantity",
              ]).rest,
              updatedBy: currentUser,
            },
          })),
          create: toCreate.map((detail) => {
            const omittedDetails = customOmit<
              GrnDetailInput,
              | "poDetailsId"
              | "id"
              | "isExpiry"
              | "isBatch"
              | "stockQuantity"
              | "stockFocQuantity"
            >(detail, [
              "id",
              "poDetailsId",
              "isBatch",
              "isExpiry",
              "stockQuantity",
              "stockFocQuantity",
            ]);
            return {
              ...omittedDetails.rest,
              createdBy: currentUser,
              expiryDate: detail.expiryDate
                ? new Date(detail.expiryDate)
                : undefined,
            };
          }),
        },
      },
      include: { goodReceiveDetails: true },
    });

    const prevMap = new Map<number, (typeof prevGrn.goodReceiveDetails)[0]>(
      prevGrn.goodReceiveDetails.map((d) => [d.id, d])
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
              batchNo: prevDetail.batchNo ?? null,
              expiryDate: prevDetail.expiryDate ?? null,
              itemId: prevDetail.itemId,
              quantity: getPrevStockQty(prevDetail, prevDetail.quantity),
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            }
          );
        }
        if (prevDetail.focQuantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo ?? null,
              expiryDate: prevDetail.expiryDate ?? null,
              itemId: prevDetail.itemId,
              quantity: getPrevStockQty(prevDetail, prevDetail.focQuantity),
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            }
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
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: calculateGrnStockQty({
                itemStockType,
                unitDefaultValue: prevDetail.item?.unit?.defaultValue,
                quantity: delta,
              }),
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            }
          );
        } else if (delta < 0) {
          await subItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: calculateGrnStockQty({
                itemStockType,
                unitDefaultValue: prevDetail.item?.unit?.defaultValue,
                quantity: -delta,
              }),
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: prevGrn.id,
              refDetailsId: updDetail.id,
              refNo: prevGrn.grnNumber,
            }
          );
        }

        if (deltaFoc > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: calculateGrnStockQty({
                itemStockType,
                unitDefaultValue: prevDetail.item?.unit?.defaultValue,
                quantity: deltaFoc,
              }),
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            }
          );
        } else if (deltaFoc < 0) {
          await subItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: calculateGrnStockQty({
                itemStockType,
                unitDefaultValue: prevDetail.item?.unit?.defaultValue,
                quantity: -deltaFoc,
              }),
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: prevGrn.id,
              refDetailsId: updDetail.id,
              refNo: prevGrn.grnNumber,
            }
          );
        }
      } else {
        if (prevDetail.quantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo ?? null,
              expiryDate: prevDetail.expiryDate ?? null,
              itemId: prevDetail.itemId,
              quantity: getPrevStockQty(prevDetail, prevDetail.quantity),
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            }
          );
        }
        if (updDetail.quantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: getInputStockQty(updDetail.id, updDetail.quantity),
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            }
          );
        }
        if (prevDetail.focQuantity > 0) {
          await subItemStock(
            tx,
            {
              batchNo: prevDetail.batchNo ?? null,
              expiryDate: prevDetail.expiryDate ?? null,
              itemId: prevDetail.itemId,
              quantity: getPrevStockQty(prevDetail, prevDetail.focQuantity),
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: prevGrn.id,
              refDetailsId: prevDetail.id,
              refNo: prevGrn.grnNumber,
            }
          );
        }
        if (updDetail.focQuantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: getInputFocStockQty(
                updDetail.id,
                updDetail.focQuantity
              ),
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            }
          );
        }
      }
    }

    for (const updDetail of updatedGrn.goodReceiveDetails) {
      if (!prevMap.has(updDetail.id)) {
        const inputDetail = newInputDetailByKey.get(getDetailKey(updDetail));

        if (updDetail.quantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: inputDetail?.stockQuantity ?? updDetail.quantity,
              ccId: input.ccId,
              isFoc: false,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            }
          );
        }
        if (updDetail.focQuantity > 0) {
          await addItemStock(
            tx,
            {
              batchNo: updDetail.batchNo ?? null,
              expiryDate: updDetail.expiryDate ?? null,
              itemId: updDetail.itemId,
              quantity: inputDetail?.stockFocQuantity ?? updDetail.focQuantity,
              ccId: input.ccId,
              isFoc: true,
            },
            {
              operation: "GOOD_RECEIVE",
              refDate: new Date(input.date),
              refId: updatedGrn.id,
              refDetailsId: updDetail.id,
              refNo: updatedGrn.grnNumber,
            }
          );
        }
      }
    }
    // voucher entry
    // TODO: Add accounting
    // if (settings?.isAccounting && updatedGrn.status === GRN_STATUS.COMPLETED) {
    //   const result = await voucherService.createVoucher({
    //     ccId: updatedGrn.ccId,
    //     refType: VoucherReferenceType.INVENTORY_GRN,
    //     refNo: updatedGrn.grnNumber,
    //     refId: updatedGrn.id,
    //     refDate: updatedGrn.date,
    //     currencyId: updatedGrn.currencyId ?? undefined,
    //     currencyConversionRate: updatedGrn.conversionRate
    //       ? Number(updatedGrn.conversionRate)
    //       : undefined,
    //     totalAmount: Number(updatedGrn.totalAmount),
    //     clientId: updatedGrn.supplierId,
    //     clientPayAmount: 0,
    //     customerPayAmount: 0,
    //     customerName: "",
    //     createdBy: currentUser,
    //   });
    //   if (!result.success) {
    //     throw new ErrorHandler(result.status, result.message);
    //   }
    // }
    return updatedGrn;
  });
};

export const getCountGRNDetailsFromDb = async (
  detailIds: number[],
  grnId: number
): Promise<number> => {
  logger.info("entering::getCountGRNDetailsFromDb::repository");

  const count = await db.invGoodReceiveDetails.count({
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

  const allGRNs = await db.invGoodReceive.findMany({
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
    },
  });

  logger.info("exiting::getAllGrnFromDb::repository");
  return allGRNs;
};

export const getGrnByIdFromDb = async (
  id: number
): Promise<GrnResponse | null> => {
  logger.info(`entering::getGrnByIdFromDb::repository id=${id}`);

  const grn = await db.invGoodReceive.findFirst({
    where: { id, isActive: true },
    include: {
      goodReceiveDetails: {
        where: {
          isActive: true,
          quantity: {
            gt: 0,
          },
        },
        include: {
          item: {
            select: { item: true },
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
    },
  });

  logger.info(`exiting::getGrnByIdFromDb::repository id=${id}`);
  return grn;
};

export const getGrnDetailsByIdFromDb = async (
  id: number
): Promise<InvGoodReceiveDetails | null> => {
  logger.info(`entering::getGrnDetailsByIdFromDb::repository id=${id}`);

  const grnDetails = await db.invGoodReceiveDetails.findFirst({
    where: { id, isActive: true },
  });

  logger.info(`exiting::getGrnByIdFromDb::repository id=${id}`);
  return grnDetails;
};

export const deleteGrnFromDb = async (id: number) => {
  logger.info(`entering::deleteGrnFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.invGoodReceive.update({
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
    `exiting::deleteGrnFromDb::repository id=${id} (deletedBy=${currentUser})`
  );
};

// export const getGrnForExcelInDb = async (input: GrnReqExcelFilter): Promise<GrnResponse[]> => {
//   logger.info("entering::getGrnForExcelInDb::repository");
//   const results = await db.goodReceive.findMany({
//     where: {
//       id: input.id,
//       poNumber: input.poNumber,
//       date: {
//         gte: input.startDate ? new Date(input.startDate) : undefined,
//         lte: input.endDate ? new Date(input.endDate) : undefined,
//       },
//       ccId: input.ccId,
//       supplierId: input.distributorId,
//       status: input.status,
//       paymentStatus: input.paymentStatus,
//       po: { status: input.poStatus },
//       gatePassId: input.gatePassId,
//       isActive: true,
//     },
//     orderBy: { date: "desc" },
//     include: {
//       goodReceiveDetails: {
//         where: {
//           isActive: true,
//           quantity: { gt: 0 },
//         },
//       },
//       po: {
//         select: {
//           id: true,
//           date: true,
//           verifiedBy1: true,
//           verifiedAt1: true,
//           verifiedBy2: true,
//           verifiedAt2: true,
//           createdBy: true,
//           status: true,
//           currency: true,
//           grandTotal: true,
//         },
//       },
//     },
//   });
//   return results;
// };

export const getExistingBatchItemConflictsFromDb = async (
  batches: { itemId: number; batchNo: string }[],
  excludeGrnDetailIds: number[] = []
) => {
  logger.info("entering::getExistingBatchItemConflictsFromDb::repository");

  const batchNos = Array.from(
    new Set(batches.map((b) => b.batchNo.trim()).filter(Boolean))
  );

  if (!batchNos.length) return [];

  const conflicts = await db.invGoodReceiveDetails.findMany({
    where: {
      isActive: true,
      batchNo: {
        in: batchNos,
      },
      ...(excludeGrnDetailIds.length
        ? {
            id: {
              notIn: excludeGrnDetailIds,
            },
          }
        : {}),
    },
    select: {
      id: true,
      itemId: true,
      batchNo: true,
    },
  });

  logger.info("exiting::getExistingBatchItemConflictsFromDb::repository");

  return conflicts;
};
