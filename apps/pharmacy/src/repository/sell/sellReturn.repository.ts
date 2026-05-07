import {
  SellReturnDetailInput,
  SellReturnExcelFilter,
  SellReturnInput,
  SellReturnResponse,
  ValSellReturnResponse,
} from "@/types/sell/sellReturn.js";
import {
  createOrUpdateInsurerInvoice,
  handleClientPlanInvoiceForOpd,
} from "../opd/opdList.repository.js";
import { addItemStock } from "../stock/stock.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { customOmit } from "av6-core-v2";
import { db } from "@repo/db";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  PmsUinShortCode,
  RETURN_STS,
  RETURN_STS_SELL,
} from "@repo/db/generated/prisma/enums.js";
import { API_TIMEOUT } from "@repo/shared";

export const createSellReturnInDb = async (input: SellReturnInput) => {
  logger.info("entering::createSellReturnInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omittedSellReturn = customOmit<
    SellReturnInput,
    | "sellReturnDetails"
    | "existingSellReturn"
    | "patient"
    | "client"
    | "isCompleteReturn"
    | "refundAmount"
    | "totalCustomerPayAmount"
    | "totalCoPayAmount"
    | "sell"
  >(input, [
    "sellReturnDetails",
    "existingSellReturn",
    "patient",
    "client",
    "isCompleteReturn",
    "refundAmount",
    "totalCoPayAmount",
    "totalCustomerPayAmount",
    "sell",
  ]);
  const { sellReturnDetails } = omittedSellReturn.omitted;

  return await db.$transaction(
    async (tx) => {
      const sellReturnUin = await uinServiceFactory.generateUIN(
        PmsUinShortCode.SELL_RETURN
      );
      const createdSellReturn = await tx.pmsSellReturn.create({
        data: {
          ...omittedSellReturn.rest,
          patientUniqueId: omittedSellReturn.omitted.patient?.patientUniqueId,
          sellReturnRefNumber: sellReturnUin,
          createdBy: currentUser,
          sellReturnDetails: {
            create: sellReturnDetails.map((detail: SellReturnDetailInput) => ({
              ...detail,
              expiryDate: new Date(detail.expiryDate),
              createdBy: currentUser,
            })),
          },
        },
        include: {
          sellReturnDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      await tx.pmsSell.update({
        where: { id: input.sellId },
        data: {
          returnStatus: RETURN_STS.PENDING,
        },
      });

      return createdSellReturn;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const updateSellReturnInDb = async (input: SellReturnInput) => {
  logger.info("entering::updateSellReturnInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedSellReturn = customOmit<
    SellReturnInput,
    | "sellReturnDetails"
    | "existingSellReturn"
    | "id"
    | "patient"
    | "client"
    | "isCompleteReturn"
    | "refundAmount"
    | "totalCustomerPayAmount"
    | "totalCoPayAmount"
    | "sell"
  >(input, [
    "sellReturnDetails",
    "existingSellReturn",
    "id",
    "patient",
    "client",
    "isCompleteReturn",
    "refundAmount",
    "totalCoPayAmount",
    "totalCustomerPayAmount",
    "sell",
  ]);
  const { sellReturnDetails, existingSellReturn, id } =
    omittedSellReturn.omitted;

  const toUpdate = sellReturnDetails.filter((d) => typeof d.id === "number");
  const toCreate = sellReturnDetails.filter((d) => typeof d.id !== "number");
  const toDelete = existingSellReturn.sellReturnDetails.filter(
    (d) => !sellReturnDetails.some((item) => item.id === d.id)
  );

  return await db.$transaction(
    async (tx) => {
      const updatedSellReturn = await tx.pmsSellReturn.update({
        where: { id },
        data: {
          ...omittedSellReturn.rest,
          patientUniqueId: omittedSellReturn.omitted.patient?.patientUniqueId,
          updatedBy: currentUser,
          sellReturnDetails: {
            update: toUpdate.map((detail) => {
              const omittedDetails = customOmit<SellReturnDetailInput, "id">(
                detail,
                ["id"]
              );
              return {
                where: { id: omittedDetails.omitted.id },
                data: {
                  ...omittedDetails.rest,
                  expiryDate: new Date(detail.expiryDate),
                  updatedBy: currentUser,
                },
              };
            }),
            create: toCreate.map((detail) => {
              const omittedDetails = customOmit<SellReturnDetailInput, "id">(
                detail,
                ["id"]
              );
              return {
                ...omittedDetails.rest,
                expiryDate: new Date(detail.expiryDate),
                updatedBy: currentUser,
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
          sellReturnDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      return updatedSellReturn;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const approvedSellReturnInDb = async (input: SellReturnInput) => {
  logger.info("entering::approvedSellReturnInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omittedSellReturn = customOmit<
    SellReturnInput,
    | "sellReturnDetails"
    | "existingSellReturn"
    | "id"
    | "patient"
    | "client"
    | "isCompleteReturn"
    | "refundAmount"
    | "totalCustomerPayAmount"
    | "totalCoPayAmount"
    | "sell"
  >(input, [
    "sellReturnDetails",
    "existingSellReturn",
    "id",
    "patient",
    "client",
    "isCompleteReturn",
    "refundAmount",
    "totalCoPayAmount",
    "totalCustomerPayAmount",
    "sell",
  ]);
  const { sellReturnDetails, id } = omittedSellReturn.omitted;

  return await db.$transaction(
    async (tx) => {
      const updatedSellReturn = await tx.pmsSellReturn.update({
        where: { id },
        data: {
          ...omittedSellReturn.rest,
          updatedBy: currentUser,
          approvedBy: currentUser,
          sellReturnDetails: {
            update: sellReturnDetails
              .filter((detail) => detail.id)
              .map((detail) => ({
                where: { id: detail.id! },
                data: {
                  quantity: detail.quantity,
                  netAmount: detail.netAmount ?? 0,
                  netDiscount: detail.netDiscount ?? 0,
                  netTax: detail.netTax ?? 0,
                  totalAmount: detail.totalAmount ?? 0,
                  updatedBy: currentUser,
                },
              })),
          },
        },
        include: {
          sellReturnDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });

      if (omittedSellReturn.omitted.sell.isStockAdjusted) {
        for (const detail of sellReturnDetails) {
          await addItemStock(
            tx,
            {
              itemId: detail.itemId,
              quantity: detail.quantity ?? 0,
              batchNo: detail.batchNo,
              branchId: input.ccId,
              expiryDate: detail.expiryDate,
              isFoc: detail.isFoc,
            },
            {
              operation: "SELL_RETURN_APPROVAL",
              refApprovedBy: currentUser,
              refApprovedAt: new Date(),
              refDate: new Date(),
              refDetailsId: detail.id!,
              refId: id,
              refNo: input.sellNumber,
            }
          );
        }
      }

      await Promise.all(
        sellReturnDetails.map(async (detail) => {
          await tx.pmsSellDetails.updateMany({
            where: {
              id: detail.sellDetailsId,
              sellId: input.sellId,
              itemId: detail.itemId,
            },
            data: {
              returnQuantity: {
                increment: detail.quantity ?? 0,
              },
              updatedBy: currentUser,
            },
          });
        })
      );

      const sell = omittedSellReturn.omitted.sell;

      await tx.pmsSell.update({
        where: { id: input.sellId },
        data: {
          returnedAmount: omittedSellReturn.omitted.refundAmount,
          returnStatus: RETURN_STS_SELL.COMPLETED,
          paymentStatus: sell?.paymentStatus,
          status: omittedSellReturn.omitted.isCompleteReturn
            ? "RETURNED"
            : "PARTIALLY_RETURNED",
          updatedBy: currentUser,
        },
      });

      const { totalCustomerPayAmount, totalCoPayAmount } =
        omittedSellReturn.omitted;

      if (input.insuranceId && input.patientInsuranceId && sell) {
        await createOrUpdateInsurerInvoice(tx, {
          caseId: sell.sellRefNo,
          coPayment: omittedSellReturn.omitted.isCompleteReturn
            ? 0
            : Math.max(0, sell.coPayAmount.toNumber() - totalCoPayAmount),
          grossTotal: sell.netAmount.toNumber(),
          discountAmount: sell.netDiscount.toNumber(),
          netTotal: omittedSellReturn.omitted.isCompleteReturn
            ? 0
            : Math.max(
                0,
                sell.customerPayAmount.toNumber() - totalCustomerPayAmount
              ),
          insurerId: input.insuranceId,
        });
      }

      if (input.corporateClientId && sell) {
        await handleClientPlanInvoiceForOpd(tx, {
          clientId: input.corporateClientId,
          clientPlan: omittedSellReturn.omitted.client?.customerPlan,
          coPayAmount: omittedSellReturn.omitted.isCompleteReturn
            ? 0
            : Math.max(0, sell.coPayAmount.toNumber() - totalCoPayAmount),
          sellRefNo: sell.sellRefNo,
          totalAmount: sell.netAmount.toNumber(),
        });
      }

      return updatedSellReturn;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const rejectSellReturnInDb = async (input: {
  id: number;
  sellId: number;
}) => {
  logger.info("entering::rejectSellReturnInDb::repository");
  const { id, sellId } = input;

  const sellReturn = await db.pmsSellReturn.findUnique({
    where: {
      id,
      sellId,
    },
  });

  if (!sellReturn) {
    throw new Error(`GRN with id ${id} and grnId ${sellId} not found`);
  }

  await db.pmsSellReturn.update({
    where: {
      id,
      sellId,
    },
    data: {
      status: RETURN_STS.REJECTED,
    },
  });

  await db.pmsSell.update({
    where: { id: sellId },
    data: {
      returnStatus: RETURN_STS_SELL.COMPLETED,
    },
  });
};

export const getSellReturnFromDb = async (): Promise<SellReturnResponse[]> => {
  logger.info("entering::getSellReturnFromDb::repository");
  return db.pmsSellReturn.findMany({
    where: {
      isActive: true,
    },
    include: {
      sellReturnDetails: {
        where: {
          isActive: true,
        },
        include: {
          sellDetails: {
            select: {
              returnQuantity: true,
            },
          },
        },
      },
      cc: true,
      customer: true,
      insurance: true,
      corporateClient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          surname: true,
          designation: true,
          employeeId: true,
          department: true,
          email: true,
        },
      },
    },
  });
};

export const getSellReturnByIdFromDb = async (
  id: number
): Promise<SellReturnResponse | null> => {
  logger.info("entering::getSellReturnByIdFromDb::repository");
  return db.pmsSellReturn.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      sellReturnDetails: {
        where: {
          isActive: true,
        },
        include: {
          sellDetails: {
            select: {
              returnQuantity: true,
            },
          },
        },
      },
      cc: true,
      customer: true,
      insurance: true,
      corporateClient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          surname: true,
          designation: true,
          employeeId: true,
          department: true,
          email: true,
        },
      },
    },
  });
};

export const getCountSellReturnDetailsFromDb = async (
  detailIds: number[],
  sellReturnId: number
): Promise<number> => {
  return db.pmsSellReturnDetails.count({
    where: {
      id: { in: detailIds },
      isActive: true,
      sellReturnId: sellReturnId,
    },
  });
};

export const getSellReturnBySellIdFromDb = async (
  sellId: number
): Promise<ValSellReturnResponse[]> => {
  logger.info("entering::getSellReturnBySellIdFromDb::repository");
  return db.pmsSellReturn.findMany({
    where: {
      sellId,
      isActive: true,
      status: "APPROVED",
    },
    include: {
      sellReturnDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getSellReturnExcelFromDb = async (
  input: SellReturnExcelFilter
): Promise<SellReturnResponse[]> => {
  logger.info("entering::getSellReturnExcelFromDb::repository");
  return db.pmsSellReturn.findMany({
    where: {
      id: input.id,
      sellNumber: input.sellRefNo,
      sellReturnRefNumber: input.sellReturnRefNo,
      ccId: input.branchId,
      staffId: input.staffId,
      deliveryType: input.deliveryType,
      paymentMode: input.paymentMode,
      isHomeDelivery: input.isHomeDelivery,
      customerId: input.customerId,
      billingFor: input.billingFor,
      doctorId: input.doctorId,
      paymentStatus: input.paymentStatus,
      status: input.status,
      returnDate: {
        gte: input.startDate ? new Date(input.startDate) : undefined,
        lte: input.endDate ? new Date(input.endDate) : undefined,
      },
      isActive: true,
    },
    include: {
      sellReturnDetails: {
        where: {
          isActive: true,
        },
        include: {
          sellDetails: {
            select: {
              returnQuantity: true,
            },
          },
        },
      },
      customer: true,
      cc: true,
      insurance: true,
      corporateClient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          surname: true,
          designation: true,
          employeeId: true,
          department: true,
          email: true,
        },
      },
    },
    orderBy: {
      billDate: "desc",
    },
  });
};

export const deleteSellReturnFromDb = async (id: number) => {
  logger.info(`entering::deleteSellReturnFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.pmsSellReturn.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      sellReturnDetails: {
        updateMany: {
          where: { sellReturnId: id },
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
    `exiting::deleteSellReturnFromDb::repository id=${id} (deletedBy=${currentUser})`
  );
};

export async function getSellReturnTotalsBySellId(sellId: number) {
  const agg = await db.pmsSellReturn.aggregate({
    where: {
      sellId,
      isActive: true,
      status: "APPROVED",
    },
    _sum: {
      customerPayAmount: true,
      coPayAmount: true,
    },
  });

  return {
    totalCustomerPayAmount: agg._sum.customerPayAmount
      ? agg._sum.customerPayAmount.toNumber()
      : 0,
    totalCoPayAmount: agg._sum.coPayAmount
      ? agg._sum.coPayAmount.toNumber()
      : 0,
  };
}

export async function getSellReturnTotalsBySellDetailsId(
  sellDetailsId: number
) {
  const agg = await db.pmsSellReturnDetails.aggregate({
    where: {
      sellDetailsId,
      isActive: true,
      sellReturn: {
        status: "APPROVED",
        isActive: true,
      },
    },
    _sum: {
      customerPayAmount: true,
      coPayAmount: true,
    },
  });

  return {
    totalCustomerPayAmount: agg._sum.customerPayAmount
      ? agg._sum.customerPayAmount.toNumber()
      : 0,
    totalCoPayAmount: agg._sum.coPayAmount
      ? agg._sum.coPayAmount.toNumber()
      : 0,
  };
}
