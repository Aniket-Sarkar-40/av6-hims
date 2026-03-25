import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  CommonConsumptionInput,
  ConsumptionApproveInput,
  ConsumptionCreateInput,
  ConsumptionDetailsApproveInput,
  ConsumptionDetailsCreateInput,
  ConsumptionResponse,
  ConsumptionUpdateInput,
} from "@/types/consumption/consumption.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Consumption_Status,
  InvOperation,
  InvUinShortCode,
} from "@repo/db/generated/prisma/client";
import { subItemStock } from "../stock/stock.repository.js";

export async function createConsumptionInDb(
  data: ConsumptionCreateInput,
): Promise<ConsumptionResponse> {
  logger.info("entering::createConsumptionInDb::repository");
  const store = requestStorage.getStore();
  const consumptionNo = await uinServiceFactory.generateUIN(InvUinShortCode.CN);
  return await db.$transaction(
    async (tx) => {
      const consumption = await tx.consumption.create({
        data: {
          ...data,
          consumptionNo,
          createdBy: store?.user?.id,
          consumptionDetails: {
            create: data.consumptionDetails.map((c) => {
              const omitCons = customOmit<
                ConsumptionDetailsCreateInput,
                "consumedQty" | "isBatch" | "isExpiry"
              >(c, ["consumedQty", "isBatch", "isExpiry"]);
              return {
                ...omitCons.rest,
                expiryDate: c.expiryDate ? new Date(c.expiryDate) : null,
                createdBy: store?.user?.id,
              };
            }),
          },
        },
        include: {
          consumptionDetails: true,
        },
      });

      logger.info("exiting::createConsumptionInDb::repository");
      return consumption;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
}

export async function updateConsumptionInDb(
  data: ConsumptionUpdateInput,
): Promise<ConsumptionResponse> {
  logger.info("entering::updateConsumptionInDb::repository");

  const store = requestStorage.getStore();

  const omittedConsumption = customOmit<
    ConsumptionUpdateInput,
    "id" | "consumptionDetails" | "existing" | "ccId"
  >(data, ["id", "consumptionDetails", "ccId", "existing"]);

  const { id, consumptionDetails, existing } = omittedConsumption.omitted;
  const details = consumptionDetails ?? [];

  const existingIds = new Set(
    (existing?.consumptionDetails ?? []).map((d) => d.id),
  );
  const toCreate = details.filter((d) => typeof d.id !== "number");
  const toUpdate = details.filter(
    (d) => typeof d.id === "number" && existingIds.has(d.id as number),
  );
  const toDelete = (existing?.consumptionDetails ?? [])
    .filter((ed) => !details.some((d) => d.id === ed.id))
    .map((d) => d.id);

  const consumption = await db.$transaction(
    async (tx) => {
      const result = await tx.consumption.update({
        where: { id },
        data: {
          ...omittedConsumption.rest,
          updatedBy: store?.user?.id,

          consumptionDetails: {
            create: toCreate.map((c) => {
              const omitCons = customOmit<
                ConsumptionDetailsCreateInput,
                "consumedQty"
              >(c, ["consumedQty"]);

              return {
                ...omitCons.rest,
                consumedQty: c.requestedQty,
                expiryDate: c.expiryDate ? new Date(c.expiryDate) : null,
                createdBy: store?.user?.id,
              };
            }),

            update: toUpdate.map((c) => {
              const omitCons = customOmit<
                ConsumptionDetailsCreateInput,
                "consumedQty"
              >(c, ["consumedQty"]);

              return {
                where: { id: c.id as number },
                data: {
                  ...omitCons.rest,
                  expiryDate: c.expiryDate ? new Date(c.expiryDate) : null,
                  updatedBy: store?.user?.id,
                },
              };
            }),

            ...(toDelete.length
              ? {
                  updateMany: [
                    {
                      where: { id: { in: toDelete } },
                      data: {
                        isActive: false,
                        deletedBy: store?.user?.id,
                        deletedAt: new Date(),
                      },
                    },
                  ],
                }
              : {}),
          },
        },
        include: {
          consumptionDetails: {
            where: { isActive: true },
          },
        },
      });

      return result;
    },
    {
      timeout: API_TIMEOUT,
    },
  );

  logger.info("exiting::updateConsumptionInDb::repository");
  return consumption;
}

export async function getConsumptionByIdFromDb(
  id: number,
): Promise<ConsumptionResponse | null> {
  logger.info("entering::getConsumptionByIdFromDb::repository");
  return await db.consumption.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      consumptionDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
}

export async function getAllConsumptionsFromDb(): Promise<
  ConsumptionResponse[]
> {
  logger.info("entering::getAllConsumptionsFromDb::repository");
  return await db.consumption.findMany({
    where: {
      isActive: true,
    },
    include: {
      consumptionDetails: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function deleteConsumptionByIdFromDb(id: number): Promise<void> {
  logger.info("entering::deleteConsumptionByIdFromDb::repository");
  const store = requestStorage.getStore();
  await db.$transaction(
    async (tx) => {
      await tx.consumption.update({
        where: {
          id,
        },
        data: {
          isActive: false,
          deletedBy: store?.user?.id,
          deletedAt: new Date(),
          consumptionDetails: {
            updateMany: {
              where: { isActive: true },
              data: {
                isActive: false,
                deletedBy: store?.user?.id,
                deletedAt: new Date(),
              },
            },
          },
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
  logger.info("exiting::deleteConsumptionByIdFromDb::repository");
}

export async function approveConsumptionInDb(
  data: ConsumptionApproveInput,
): Promise<ConsumptionResponse> {
  logger.info("entering::approveConsumptionInDb::repository");
  const store = requestStorage.getStore();
  const omittedConsumption = customOmit<
    ConsumptionApproveInput,
    "id" | "consumptionDetails" | "existing" | "ccId"
  >(data, ["id", "consumptionDetails", "existing", "ccId"]);
  const { id, consumptionDetails, existing } = omittedConsumption.omitted;

  const toCreate = consumptionDetails.filter((d) => typeof d.id !== "number");
  const toUpdate = consumptionDetails.filter((d) => typeof d.id === "number");
  const toDelete = existing.consumptionDetails
    .filter((ed) => !consumptionDetails.some((d) => d.id === ed.id))
    .map((d) => d.id);
  return await db.$transaction(
    async (tx) => {
      const approvedConsumption = await tx.consumption.update({
        where: {
          id,
        },
        data: {
          ...omittedConsumption.rest,
          approvedBy: store?.user?.id,
          approvedAt: new Date(),
          consumptionDetails: {
            create: toCreate.map((c) => {
              const omitCons = customOmit<
                ConsumptionDetailsApproveInput,
                "isExpiry" | "isBatch"
              >(c, ["isBatch", "isExpiry"]);
              return {
                ...omitCons.rest,
                batchNo: c.isBatch ? c.batchNo : null,
                expiryDate:
                  c.isExpiry && c.expiryDate ? new Date(c.expiryDate) : null,
                createdBy: store?.user?.id,
              };
            }),

            update: toUpdate.map((c) => {
              const omitCons = customOmit<
                ConsumptionDetailsApproveInput,
                "isExpiry" | "isBatch"
              >(c, ["isBatch", "isExpiry"]);
              return {
                where: { id: c.id },
                data: {
                  ...omitCons.rest,
                  batchNo: c.isBatch ? c.batchNo : null,
                  expiryDate:
                    c.isExpiry && c.expiryDate ? new Date(c.expiryDate) : null,
                  updatedBy: store?.user?.id,
                },
              };
            }),
            updateMany: toDelete.map((id) => ({
              where: { id },
              data: {
                isActive: false,
                deletedBy: store?.user?.id,
                deletedAt: new Date(),
              },
            })),
          },
        },
        include: {
          consumptionDetails: {
            where: { isActive: true },
          },
        },
      });

      /*-----------------STOCK ADJUSTMENT LOGIC------------------*/

      for (const detail of approvedConsumption.consumptionDetails) {
        await subItemStock(
          tx,
          {
            itemId: detail.itemId,
            batchNo: detail.batchNo,
            userId: approvedConsumption.requestedBy!,
            expiryDate: detail.expiryDate ?? undefined,
            quantity: detail.consumedQty ?? 0,
          },
          {
            operation: InvOperation.CONSUMPTION,
            refDate: approvedConsumption.date,
            refNo: approvedConsumption.consumptionNo,
            refId: approvedConsumption.id,
            refDetailsId: detail.id,
            refApprovedBy: approvedConsumption.approvedBy,
            refApprovedAt: approvedConsumption.approvedAt,
          },
        );
      }
      logger.info("exiting::approveConsumptionInDb::repository");
      return approvedConsumption;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
}

export async function rejectConsumptionByIdFromDb(
  data: CommonConsumptionInput,
): Promise<void> {
  logger.info("entering::rejectConsumptionByIdFromDb::repository");
  const store = requestStorage.getStore();
  await db.consumption.update({
    where: {
      id: data.id,
    },
    data: {
      status: Consumption_Status.REJECTED,
      description: data.description ? data.description : undefined,
      rejectedBy: store?.user?.id,
      rejectedAt: new Date(),
    },
  });

  logger.info("exiting::rejectConsumptionByIdFromDb::repository");
}

export async function getConsumptionByUserIdFromDb(
  userId: number,
): Promise<ConsumptionResponse[]> {
  logger.info("entering::getConsumptionByUserIdFromDb::repository");
  const consumption = await db.consumption.findMany({
    where: {
      requestedBy: userId,
      isActive: true,
    },
    include: {
      consumptionDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getConsumptionByUserIdFromDb::repository");
  return consumption;
}
